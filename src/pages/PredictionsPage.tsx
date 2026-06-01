import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { KNOCKOUT_MATCHES } from '../lib/knockout';
import { Calendar, Users, Trophy, Lock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { getFlagUrl } from '../lib/flags';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { isMatchLocked, calculatePoints, getGroupStandings, getKnockoutTeam } from '../lib/scoring';

const TABS = [...WORLD_CUP_2026_ROUNDS.map(r => r.name), "Mata-Mata"];

export default function PredictionsPage() {
  const { user, isApproved } = useAuth();
  const [activeTab, setActiveTab] = useState("1ª Rodada");
  const [viewMode, setViewMode] = useState<'bracket' | 'list'>('bracket');
  const [predictions, setPredictions] = useState<Record<string, { home: any; away: any; qualifier?: 'home' | 'away' }>>({});
  const [results, setResults] = useState<Record<string, { home: any; away: any; qualifier?: 'home' | 'away' }>>({});
  const [loading, setLoading] = useState(true);

  const activeRound = WORLD_CUP_2026_ROUNDS.find(r => r.name === activeTab);
  const standings = getGroupStandings(
    Object.entries(results).reduce((acc: any, [id, res]) => {
      acc[id] = { homeScore: res.home, awayScore: res.away };
      return acc;
    }, {})
  );

  useEffect(() => {
    if (!user) return;

    const unsubResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const data: any = {};
      snapshot.forEach((doc) => data[doc.id] = doc.data());
      setResults(data);
    });

    const unsubPreds = onSnapshot(doc(db, 'predictions', user.uid), (doc) => {
      if (doc.exists()) {
        setPredictions(doc.data().matches || {});
      }
      setLoading(false);
    });

    return () => {
      unsubResults();
      unsubPreds();
    };
  }, [user]);

  const handleSavePrediction = async (matchId: string, home: any, away: any, qualifier?: 'home' | 'away') => {
    if (!user || !isApproved) return;
    try {
      const predObj: any = { home: home === '' ? '' : Number(home), away: away === '' ? '' : Number(away) };
      if (qualifier !== undefined) {
        predObj.qualifier = qualifier;
      }
      const newPredictions = { ...predictions, [matchId]: predObj };
      await setDoc(doc(db, 'predictions', user.uid), { matches: newPredictions }, { merge: true });
    } catch (error) {
      console.error("Error saving prediction:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-dark rounded-[3rem] border-white/5 space-y-6 mt-10">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
          <ShieldCheck className="text-primary w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Aguardando Aprovação</h2>
          <p className="text-white/40 max-w-sm">Seu cadastro foi recebido! O administrador precisa aprovar sua participação para que você possa enviar palpites.</p>
        </div>
        <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Status: Pendente</span>
        </div>
      </div>
    );
  }

  const currentMatches = activeTab === "Mata-Mata" 
    ? KNOCKOUT_MATCHES.map(m => ({
        ...m,
        homeTeam: getKnockoutTeam(standings, m.homePlaceholder, predictions),
        awayTeam: getKnockoutTeam(standings, m.awayPlaceholder, predictions),
        group: m.phase
      }))
    : activeRound?.matches || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
            Meus <span className="text-primary">Palpites</span>
          </h1>
          <p className="text-white/50 font-medium">
            Preencha seus palpites e suba no ranking da galera.
          </p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeTab === tab 
                  ? 'bg-primary text-dark border-primary glow-primary' 
                  : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Mata-Mata" && (
        <div className="flex justify-end items-center gap-2 mb-2 animate-in fade-in duration-300">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Visualização:</span>
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center">
            <button 
              onClick={() => setViewMode('bracket')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'bracket' ? 'bg-primary text-dark font-black font-lexend' : 'text-white/60 hover:text-white font-lexend'}`}
            >
              Chaveamento
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-primary text-dark font-black font-lexend' : 'text-white/60 hover:text-white font-lexend'}`}
            >
              Lista
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === "Mata-Mata" && viewMode === "bracket" ? (
          <motion.div
            key="bracket"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full"
          >
            <KnockoutBracket 
              currentMatches={currentMatches}
              predictions={predictions}
              results={results}
              onSave={handleSavePrediction}
              isAdmin={false}
              standings={standings}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab + "_" + viewMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {currentMatches.map((match, idx) => {
              const showPhase = activeTab === "Mata-Mata" && (idx === 0 || currentMatches[idx-1].group !== match.group);
              
              return (
                <div key={match.id} className="contents">
                  {showPhase && (
                    <h3 className="md:col-span-2 text-xl font-black text-secondary font-lexend uppercase tracking-tight mt-6 border-l-4 border-secondary pl-4">
                      {match.group}
                    </h3>
                  )}
                  <MatchCard 
                    match={match} 
                    prediction={predictions[match.id]}
                    result={results[match.id]}
                    onSave={handleSavePrediction}
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match, prediction, result, onSave }: any) {
  const [home, setHome] = useState(prediction?.home ?? '');
  const [away, setAway] = useState(prediction?.away ?? '');
  const locked = isMatchLocked(match.date, match.time);
  
  useEffect(() => {
    if (prediction) {
      setHome(prediction.home);
      setAway(prediction.away);
    }
  }, [prediction]);

  const points = result && prediction ? calculatePoints(
    { homeScore: Number(prediction.home), awayScore: Number(prediction.away) },
    { homeScore: result.home, awayScore: result.away }
  ) : null;

  return (
    <motion.div 
      whileHover={!locked ? { y: -4 } : {}}
      className={`glass-dark p-6 rounded-[2rem] transition-all group relative overflow-hidden ${locked ? 'opacity-80' : 'hover:border-primary/30'}`}
    >
      {/* Top Status Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grupo {match.group}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {locked ? (
            <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full font-black text-[9px] uppercase tracking-widest border border-red-500/10 flex items-center gap-1.5">
              <Lock size={10} />
              Encerrado
            </div>
          ) : (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full font-black text-[9px] uppercase tracking-widest border border-primary/10 flex items-center gap-1.5">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              Aberto
            </div>
          )}
        </div>
      </div>

      {/* Date & Time Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {match.date.split('-').reverse().slice(0, 2).join('/')}
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <div className="text-white/60">{match.time}</div>
        </div>
      </div>

      {/* Teams and Inputs */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors overflow-hidden relative shadow-inner">
            <img src={getFlagUrl(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-cover scale-110 flag-3d" />
          </div>
          <span className="text-xs font-black text-center leading-tight min-h-[32px] flex items-center uppercase tracking-tight text-white/80">{match.homeTeam}</span>
          <input 
            type="number" 
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={locked}
            placeholder="0"
            className={`w-16 h-14 bg-black/40 border border-white/10 rounded-2xl text-center text-2xl font-black focus:outline-none transition-all ${locked ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
          />
        </div>

        {/* Center Section: X, Result and Points */}
        <div className="flex flex-col items-center justify-center gap-4 min-w-[80px]">
          <div className="text-2xl font-black text-white/10">VS</div>
          
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-white/30 uppercase mb-1">Final</span>
                  <div className="text-lg font-black text-white bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
                    {result.home} - {result.away}
                  </div>
                </div>

                {points !== null && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`px-3 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg ${
                      points === 3 ? 'bg-primary text-dark glow-primary' : 
                      points === 1 ? 'bg-secondary text-dark' : 
                      'bg-white/10 text-white/40 border border-white/10'
                    }`}
                  >
                    <Trophy size={12} />
                    {points} PTS
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:border-secondary/20 transition-colors overflow-hidden relative shadow-inner">
            <img src={getFlagUrl(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-cover scale-110 flag-3d" />
          </div>
          <span className="text-xs font-black text-center leading-tight min-h-[32px] flex items-center uppercase tracking-tight text-white/80">{match.awayTeam}</span>
          <input 
            type="number" 
            value={away}
            onChange={(e) => setAway(e.target.value)}
            disabled={locked}
            placeholder="0"
            className={`w-16 h-14 bg-black/40 border border-white/10 rounded-2xl text-center text-2xl font-black focus:outline-none transition-all ${locked ? 'opacity-50 cursor-not-allowed' : 'focus:border-secondary focus:ring-4 focus:ring-secondary/10'}`}
          />
        </div>
      </div>
      
      {/* Action Footer */}
      <div className="mt-8">
        {!locked && (
          <button 
            onClick={() => onSave(match.id, Number(home), Number(away))}
            className="w-full py-4 rounded-[1.25rem] bg-white/5 hover:bg-primary hover:text-dark text-[11px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2 group/btn shadow-xl active:scale-95"
          >
            {prediction ? (
              <>
                <CheckCircle2 size={16} className="text-primary group-hover/btn:text-dark" />
                Atualizar Palpite
              </>
            ) : (
              <>
                <Trophy size={16} className="text-white/20 group-hover/btn:text-dark" />
                Salvar Palpite
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface KnockoutBracketProps {
  currentMatches: any[];
  predictions: any;
  results: any;
  onSave: any;
  isAdmin: boolean;
  standings: any;
}

function KnockoutBracket({ currentMatches, predictions, results, onSave, isAdmin, standings }: KnockoutBracketProps) {
  const leftMataMata = currentMatches.filter(m => ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'].includes(m.id));
  const rightMataMata = currentMatches.filter(m => ['M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16'].includes(m.id));

  const leftOitavas = currentMatches.filter(m => ['O1', 'O2', 'O3', 'O4'].includes(m.id));
  const rightOitavas = currentMatches.filter(m => ['O5', 'O6', 'O7', 'O8'].includes(m.id));

  const leftQuartas = currentMatches.filter(m => ['Q1', 'Q2'].includes(m.id));
  const rightQuartas = currentMatches.filter(m => ['Q3', 'Q4'].includes(m.id));

  const leftSemi = currentMatches.filter(m => m.id === 'S1');
  const rightSemi = currentMatches.filter(m => m.id === 'S2');

  const finalMatch = currentMatches.find(m => m.id === 'F1');
  const thirdPlaceMatch = currentMatches.find(m => m.id === 'F3');

  return (
    <div className="w-full overflow-x-auto pb-8 scrollbar-thin">
      <div className="flex flex-row justify-between items-center min-w-[1550px] h-[980px] gap-1 px-2 relative">
        
        {/* COL 1: FASE DE 32 (LEFT) */}
        <div className="flex flex-col justify-between h-[920px] w-56 shrink-0 animate-in fade-in slide-in-from-left duration-500">
          {leftMataMata.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>
        
        {/* SVG Connector L1 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            {[0, 1, 2, 3].map(i => {
              const yA = 920 * (4 * i + 1) / 16;
              const yB = 920 * (4 * i + 3) / 16;
              const yC = 920 * (2 * i + 1) / 8;
              return (
                <path key={i} d={`M 0 ${yA} L 20 ${yA} L 20 ${yB} L 0 ${yB} M 20 ${yC} L 40 ${yC}`} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
              );
            })}
          </svg>
        </div>

        {/* COL 2: OITAVAS (LEFT) */}
        <div className="flex flex-col justify-around h-[920px] w-56 shrink-0 animate-in fade-in slide-in-from-left duration-700">
          {leftOitavas.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>

        {/* SVG Connector L2 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            {[0, 1].map(i => {
              const yA = 920 * (2 * i + 1) / 8;
              const yB = 920 * (2 * i + 3) / 8;
              const yC = 920 * (i + 1) / 4;
              return (
                <path key={i} d={`M 0 ${yA} L 20 ${yA} L 20 ${yB} L 0 ${yB} M 20 ${yC} L 40 ${yC}`} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
              );
            })}
          </svg>
        </div>

        {/* COL 3: QUARTAS (LEFT) */}
        <div className="flex flex-col justify-around h-[920px] w-56 shrink-0 animate-in fade-in slide-in-from-left duration-1000">
          {leftQuartas.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>

        {/* SVG Connector L3 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            {(() => {
              const yA = 920 * 1 / 4;
              const yB = 920 * 3 / 4;
              const yC = 920 * 1 / 2;
              return (
                <path d={`M 0 ${yA} L 20 ${yA} L 20 ${yB} L 0 ${yB} M 20 ${yC} L 40 ${yC}`} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
              );
            })()}
          </svg>
        </div>

        {/* COL 4: SEMIFINAL (LEFT) */}
        <div className="flex flex-col justify-around h-[920px] w-56 shrink-0 animate-in fade-in duration-1000">
          {leftSemi.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>

        {/* SVG Connector L4 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            <path d="M 0 460 L 40 460" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* COL 5: CENTER (FINAL, 3RD, TROPHY) */}
        <div className="flex flex-col justify-center items-center h-[920px] w-64 shrink-0 gap-6 animate-in zoom-in duration-700">
          {/* Trophy Section */}
          <div className="flex flex-col items-center text-center gap-1.5 mb-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/10 rounded-full blur-xl animate-pulse" />
              <Trophy size={44} className="text-secondary fill-secondary relative z-10 filter drop-shadow-[0_0_12px_rgba(255,225,109,0.4)] animate-bounce" />
            </div>
            <div>
              <h4 className="text-gradient text-[10px] font-black uppercase tracking-[0.2em] font-lexend">Campeão</h4>
              <div className="mt-1 px-3 py-1.5 glass border border-secondary/20 rounded-xl min-w-[150px] text-center shadow-lg bg-black/40">
                <span className="text-[10px] font-black uppercase tracking-wider text-secondary font-lexend">
                  {finalMatch ? (
                    (() => {
                      const score = results[finalMatch.id] || predictions[finalMatch.id];
                      if (score && score.home !== undefined && score.away !== undefined && score.home !== '' && score.away !== '') {
                        const homeTeam = getKnockoutTeam(standings, finalMatch.homePlaceholder, isAdmin ? results : predictions);
                        const awayTeam = getKnockoutTeam(standings, finalMatch.awayPlaceholder, isAdmin ? results : predictions);
                        const h = Number(score.home);
                        const a = Number(score.away);
                        if (h > a) return homeTeam;
                        if (a > h) return awayTeam;
                        if (h === a) {
                          return score.qualifier === 'away' ? awayTeam : homeTeam;
                        }
                      }
                      return "A Definir";
                    })()
                  ) : "A Definir"}
                </span>
              </div>
            </div>
          </div>

          {/* Final Match */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary font-lexend">Grande Final</span>
            {finalMatch && (
              <BracketMatchCard match={finalMatch} prediction={predictions[finalMatch.id]} result={results[finalMatch.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
            )}
          </div>

          {/* 3rd Place Match */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 font-lexend">Disputa 3º Lugar</span>
            {thirdPlaceMatch && (
              <BracketMatchCard match={thirdPlaceMatch} prediction={predictions[thirdPlaceMatch.id]} result={results[thirdPlaceMatch.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
            )}
          </div>
        </div>

        {/* SVG Connector R4 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            <path d="M 0 460 L 40 460" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* COL 6: SEMIFINAL (RIGHT) */}
        <div className="flex flex-col justify-around h-[920px] w-56 shrink-0 animate-in fade-in duration-1000">
          {rightSemi.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>

        {/* SVG Connector R3 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            {(() => {
              const yA = 920 * 1 / 4;
              const yB = 920 * 3 / 4;
              const yC = 920 * 1 / 2;
              return (
                <path d={`M 40 ${yA} L 20 ${yA} L 20 ${yB} L 40 ${yB} M 20 ${yC} L 0 ${yC}`} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
              );
            })()}
          </svg>
        </div>

        {/* COL 7: QUARTAS (RIGHT) */}
        <div className="flex flex-col justify-around h-[920px] w-56 shrink-0 animate-in fade-in slide-in-from-right duration-1000">
          {rightQuartas.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>

        {/* SVG Connector R2 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            {[0, 1].map(i => {
              const yA = 920 * (2 * i + 1) / 8;
              const yB = 920 * (2 * i + 3) / 8;
              const yC = 920 * (i + 1) / 4;
              return (
                <path key={i} d={`M 40 ${yA} L 20 ${yA} L 20 ${yB} L 40 ${yB} M 20 ${yC} L 0 ${yC}`} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
              );
            })}
          </svg>
        </div>

        {/* COL 8: OITAVAS (RIGHT) */}
        <div className="flex flex-col justify-around h-[920px] w-56 shrink-0 animate-in fade-in slide-in-from-right duration-700">
          {rightOitavas.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>

        {/* SVG Connector R1 */}
        <div className="w-10 h-[920px] relative pointer-events-none shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 920">
            {[0, 1, 2, 3].map(i => {
              const yA = 920 * (4 * i + 1) / 16;
              const yB = 920 * (4 * i + 3) / 16;
              const yC = 920 * (2 * i + 1) / 8;
              return (
                <path key={i} d={`M 40 ${yA} L 20 ${yA} L 20 ${yB} L 40 ${yB} M 20 ${yC} L 0 ${yC}`} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
              );
            })}
          </svg>
        </div>

        {/* COL 9: FASE DE 32 (RIGHT) */}
        <div className="flex flex-col justify-between h-[920px] w-56 shrink-0 animate-in fade-in slide-in-from-right duration-500">
          {rightMataMata.map(m => (
            <BracketMatchCard key={m.id} match={m} prediction={predictions[m.id]} result={results[m.id]} onSave={onSave} isAdmin={isAdmin} standings={standings} />
          ))}
        </div>

      </div>
    </div>
  );
}

interface BracketMatchCardProps {
  match: any;
  prediction: any;
  result: any;
  onSave: any;
  isAdmin: boolean;
  standings?: any;
}

function BracketMatchCard({ match, prediction, result, onSave, isAdmin, standings }: BracketMatchCardProps) {
  const [home, setHome] = useState(prediction?.home ?? '');
  const [away, setAway] = useState(prediction?.away ?? '');
  const [qualifier, setQualifier] = useState<'home' | 'away' | undefined>(prediction?.qualifier);
  const locked = !isAdmin && isMatchLocked(match.date, match.time);

  useEffect(() => {
    setHome(prediction?.home ?? '');
    setAway(prediction?.away ?? '');
    setQualifier(prediction?.qualifier);
  }, [prediction]);

  const handleBlur = () => {
    if (locked) return;
    if (home !== '' && away !== '') {
      let q = qualifier;
      if (Number(home) !== Number(away)) {
        q = undefined;
        setQualifier(undefined);
      } else if (!q) {
        q = 'home';
        setQualifier('home');
      }
      onSave(match.id, home, away, q);
    }
  };

  const handleSelectQualifier = (side: 'home' | 'away') => {
    if (locked) return;
    setQualifier(side);
    if (home !== '' && away !== '') {
      onSave(match.id, home, away, side);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const points = !isAdmin && result && prediction ? calculatePoints(
    { homeScore: Number(prediction.home), awayScore: Number(prediction.away) },
    { homeScore: result.home, awayScore: result.away }
  ) : null;

  const isHomePlaceholder = !match.homeTeam || match.homeTeam.startsWith('2º') || match.homeTeam.startsWith('1º') || match.homeTeam.startsWith('3º') || match.homeTeam.startsWith('Vencedor') || match.homeTeam.startsWith('Perdedor');
  const isAwayPlaceholder = !match.awayTeam || match.awayTeam.startsWith('2º') || match.awayTeam.startsWith('1º') || match.awayTeam.startsWith('3º') || match.awayTeam.startsWith('Vencedor') || match.awayTeam.startsWith('Perdedor');

  const showQualifier = home !== '' && away !== '' && Number(home) === Number(away);

  return (
    <div 
      className={`glass-dark p-2.5 rounded-2xl border transition-all duration-300 w-56 relative flex flex-col gap-1.5 ${
        locked ? 'opacity-75' : 'hover:border-primary/30'
      } ${
        points === 3 ? 'border-primary/50 bg-primary/[0.03]' :
        points === 1 ? 'border-secondary/50 bg-secondary/[0.03]' :
        points === 0 ? 'border-red-500/20 bg-red-500/[0.01]' :
        'border-white/5'
      }`}
    >
      {/* Tiny Header */}
      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-white/40">
        <span className="font-lexend">Jogo {match.id}</span>
        <span className="font-lexend">{match.date.split('-').reverse().slice(0, 2).join('/')} {match.time}</span>
      </div>

      {/* Teams and Inputs */}
      <div className="flex flex-col gap-1">
        {/* Home Row */}
        <div className={`flex items-center justify-between p-1 rounded-xl transition-all ${qualifier === 'home' ? 'bg-white/5' : ''}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isHomePlaceholder ? (
              <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-white/30">?</div>
            ) : (
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 relative flag-3d flex items-center justify-center shrink-0">
                <img src={getFlagUrl(match.homeTeam)} className="w-full h-full object-cover scale-110" alt="" />
              </div>
            )}
            <span className={`text-[10px] font-bold truncate flex-1 ${
              isHomePlaceholder ? 'text-white/30 italic font-medium' : 
              qualifier === 'home' ? 'text-secondary font-black' : 'text-white/80'
            }`}>
              {match.homeTeam}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {showQualifier && (
              <button 
                onClick={() => handleSelectQualifier('home')}
                className={`p-0.5 rounded transition-all ${qualifier === 'home' ? 'text-secondary animate-pulse' : 'text-white/10 hover:text-white/40'}`}
                disabled={locked}
                title="Venceu no desempate/pênaltis"
              >
                <Trophy size={10} className={qualifier === 'home' ? 'fill-secondary' : ''} />
              </button>
            )}
            <input 
              type="number"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={locked}
              placeholder="0"
              className={`w-8 h-7 bg-black/40 border border-white/10 rounded-lg text-center font-black text-xs text-white focus:outline-none transition-all ${
                locked ? 'opacity-50 cursor-not-allowed border-none' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'
              }`}
            />
          </div>
        </div>

        {/* Away Row */}
        <div className={`flex items-center justify-between p-1 rounded-xl transition-all ${qualifier === 'away' ? 'bg-white/5' : ''}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isAwayPlaceholder ? (
              <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-white/30">?</div>
            ) : (
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 relative flag-3d flex items-center justify-center shrink-0">
                <img src={getFlagUrl(match.awayTeam)} className="w-full h-full object-cover scale-110" alt="" />
              </div>
            )}
            <span className={`text-[10px] font-bold truncate flex-1 ${
              isAwayPlaceholder ? 'text-white/30 italic font-medium' : 
              qualifier === 'away' ? 'text-secondary font-black' : 'text-white/80'
            }`}>
              {match.awayTeam}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {showQualifier && (
              <button 
                onClick={() => handleSelectQualifier('away')}
                className={`p-0.5 rounded transition-all ${qualifier === 'away' ? 'text-secondary animate-pulse' : 'text-white/10 hover:text-white/40'}`}
                disabled={locked}
                title="Venceu no desempate/pênaltis"
              >
                <Trophy size={10} className={qualifier === 'away' ? 'fill-secondary' : ''} />
              </button>
            )}
            <input 
              type="number"
              value={away}
              onChange={(e) => setAway(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={locked}
              placeholder="0"
              className={`w-8 h-7 bg-black/40 border border-white/10 rounded-lg text-center font-black text-xs text-white focus:outline-none transition-all ${
                locked ? 'opacity-50 cursor-not-allowed border-none' : 'focus:border-secondary focus:ring-1 focus:ring-secondary/20'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Footer Point Status & Locks */}
      {!isAdmin && (result || locked) && (
        <div className="border-t border-white/5 pt-1.5 flex justify-between items-center">
          {result ? (
            <span className="text-[7px] font-black uppercase text-white/30 font-lexend">
              Oficial: {result.home}-{result.away} {result.qualifier ? `(${result.qualifier === 'home' ? 'H' : 'A'})` : ''}
            </span>
          ) : (
            <span className="text-[7px] font-black uppercase text-red-500 flex items-center gap-0.5"><Lock size={6} /> Fechado</span>
          )}
          
          {points !== null && (
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${
              points === 3 ? 'bg-primary text-dark shadow-[0_0_10px_rgba(0,148,64,0.3)] font-lexend' :
              points === 1 ? 'bg-secondary text-dark font-lexend' :
              'bg-white/10 text-white/40 font-lexend'
            }`}>
              +{points} PTS
            </span>
          )}
        </div>
      )}
    </div>
  );
}
