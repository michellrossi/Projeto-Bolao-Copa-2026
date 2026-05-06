import { useState, useEffect } from 'react';
import { Menu, User, Bell, LogOut, Clock, AlertTriangle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const checkUpcomingMatches = () => {
      const now = new Date();
      const upcoming: any[] = [];
      
      WORLD_CUP_2026_ROUNDS.flatMap(r => r.matches).forEach(match => {
        const matchTime = new Date(`${match.date}T${match.time}`);
        const diffInMs = matchTime.getTime() - now.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));

        // Alert if match starts in 31 to 90 minutes (warning about the 30-min lock)
        if (diffInMins > 30 && diffInMins <= 90) {
          upcoming.push({
            id: match.id,
            title: `Atenção: ${match.homeTeam} x ${match.awayTeam}`,
            message: `O jogo começa em ${diffInMins} min. Você tem apenas ${diffInMins - 30} min para palpitar!`,
            type: 'warning'
          });
        }
      });
      
      setAlerts(upcoming);
    };

    checkUpcomingMatches();
    const interval = setInterval(checkUpcomingMatches, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="bg-dark/80 backdrop-blur-xl flex justify-between items-center w-full px-6 h-20 fixed top-0 z-50 border-b border-white/5 shadow-2xl">
      <div className="flex items-center gap-4">
        <img src="https://iili.io/BZG2miP.png" alt="Bolão 2026" className="h-12 w-auto object-contain" />
      </div>
      
      <div className="flex items-center gap-3 relative">
        {/* Notification Bell */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-10 h-10 glass rounded-xl flex items-center justify-center transition-all relative ${showNotifications ? 'bg-white/20 border-primary/50' : 'hover:bg-white/10'}`}
        >
          <Bell size={18} className={alerts.length > 0 ? 'text-primary' : 'text-white/60'} />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-dark flex items-center justify-center animate-bounce">
              {alerts.length}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-14 right-0 w-80 glass-dark rounded-[1.5rem] border-white/10 shadow-2xl overflow-hidden z-[60]"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Notificações</h3>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {alerts.length} Ativas
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-white/5 mx-auto mb-2" />
                    <p className="text-xs text-white/20 font-medium">Nenhuma notificação no momento.</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock size={16} className="text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{alert.title}</p>
                          <p className="text-[10px] leading-relaxed text-white/40 font-medium">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {alerts.length > 0 && (
                <div className="p-3 bg-primary/5 text-center">
                  <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                    Corra! O sistema trava 30min antes do jogo.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={handleLogout}
          title="Sair"
          className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-red-500"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
