import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { Calendar, Users, Trophy, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getFlagUrl } from '../lib/flags';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { isMatchLocked, calculatePoints } from '../lib/scoring';

export default function PredictionsPage() {
  const { user } = useAuth();
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [results, setResults] = useState<Record<string, { home: number; away: number }>>({});
  const [loading, setLoading] = useState(true);

  const activeRound = WORLD_CUP_2026_ROUNDS[activeRoundIndex];

  useEffect(() => {
    if (!user) return;

    // Listen to results
    const unsubResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const data: any = {};
      snapshot.forEach((doc) => data[doc.id] = doc.data());
      setResults(data);
    });

    // Listen to user predictions
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
    if (!user) return;
    
    try {
      const newPredictions = {
        ...predictions,
        [matchId]: { home, away }
      };
      await setDoc(doc(db, 'predictions', user.uid), { matches: newPredictions }, { merge: true });
    } catch (error) {
      console.error("Error saving prediction:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
            Meus <span className="text-primary italic">Palpites</span>
          </h1>
          <p className="text-white/50 font-medium">
            Preencha seus palpites e suba no ranking da galera.
          </p>
        </div>
        
        {/* Round Filter Tabs */}
        <div className="flex p-1.5 glass rounded-2xl gap-1">
          {WORLD_CUP_2026_ROUNDS.map((round, index) => (
            <button
              key={round.name}
              onClick={() => setActiveRoundIndex(index)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative
                ${activeRoundIndex === index ? 'text-dark' : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              {activeRoundIndex === index && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {round.name}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeRound.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {activeRound.matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              prediction={predictions[match.id]}
              result={results[match.id]}
              onSave={handleSavePrediction}
            />
          ))}
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
      {/* Status Badges */}
      <div className="absolute top-0 right-0 flex items-center">
        {prediction && !result && (
          <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-bl-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1 border-l border-b border-white/5">
            <CheckCircle2 size={10} />
            Salvo
          </div>
        )}
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
            {new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <div className="font-lexend text-white/60">{match.time}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors overflow-hidden">
            <img src={getFlagUrl(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-cover scale-110" />
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
          <div className="text-xl font-black text-white/20 italic">X</div>
          {result && (
            <div className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">
              {result.home} - {result.away}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-secondary/20 transition-colors overflow-hidden">
            <img src={getFlagUrl(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-cover scale-110" />
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
