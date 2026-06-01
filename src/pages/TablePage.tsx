import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { getFlagUrl } from '../lib/flags';
import { Save, Lock, Edit3, Trash2, Trophy } from 'lucide-react';
import { KNOCKOUT_MATCHES } from '../lib/knockout';
import { getKnockoutTeam, getGroupStandings, isMatchLocked, calculatePoints } from '../lib/scoring';

const TABS = [...WORLD_CUP_2026_ROUNDS.map(r => r.name), "Mata-Mata"];

export default function TablePage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("1ª Rodada");
  const [viewMode, setViewMode] = useState<'bracket' | 'list'>('bracket');
  const [results, setResults] = useState<Record<string, { home: any; away: any; qualifier?: 'home' | 'away' }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'results'), (snapshot) => {
      const data: any = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setResults(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSaveResult = async (matchId: string, home: any, away: any, qualifier?: 'home' | 'away') => {
    if (home === '' || away === '') return;
    try {
      const resultObj: any = { home: Number(home), away: Number(away) };
      if (qualifier !== undefined) {
        resultObj.qualifier = qualifier;
      }
      await setDoc(doc(db, 'results', matchId), resultObj);
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const handleResetResult = async (matchId: string) => {
    if (!confirm("Tem certeza que deseja resetar o resultado deste jogo?")) return;
    try {
      await deleteDoc(doc(db, 'results', matchId));
    } catch (error) {
      console.error("Error resetting result:", error);
    }
  };

  const activeRound = WORLD_CUP_2026_ROUNDS.find(r => r.name === activeTab);
  const standings = getGroupStandings(
    Object.entries(results).reduce((acc: any, [id, res]) => {
      acc[id] = { homeScore: res.home, awayScore: res.away };
      return acc;
    }, {})
  );

  const currentMatches = activeTab === "Mata-Mata" 
    ? KNOCKOUT_MATCHES.map(m => ({
        ...m,
        homeTeam: getKnockoutTeam(standings, m.homePlaceholder, results),
        awayTeam: getKnockoutTeam(standings, m.awayPlaceholder, results),
        group: m.phase
      }))
    : activeRound?.matches || [];

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
            Tabela de <span className="text-primary">Resultados</span>
          </h1>
          <p className="text-white/50 font-medium">
            {isAdmin ? 'Área do Administrador: Insira os resultados oficiais.' : 'Acompanhe os resultados oficiais de cada partida.'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeTab === tab 
                    ? 'bg-primary text-dark border-primary glow-primary' 
                    : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="hidden lg:flex bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 text-xs font-black uppercase tracking-widest items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Modo Edição
            </div>
          )}
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
              predictions={results}
              results={results}
              onSave={handleSaveResult}
              isAdmin={isAdmin}
              standings={standings}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab + "_" + viewMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Desktop Table View */}
            <div className="hidden md:block glass-dark rounded-[2.5rem] overflow-hidden border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Data/Hora</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Confronto & Placar Oficial</th>
                    {isAdmin && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Ação</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentMatches.map((match) => (
                    <ResultRow 
                      key={match.id} 
                      match={match} 
                      isAdmin={isAdmin} 
                      savedResult={results[match.id]} 
                      onSave={handleSaveResult}
                      onReset={handleResetResult}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
              {currentMatches.map((match) => (
                <ResultCard
                  key={match.id}
                  match={match}
                  isAdmin={isAdmin}
                  savedResult={results[match.id]}
                  onSave={handleSaveResult}
                  onReset={handleResetResult}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ match, isAdmin, savedResult, onSave, onReset }: any) {
  const [home, setHome] = useState(savedResult?.home ?? '');
  const [away, setAway] = useState(savedResult?.away ?? '');

  useEffect(() => {
    setHome(savedResult?.home ?? '');
    setAway(savedResult?.away ?? '');
  }, [savedResult]);

  return (
    <div className="glass-dark p-6 rounded-[2rem] border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Grupo {match.group}
        </span>
        <div className="text-right">
          <p className="text-xs font-bold text-white/80">{match.date.split('-').reverse().join('/')}</p>
          <p className="text-[10px] font-medium text-white/40 uppercase">{match.time}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center gap-2">
          <img src={getFlagUrl(match.homeTeam)} className="w-10 h-6 object-cover rounded shadow-sm flag-3d" alt="" />
          <span className="text-xs font-bold text-white text-center line-clamp-1">{match.homeTeam}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <input 
                type="number" value={home} onChange={(e) => setHome(e.target.value)}
                className="w-10 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black text-sm text-white"
              />
              <span className="text-white/20">-</span>
              <input 
                type="number" value={away} onChange={(e) => setAway(e.target.value)}
                className="w-10 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black text-sm text-white"
              />
            </div>
          ) : (
            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
              <span className="text-lg font-black text-white">{savedResult?.home ?? '-'}</span>
              <span className="text-white/20">-</span>
              <span className="text-lg font-black text-white">{savedResult?.away ?? '-'}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <img src={getFlagUrl(match.awayTeam)} className="w-10 h-6 object-cover rounded shadow-sm flag-3d" alt="" />
          <span className="text-xs font-bold text-white text-center line-clamp-1">{match.awayTeam}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <button 
            onClick={() => onSave(match.id, home, away)}
            className="flex-1 py-3 bg-primary text-dark rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all"
          >
            <Save size={14} /> Salvar
          </button>
          <button 
            onClick={() => onReset(match.id)}
            className="px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ResultRow({ match, isAdmin, savedResult, onSave, onReset }: any) {
  const [home, setHome] = useState(savedResult?.home ?? '');
  const [away, setAway] = useState(savedResult?.away ?? '');

  useEffect(() => {
    setHome(savedResult?.home ?? '');
    setAway(savedResult?.away ?? '');
  }, [savedResult]);

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white/80">{match.date.split('-').reverse().join('/')}</span>
          <span className="text-[10px] font-medium text-white/40 uppercase">{match.time}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1 w-24">
            <img src={getFlagUrl(match.homeTeam)} className="w-8 h-5 object-cover rounded-sm shadow-sm flag-3d" alt="" />
            <span className="text-[10px] font-bold text-white/60 text-center truncate w-full">{match.homeTeam}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <input 
                  type="number" 
                  value={home} 
                  onChange={(e) => setHome(e.target.value)}
                  className="w-10 h-9 bg-black/40 border border-white/10 rounded-lg text-center font-black focus:border-primary transition-all text-white text-sm"
                />
                <span className="text-white/20">-</span>
                <input 
                  type="number" 
                  value={away} 
                  onChange={(e) => setAway(e.target.value)}
                  className="w-10 h-9 bg-black/40 border border-white/10 rounded-lg text-center font-black focus:border-primary transition-all text-white text-sm"
                />
              </>
            ) : (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-base font-black text-white">{savedResult?.home ?? '-'}</span>
                <span className="text-white/20">-</span>
                <span className="text-base font-black text-white">{savedResult?.away ?? '-'}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 w-24">
            <img src={getFlagUrl(match.awayTeam)} className="w-8 h-5 object-cover rounded-sm shadow-sm flag-3d" alt="" />
            <span className="text-[10px] font-bold text-white/60 text-center truncate w-full">{match.awayTeam}</span>
          </div>
        </div>
      </td>
      {isAdmin && (
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => onSave(match.id, home, away)}
              className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-dark transition-all border border-primary/10"
              title="Salvar"
            >
              <Save size={18} />
            </button>
            <button 
              onClick={() => onReset(match.id)}
              className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
              title="Resetar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      )}
    </tr>
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

