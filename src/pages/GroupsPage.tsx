import { motion } from 'motion/react';
import { WORLD_CUP_2026_GROUPS } from '../lib/groups';
import { Users, ShieldCheck, TrendingUp } from 'lucide-react';

export default function GroupsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
          Grupos <span className="text-primary italic">Oficiais</span>
        </h1>
        <p className="text-white/50 font-medium">
          Confira a composição de todas as seleções na fase de grupos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {WORLD_CUP_2026_GROUPS.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass-dark rounded-[2rem] overflow-hidden border-white/5 hover:border-primary/20 transition-all group"
          >
            {/* Group Header */}
            <div className="bg-white/5 p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-lexend font-black text-xl text-white tracking-tight">
                {group.name}
              </h2>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Teams List */}
            <div className="p-6 space-y-4">
              {group.teams.map((team, tIndex) => (
                <div key={team} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center group-hover/item:border-primary/30 transition-colors">
                      <Users className="w-4 h-4 text-white/20 group-hover/item:text-primary transition-colors" />
                    </div>
                    <span className="font-bold text-white/80 group-hover/item:text-white transition-colors">{team}</span>
                  </div>
                  {/* Placeholder for standing/rank */}
                  <div className="text-[10px] font-black text-white/10 uppercase tracking-widest">
                    Rank #0{tIndex + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Group Footer Actions */}
            <div className="px-6 pb-6 pt-2">
              <button className="w-full py-3 rounded-xl bg-primary/5 hover:bg-primary text-primary hover:text-dark text-[10px] font-black uppercase tracking-widest transition-all border border-primary/10">
                Ver Classificação
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
