import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { calculatePoints } from '../lib/scoring';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { KNOCKOUT_MATCHES } from '../lib/knockout';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';

interface UserRanking {
  id: string;
  name: string;
  photo: string;
  points: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  cravouPlacar: number;
  acertouVencedor: number;
  naoAcertou: number;
  lastMatchPoints: number;
  lastMatchStatus: 'cravou' | 'acertou' | 'erro' | 'sem_palpite';
  lastMatchPrediction?: { home: number; away: number };
}

export default function RankingPage() {
  const { user: currentUser } = useAuth();
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastMatch, setLastMatch] = useState<any>(null);
  const [lastMatchResult, setLastMatchResult] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch all results
    const unsubResults = onSnapshot(collection(db, 'results'), async (resultsSnapshot) => {
      const results: any = {};
      resultsSnapshot.forEach(doc => results[doc.id] = doc.data());

      // 2. Fetch all data
      try {
        const [predsSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, 'predictions')),
          getDocs(collection(db, 'users'))
        ]);
        
        const allPredictions: any = {};
        predsSnapshot.forEach(doc => allPredictions[doc.id] = doc.data().matches || {});

        // Unificar todas as partidas para obter informações de data e hora
        const allMatches = [
          ...WORLD_CUP_2026_ROUNDS.flatMap(r => r.matches),
          ...KNOCKOUT_MATCHES
        ];

        // Identificar o último jogo concluído (mais recente na linha do tempo)
        let lastCompletedMatchId: string | null = null;
        let lastCompletedMatch: any = null;
        let lastDateTimeStr = '';

        Object.keys(results).forEach(matchId => {
          const matchInfo = allMatches.find(m => m.id === matchId);
          if (matchInfo) {
            const dateTimeStr = `${matchInfo.date}T${matchInfo.time}`;
            if (dateTimeStr > lastDateTimeStr) {
              lastDateTimeStr = dateTimeStr;
              lastCompletedMatchId = matchId;
              lastCompletedMatch = matchInfo;
            }
          }
        });

        if (lastCompletedMatch) {
          setLastMatch(lastCompletedMatch);
          setLastMatchResult(results[lastCompletedMatchId!]);
        } else {
          setLastMatch(null);
          setLastMatchResult(null);
        }

        const rankingList: UserRanking[] = [];

        // Calcular a classificação atual
        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          
          // Apenas mostrar usuários aprovados
          if (userData.approved !== true) return;

          const userId = userDoc.id;
          const userPreds = allPredictions[userId] || {};

          let totalPoints = 0;
          let cravou = 0;
          let acertou = 0;
          let erro = 0;

          Object.entries(userPreds).forEach(([matchId, pred]: any) => {
            const result = results[matchId];
            if (result) {
              const pts = calculatePoints(
                { homeScore: Number(pred.home), awayScore: Number(pred.away) },
                { homeScore: result.home, awayScore: result.away }
              );
              totalPoints += pts;
              if (pts === 3) cravou++;
              else if (pts === 1) acertou++;
              else if (pts === 0) erro++;
            }
          });

          let lastMatchPoints = 0;
          let lastMatchStatus: 'cravou' | 'acertou' | 'erro' | 'sem_palpite' = 'sem_palpite';
          let lastMatchPrediction: any = undefined;

          if (lastCompletedMatchId) {
            const lastPred = userPreds[lastCompletedMatchId];
            const lastResult = results[lastCompletedMatchId];
            if (lastPred && lastResult) {
              lastMatchPrediction = { home: Number(lastPred.home), away: Number(lastPred.away) };
              const pts = calculatePoints(
                { homeScore: lastMatchPrediction.home, awayScore: lastMatchPrediction.away },
                { homeScore: lastResult.home, awayScore: lastResult.away }
              );
              lastMatchPoints = pts;
              if (pts === 3) lastMatchStatus = 'cravou';
              else if (pts === 1) lastMatchStatus = 'acertou';
              else if (pts === 0) lastMatchStatus = 'erro';
            }
          }

          rankingList.push({
            id: userId,
            name: userData.displayName || 'Competidor',
            photo: userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            points: totalPoints,
            trend: 'stable',
            trendValue: 0,
            cravouPlacar: cravou,
            acertouVencedor: acertou,
            naoAcertou: erro,
            lastMatchPoints,
            lastMatchStatus,
            lastMatchPrediction
          });
        });

        // Ordenar classificação atual (pontos DESC, nome ASC)
        rankingList.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return a.name.localeCompare(b.name);
        });

        // Calcular a classificação anterior (excluindo o último jogo concluído)
        const previousRankingList: { id: string; points: number; name: string }[] = [];
        if (lastCompletedMatchId) {
          usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            if (userData.approved !== true) return;

            const userId = userDoc.id;
            const userPreds = allPredictions[userId] || {};

            let prevPoints = 0;
            Object.entries(userPreds).forEach(([matchId, pred]: any) => {
              if (matchId === lastCompletedMatchId) return;

              const result = results[matchId];
              if (result) {
                prevPoints += calculatePoints(
                  { homeScore: Number(pred.home), awayScore: Number(pred.away) },
                  { homeScore: result.home, awayScore: result.away }
                );
              }
            });

            previousRankingList.push({
              id: userId,
              name: userData.displayName || 'Competidor',
              points: prevPoints
            });
          });

          // Ordenar classificação anterior (pontos DESC, nome ASC)
          previousRankingList.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return a.name.localeCompare(b.name);
          });

          // Calcular tendências comparando as posições atual e anterior
          rankingList.forEach((player, indexAtual) => {
            const posAtual = indexAtual + 1;
            const indexAnterior = previousRankingList.findIndex(p => p.id === player.id);
            if (indexAnterior !== -1) {
              const posAnterior = indexAnterior + 1;
              const variacao = posAnterior - posAtual;

              if (variacao > 0) {
                player.trend = 'up';
                player.trendValue = variacao;
              } else if (variacao < 0) {
                player.trend = 'down';
                player.trendValue = Math.abs(variacao);
              } else {
                player.trend = 'stable';
                player.trendValue = 0;
              }
            }
          });
        }

        setRankings(rankingList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rankings:", error);
        setRankings([]);
        setLoading(false);
      }
    });

    return () => unsubResults();
  }, [currentUser]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-primary font-lexend tracking-tighter uppercase">
          Pódio dos <span className="text-white">Vencedores</span>
        </h1>
        <p className="text-white/40 font-medium">Os melhores competidores da rodada</p>
      </div>

      {/* Último Jogo Concluído Banner */}
      {lastMatch && lastMatchResult && (
        <div className="mx-auto max-w-sm glass-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-lg">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
            Último Jogo Concluído
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-bold text-white/80">{lastMatch.homeTeam}</span>
            <span className="text-sm font-black text-white px-2 py-0.5 bg-white/5 rounded-lg border border-white/5">
              {lastMatchResult.home} - {lastMatchResult.away}
            </span>
            <span className="text-xs font-bold text-white/80">{lastMatch.awayTeam}</span>
          </div>
          <span className="text-[8px] font-bold text-white/30 uppercase">
            Data: {lastMatch.date.split('-').reverse().join('/')} às {lastMatch.time}
          </span>
        </div>
      )}

      {/* Podium UI */}
      <div className="flex items-end justify-center gap-2 md:gap-8 pt-12 pb-8">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
                <img src={top3[1].photo} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#adb5bd] text-dark font-black rounded-full border-2 border-dark flex items-center justify-center text-sm">
                2
              </div>
            </div>
            <div className="glass-dark p-4 rounded-2xl w-28 text-center border-white/5 flex flex-col items-center">
              <p className="text-[10px] font-bold text-white/60 truncate w-full">{top3[1].name}</p>
              <p className="text-sm font-black text-primary">{top3[1].points} pts</p>
              
              {/* Informações da última partida */}
              {lastMatch && (
                <div className="flex flex-col items-center gap-1 mt-2 pt-2 border-t border-white/5 w-full">
                  {/* Tendência de posição */}
                  {top3[1].trend === 'up' ? (
                    <span className="text-[8px] font-black text-primary uppercase flex items-center gap-0.5">
                      <TrendingUp size={8} />+{top3[1].trendValue} pos
                    </span>
                  ) : top3[1].trend === 'down' ? (
                    <span className="text-[8px] font-black text-red-500 uppercase flex items-center gap-0.5">
                      <TrendingDown size={8} />-{top3[1].trendValue} pos
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold text-white/40 uppercase flex items-center gap-0.5">
                      <Minus size={8} /> Estável
                    </span>
                  )}
                  {/* Status do palpite */}
                  {top3[1].lastMatchStatus === 'cravou' ? (
                    <span className="text-[8px] font-black text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary/10 uppercase">
                      Cravou
                    </span>
                  ) : top3[1].lastMatchStatus === 'acertou' ? (
                    <span className="text-[8px] font-black text-secondary bg-secondary/10 px-1 py-0.5 rounded border border-secondary/10 uppercase">
                      Acertou
                    </span>
                  ) : top3[1].lastMatchStatus === 'erro' ? (
                    <span className="text-[8px] font-black text-red-400 bg-red-400/10 px-1 py-0.5 rounded border border-red-400/10 uppercase">
                      Errou
                    </span>
                  ) : (
                    <span className="text-[8px] font-medium text-white/30 bg-white/5 px-1 py-0.5 rounded uppercase">
                      Sem Palp.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <div className="flex flex-col items-center gap-4 -translate-y-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-primary overflow-hidden shadow-[0_0_40px_rgba(0,255,133,0.3)]">
                <img src={top3[0].photo} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary">
                <Crown size={32} className="fill-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-dark font-black rounded-full border-2 border-dark flex items-center justify-center text-lg glow-primary">
                1
              </div>
            </div>
            <div className="glass-dark p-6 rounded-[2rem] w-36 text-center border-primary/20 bg-primary/5 flex flex-col items-center">
              <p className="text-xs font-bold text-primary truncate w-full">{top3[0].name}</p>
              <p className="text-xl font-black text-white">{top3[0].points} pts</p>
              
              {/* Informações da última partida */}
              {lastMatch && (
                <div className="flex flex-col items-center gap-1 mt-2.5 pt-2.5 border-t border-white/5 w-full">
                  {/* Tendência de posição */}
                  {top3[0].trend === 'up' ? (
                    <span className="text-[9px] font-black text-primary uppercase flex items-center gap-0.5">
                      <TrendingUp size={9} />+{top3[0].trendValue} pos
                    </span>
                  ) : top3[0].trend === 'down' ? (
                    <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-0.5">
                      <TrendingDown size={9} />-{top3[0].trendValue} pos
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-0.5">
                      <Minus size={9} /> Estável
                    </span>
                  )}
                  {/* Status do palpite */}
                  {top3[0].lastMatchStatus === 'cravou' ? (
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/10 uppercase">
                      Cravou
                    </span>
                  ) : top3[0].lastMatchStatus === 'acertou' ? (
                    <span className="text-[9px] font-black text-secondary bg-secondary/10 px-1.5 py-0.5 rounded border border-secondary/10 uppercase">
                      Acertou
                    </span>
                  ) : top3[0].lastMatchStatus === 'erro' ? (
                    <span className="text-[9px] font-black text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/10 uppercase">
                      Errou
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-white/30 bg-white/5 px-1.5 py-0.5 rounded uppercase">
                      Sem Palp.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
                <img src={top3[2].photo} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#cd7f32] text-dark font-black rounded-full border-2 border-dark flex items-center justify-center text-sm">
                3
              </div>
            </div>
            <div className="glass-dark p-4 rounded-2xl w-28 text-center border-white/5 flex flex-col items-center">
              <p className="text-[10px] font-bold text-white/60 truncate w-full">{top3[2].name}</p>
              <p className="text-sm font-black text-secondary">{top3[2].points} pts</p>
              
              {/* Informações da última partida */}
              {lastMatch && (
                <div className="flex flex-col items-center gap-1 mt-2 pt-2 border-t border-white/5 w-full">
                  {/* Tendência de posição */}
                  {top3[2].trend === 'up' ? (
                    <span className="text-[8px] font-black text-primary uppercase flex items-center gap-0.5">
                      <TrendingUp size={8} />+{top3[2].trendValue} pos
                    </span>
                  ) : top3[2].trend === 'down' ? (
                    <span className="text-[8px] font-black text-red-500 uppercase flex items-center gap-0.5">
                      <TrendingDown size={8} />-{top3[2].trendValue} pos
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold text-white/40 uppercase flex items-center gap-0.5">
                      <Minus size={8} /> Estável
                    </span>
                  )}
                  {/* Status do palpite */}
                  {top3[2].lastMatchStatus === 'cravou' ? (
                    <span className="text-[8px] font-black text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary/10 uppercase">
                      Cravou
                    </span>
                  ) : top3[2].lastMatchStatus === 'acertou' ? (
                    <span className="text-[8px] font-black text-secondary bg-secondary/10 px-1 py-0.5 rounded border border-secondary/10 uppercase">
                      Acertou
                    </span>
                  ) : top3[2].lastMatchStatus === 'erro' ? (
                    <span className="text-[8px] font-black text-red-400 bg-red-400/10 px-1 py-0.5 rounded border border-red-400/10 uppercase">
                      Errou
                    </span>
                  ) : (
                    <span className="text-[8px] font-medium text-white/30 bg-white/5 px-1 py-0.5 rounded uppercase">
                      Sem Palp.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full Ranking List */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Classificação Geral</h2>
          <span className="text-[10px] font-medium text-white/20">Atualizado agora</span>
        </div>

        <div className="space-y-3 px-2">
          {rankings.length > 0 ? (
            rankings.map((player, index) => {
              const isCurrentUser = player.id === currentUser?.uid;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative flex items-center justify-between p-4 rounded-2xl border transition-all
                    ${isCurrentUser ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(0,255,133,0.1)]' : 'glass-dark border-white/5 hover:bg-white/[0.03]'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-sm font-black ${isCurrentUser ? 'text-primary' : 'text-white/40'}`}>
                      {index + 1}º
                    </span>
                    <div className="relative">
                      <img src={player.photo} className="w-10 h-10 rounded-full object-cover" alt="" />
                      {isCurrentUser && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-dark" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white">{player.name}</p>
                        {isCurrentUser && (
                          <span className="text-[8px] font-black bg-primary text-dark px-1.5 py-0.5 rounded uppercase">Você</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {player.trend === 'up' ? (
                          <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase">
                            <TrendingUp size={10} /> Posição: Subiu {player.trendValue} {player.trendValue === 1 ? 'posição' : 'posições'} no último jogo
                          </div>
                        ) : player.trend === 'down' ? (
                          <div className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase">
                            <TrendingDown size={10} /> Posição: Caiu {player.trendValue} {player.trendValue === 1 ? 'posição' : 'posições'} no último jogo
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[9px] font-black text-white/50 uppercase">
                            <Minus size={10} /> Posição: Manteve estável no último jogo
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[9px] font-bold text-white/40 uppercase tracking-wider">
                        <span className="text-primary font-lexend">cravou placar: <span className="font-black text-white">{player.cravouPlacar}</span></span>
                        <span className="text-white/10">•</span>
                        <span className="text-secondary font-lexend">acertou vencedor: <span className="font-black text-white">{player.acertouVencedor}</span></span>
                        <span className="text-white/10">•</span>
                        <span className="text-red-400/80 font-lexend">não acertou: <span className="font-black text-white">{player.naoAcertou}</span></span>
                      </div>

                      {/* Status e Palpite do Último Jogo */}
                      {lastMatch && (
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1.5 text-[9px] font-bold uppercase tracking-wider text-white/45 bg-white/[0.02] px-2 py-1 rounded-lg border border-white/5 w-fit">
                          <span className="text-white/30">Último jogo ({lastMatch.homeTeam} x {lastMatch.awayTeam}):</span>
                          {player.lastMatchStatus === 'cravou' ? (
                            <span className="text-primary font-black">Cravou (+3 pts)</span>
                          ) : player.lastMatchStatus === 'acertou' ? (
                            <span className="text-secondary font-black">Acertou vencedor (+1 pt)</span>
                          ) : player.lastMatchStatus === 'erro' ? (
                            <span className="text-red-400 font-black">Errou (0 pts)</span>
                          ) : (
                            <span className="text-white/30">Sem palpite</span>
                          )}
                          {player.lastMatchPrediction && (
                            <span className="text-white/30 font-medium lowercase">
                              (palpite: {player.lastMatchPrediction.home}x{player.lastMatchPrediction.away})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-black ${isCurrentUser ? 'text-primary' : 'text-white'}`}>{player.points}</p>
                    <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">Pontos</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20 glass-dark rounded-[3rem] border-white/5">
              <p className="text-white/20 font-black uppercase tracking-widest">Nenhum palpite registrado ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
