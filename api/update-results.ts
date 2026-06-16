import { Request, Response } from 'express';
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { WORLD_CUP_2026_ROUNDS } from '../src/lib/matches';
import { KNOCKOUT_MATCHES } from '../src/lib/knockout';
import { getGroupStandings, getKnockoutTeam } from '../src/lib/scoring';

// Dicionário de Tradução dos nomes das equipes Inglês -> Português (Copa 2026)
const TEAM_TRANSLATIONS: Record<string, string> = {
  "Mexico": "México",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  "Czech Republic": "República Tcheca",
  "Czechia": "República Tcheca",
  "Canada": "Canadá",
  "Bosnia and Herzegovina": "Bósnia",
  "Bosnia": "Bósnia",
  "USA": "Estados Unidos",
  "United States": "Estados Unidos",
  "Paraguay": "Paraguai",
  "Qatar": "Catar",
  "Switzerland": "Suíça",
  "Brazil": "Brasil",
  "Morocco": "Marrocos",
  "Haiti": "Haiti",
  "Scotland": "Escócia",
  "Australia": "Austrália",
  "Turkey": "Turquia",
  "Türkiye": "Turquia",
  "Germany": "Alemanha",
  "Curaçao": "Curaçau",
  "Curacao": "Curaçau",
  "Ivory Coast": "Costa do Marfim",
  "Cote d'Ivoire": "Costa do Marfim",
  "Côte d'Ivoire": "Costa do Marfim",
  "Ecuador": "Equador",
  "Netherlands": "Holanda",
  "Japan": "Japão",
  "Sweden": "Suécia",
  "Tunisia": "Tunísia",
  "Spain": "Espanha",
  "Cape Verde": "Cabo Verde",
  "Belgium": "Bélgica",
  "Egypt": "Egito",
  "Iran": "Irã",
  "New Zealand": "Nova Zelândia",
  "Saudi Arabia": "Arábia Saudita",
  "Uruguay": "Uruguai",
  "France": "França",
  "Senegal": "Senegal",
  "Iraq": "Iraque",
  "Norway": "Noruega",
  "Argentina": "Argentina",
  "Algeria": "Argélia",
  "Austria": "Áustria",
  "Jordan": "Jordânia",
  "Portugal": "Portugal",
  "Congo": "Congo",
  "DR Congo": "Congo",
  "Republic of the Congo": "Congo",
  "England": "Inglaterra",
  "Croatia": "Croácia",
  "Ghana": "Gana",
  "Panama": "Panamá",
  "Uzbekistan": "Uzbequistão",
  "Colombia": "Colômbia"
};

export default async function handler(req: Request, res: Response) {
  // Apenas permitir requisições GET ou POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(455).json({ error: 'Método não permitido' });
  }

  // 1. Validar Token de Segurança (CRON_SECRET)
  const querySecret = req.query.secret;
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  const configuredSecret = process.env.CRON_SECRET;

  if (configuredSecret && querySecret !== configuredSecret && token !== configuredSecret) {
    return res.status(401).json({ error: 'Não autorizado. Token de segurança inválido.' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Configuração incorreta: API_KEY não definida no servidor.' });
  }

  try {
    // 2. Inicializar Firebase (Suporte Híbrido: Admin SDK ou Client SDK)
    let db: any;
    let isUsingAdmin = false;
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountEnv) {
      try {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        if (!getAdminApps().length) {
          initAdminApp({
            credential: cert(serviceAccount)
          });
        }
        db = getAdminFirestore();
        isUsingAdmin = true;
        console.log('Firebase inicializado usando Admin SDK (Acesso Irrestrito).');
      } catch (err: any) {
        console.error('Falha ao inicializar Firebase Admin SDK, usando Client SDK:', err.message);
      }
    }

    if (!isUsingAdmin) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
      console.log('Firebase inicializado usando Client SDK (Pode exigir regras públicas no Firestore).');
    }

    // 3. Obter resultados salvos atualmente do Firestore
    const currentResults: Record<string, { home: number; away: number; qualifier?: 'home' | 'away' }> = {};
    
    if (isUsingAdmin) {
      const snapshot = await db.collection('results').get();
      snapshot.forEach((docSnap: any) => {
        currentResults[docSnap.id] = docSnap.data();
      });
    } else {
      const resultsSnapshot = await getDocs(collection(db, 'results'));
      resultsSnapshot.forEach((docSnap) => {
        currentResults[docSnap.id] = docSnap.data() as any;
      });
    }

    // 4. Calcular standings e resolver confrontos de mata-mata atuais para mapeamento de seleções
    const standingsResults = Object.entries(currentResults).reduce((acc: any, [id, r]) => {
      acc[id] = { homeScore: r.home, awayScore: r.away };
      return acc;
    }, {});

    const standings = getGroupStandings(standingsResults);

    const resolvedKnockoutMatches = KNOCKOUT_MATCHES.map(m => ({
      ...m,
      homeTeam: getKnockoutTeam(standings, m.homePlaceholder, currentResults),
      awayTeam: getKnockoutTeam(standings, m.awayPlaceholder, currentResults)
    }));

    // 5. Buscar os dados das partidas da API do football-data.org
    const apiResponse = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: {
        'X-Auth-Token': apiKey
      }
    });

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ 
        error: `Erro ao buscar dados na API football-data.org: ${apiResponse.statusText}` 
      });
    }

    const data = await apiResponse.json();
    const apiMatches = data.matches || [];

    let updatedCount = 0;
    const updatedMatches: string[] = [];

    // 6. Percorrer os jogos da API e atualizar o Firestore se necessário
    for (const apiMatch of apiMatches) {
      // Sincronizar apenas partidas em andamento (IN_PLAY) ou finalizadas (FINISHED)
      if (!['FINISHED', 'IN_PLAY'].includes(apiMatch.status)) {
        continue;
      }

      const apiHomeName = apiMatch.homeTeam?.name;
      const apiAwayName = apiMatch.awayTeam?.name;
      if (!apiHomeName || !apiAwayName) continue;

      // Traduzir para português
      const translatedHome = TEAM_TRANSLATIONS[apiHomeName] || apiHomeName;
      const translatedAway = TEAM_TRANSLATIONS[apiAwayName] || apiAwayName;

      let matchedLocalId: string | null = null;

      // Tenta encontrar o jogo na fase de grupos
      for (const round of WORLD_CUP_2026_ROUNDS) {
        const found = round.matches.find(
          m => (m.homeTeam === translatedHome && m.awayTeam === translatedAway) ||
               (m.homeTeam === translatedAway && m.awayTeam === translatedHome)
        );
        if (found) {
          matchedLocalId = found.id;
          break;
        }
      }

      // Se não achou em grupos, tenta encontrar no mata-mata resolvido
      if (!matchedLocalId) {
        const found = resolvedKnockoutMatches.find(
          m => (m.homeTeam === translatedHome && m.awayTeam === translatedAway) ||
               (m.homeTeam === translatedAway && m.awayTeam === translatedHome)
        );
        if (found) {
          matchedLocalId = found.id;
        }
      }

      // Se o confronto foi identificado na nossa estrutura
      if (matchedLocalId) {
        const apiHomeScore = apiMatch.score?.fullTime?.home;
        const apiAwayScore = apiMatch.score?.fullTime?.away;

        if (apiHomeScore !== null && apiAwayScore !== null && apiHomeScore !== undefined && apiAwayScore !== undefined) {
          const currentRes = currentResults[matchedLocalId];

          // Determinar classificado para jogos de mata-mata
          let qualifier: 'home' | 'away' | undefined = undefined;
          const isKnockout = matchedLocalId.startsWith('M') || 
                             matchedLocalId.startsWith('O') || 
                             matchedLocalId.startsWith('Q') || 
                             matchedLocalId.startsWith('S') || 
                             matchedLocalId.startsWith('F');

          if (isKnockout) {
            if (apiMatch.score?.winner === 'HOME_TEAM') {
              qualifier = 'home';
            } else if (apiMatch.score?.winner === 'AWAY_TEAM') {
              qualifier = 'away';
            }
          }

          // Verificar se houve alteração de placar ou se ainda não foi salvo
          const scoreChanged = !currentRes || 
                               currentRes.home !== apiHomeScore || 
                               currentRes.away !== apiAwayScore ||
                               (isKnockout && currentRes.qualifier !== qualifier);

          if (scoreChanged) {
            const updateData: any = {
              home: Number(apiHomeScore),
              away: Number(apiAwayScore)
            };
            if (qualifier !== undefined) {
              updateData.qualifier = qualifier;
            }

            // Salvar no Firestore (Com suporte ao Admin SDK ou Client SDK)
            if (isUsingAdmin) {
              await db.collection('results').doc(matchedLocalId).set(updateData);
            } else {
              await setDoc(doc(db, 'results', matchedLocalId), updateData);
            }

            // Atualizar cache de resultados locais da iteração
            currentResults[matchedLocalId] = updateData;

            // Se for mata-mata, precisamos recalcular os classificados imediatamente
            // para que a resolução de próximos confrontos no loop encontre os times corretos
            if (isKnockout) {
              const updatedStandingsResults = Object.entries(currentResults).reduce((acc: any, [id, r]) => {
                acc[id] = { homeScore: r.home, awayScore: r.away };
                return acc;
              }, {});
              const newStandings = getGroupStandings(updatedStandingsResults);

              for (let i = 0; i < resolvedKnockoutMatches.length; i++) {
                const m = resolvedKnockoutMatches[i];
                resolvedKnockoutMatches[i] = {
                  ...m,
                  homeTeam: getKnockoutTeam(newStandings, m.homePlaceholder, currentResults),
                  awayTeam: getKnockoutTeam(newStandings, m.awayPlaceholder, currentResults)
                };
              }
            }

            updatedCount++;
            updatedMatches.push(`${matchedLocalId}: ${translatedHome} ${apiHomeScore} x ${apiAwayScore} ${translatedAway}${qualifier ? ` (Classificado: ${qualifier === 'home' ? translatedHome : translatedAway})` : ''}`);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      updatedCount,
      updatedMatches
    });

  } catch (error: any) {
    console.error('Erro na sincronização automática:', error);
    return res.status(500).json({ 
      error: 'Erro interno durante a atualização automática.', 
      details: error.message 
    });
  }
}
