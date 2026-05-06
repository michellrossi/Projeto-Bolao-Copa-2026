import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WORLD_CUP_2026_ROUNDS, Round } from '../lib/matches';
import { Calendar, Users, Trophy, ChevronRight } from 'lucide-react';

export default function PredictionsPage() {
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const activeRound = WORLD_CUP_2026_ROUNDS[activeRoundIndex];

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
            <MatchCard key={match.id} match={match} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match }: { match: any }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-dark p-6 rounded-[2rem] border-white/5 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grupo {match.group}</span>
        </div>
        <div className="flex items-center gap-3 text-white/40 text-xs font-bold uppercase tracking-wider">
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
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors">
            <Users className="w-7 h-7 text-white/20 group-hover:text-primary/40 transition-colors" />
          </div>
          <span className="text-sm font-bold text-center leading-tight min-h-[40px] flex items-center">{match.homeTeam}</span>
          <input 
            type="number" 
            placeholder="0"
            className="w-16 h-12 bg-black/40 border border-white/10 rounded-xl text-center text-xl font-black focus:outline-none focus:border-primary transition-all focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="text-xl font-black text-white/20 italic">X</div>
          <Trophy className="w-4 h-4 text-secondary/20" />
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-secondary/20 transition-colors">
            <Users className="w-7 h-7 text-white/20 group-hover:text-secondary/40 transition-colors" />
          </div>
          <span className="text-sm font-bold text-center leading-tight min-h-[40px] flex items-center">{match.awayTeam}</span>
          <input 
            type="number" 
            placeholder="0"
            className="w-16 h-12 bg-black/40 border border-white/10 rounded-xl text-center text-xl font-black focus:outline-none focus:border-secondary transition-all focus:ring-4 focus:ring-secondary/10"
          />
        </div>
      </div>
      
      <button className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-all border border-white/5">
        Salvar Palpite
      </button>
    </motion.div>
  );
}
