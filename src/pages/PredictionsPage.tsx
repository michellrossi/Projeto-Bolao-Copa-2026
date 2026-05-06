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
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [results, setResults] = useState<Record<string, { home: number; away: number }>>({});
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

  const handleSavePrediction = async (matchId: string, home: number, away: number) => {
    if (!user || !isApproved) return;
    try {
      const newPredictions = { ...predictions, [matchId]: { home, away } };
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
        homeTeam: getKnockoutTeam(standings, m.homePlaceholder, {} as any),
        awayTeam: getKnockoutTeam(standings, m.awayPlaceholder, {} as any),
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {currentMatches.map((match, idx) => {
            const showPhase = activeTab === "Mata-Mata" && (idx === 0 || currentMatches[idx-1].group !== match.group);
            
            return (
              <div key={match.id} className={showPhase ? "md:col-span-2 space-y-4" : ""}>
                {showPhase && (
                  <h3 className="text-xl font-black text-secondary font-lexend uppercase tracking-tight mt-6 border-l-4 border-secondary pl-4">
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
      <div className="absolute top-0 right-0 flex items-center">
        {points !== null && (
          <div className={`px-4 py-2 rounded-bl-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ${points === 3 ? 'bg-primary text-dark' : points === 1 ? 'bg-secondary text-dark' : 'bg-white/10 text-white/40'}`}>
            <Trophy size={14} />
            +{points} Pontos
          </div>
        )}
        {locked && points === null && (
          <div className="px-4 py-2 bg-red-500/20 text-red-500 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-l border-b border-red-500/10">
            <Lock size={12} />
            Encerrado
          </div>
        )}
        {!locked && (
          <div className="px-4 py-2 bg-primary/10 text-primary rounded-bl-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-l border-b border-primary/10">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Aberto
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grupo {match.group}</span>
        </div>
        <div className="flex items-center gap-3 text-white/40 text-xs font-bold uppercase tracking-wider mr-20">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {match.date.split('-').reverse().slice(0, 2).join('/')}
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <div className="font-lexend text-white/60">{match.time}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors overflow-hidden">
            <img src={getFlagUrl(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-cover scale-110 flag-3d" />
          </div>
          <span className="text-sm font-bold text-center leading-tight min-h-[40px] flex items-center">{match.homeTeam}</span>
          <input 
            type="number" 
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={locked}
            placeholder="0"
            className={`w-16 h-12 bg-black/40 border border-white/10 rounded-xl text-center text-xl font-black focus:outline-none transition-all ${locked ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="text-xl font-black text-white/20">X</div>
          {result && (
            <div className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">
              {result.home} - {result.away}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-secondary/20 transition-colors overflow-hidden">
            <img src={getFlagUrl(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-cover scale-110 flag-3d" />
          </div>
          <span className="text-sm font-bold text-center leading-tight min-h-[40px] flex items-center">{match.awayTeam}</span>
          <input 
            type="number" 
            value={away}
            onChange={(e) => setAway(e.target.value)}
            disabled={locked}
            placeholder="0"
            className={`w-16 h-12 bg-black/40 border border-white/10 rounded-xl text-center text-xl font-black focus:outline-none transition-all ${locked ? 'opacity-50 cursor-not-allowed' : 'focus:border-secondary focus:ring-4 focus:ring-secondary/10'}`}
          />
        </div>
      </div>
      
      {!locked && (
        <button 
          onClick={() => onSave(match.id, Number(home), Number(away))}
          className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-primary hover:text-dark text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2 group/btn"
        >
          {prediction ? (
            <>
              <CheckCircle2 size={14} className="text-primary group-hover/btn:text-dark" />
              Atualizar Palpite
            </>
          ) : (
            'Salvar Palpite'
          )}
        </button>
      )}

      {locked && !result && (
        <div className="mt-6 w-full py-3 rounded-xl bg-white/5 text-white/20 text-[10px] font-black uppercase tracking-widest border border-white/5 flex items-center justify-center gap-2">
          <AlertCircle size={14} />
          Palpites Encerrados
        </div>
      )}
    </motion.div>
  );
}
