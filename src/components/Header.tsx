import { useState, useEffect } from 'react';
import { Bell, LogOut, Clock, User as UserIcon, X, CheckCircle2, ChevronDown } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bibi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Dave",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Eden",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Fifi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Gigi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Hugo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Izzy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
];

export function Header() {
  const { user, isApproved, isAdmin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) setUserData(doc.data());
    });

    const checkUpcomingMatches = () => {
      const now = new Date();
      const upcoming: any[] = [];
      
      WORLD_CUP_2026_ROUNDS.flatMap(r => r.matches).forEach(match => {
        const [day, month, year] = match.date.split('/').map(Number);
        const [hour, minute] = match.time.split(':').map(Number);
        const matchTime = new Date(year, month - 1, day, hour, minute);
        
        const diffInMs = matchTime.getTime() - now.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));

        if (diffInMins > 30 && diffInMins <= 90) {
          upcoming.push({
            id: match.id,
            title: `${match.homeTeam} x ${match.awayTeam}`,
            message: `O jogo começa em ${diffInMins} min. Você tem apenas ${diffInMins - 30} min para palpitar!`,
            type: 'warning'
          });
        }
      });
      setAlerts(upcoming);
    };

    checkUpcomingMatches();
    const interval = setInterval(checkUpcomingMatches, 60000);
    return () => {
      clearInterval(interval);
      unsubUser();
    };
  }, [user]);

  const handleUpdateAvatar = async (avatarUrl: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { photoURL: avatarUrl });
      setShowAvatarSelector(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <>
      <header className="bg-dark/80 backdrop-blur-xl flex justify-between items-center w-full px-6 h-20 fixed top-0 z-50 border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <img src="https://iili.io/BZG2miP.png" alt="Bolão 2026" className="h-12 w-auto object-contain" />
        </div>
        
        <div className="flex items-center gap-3 relative">
          {user && (
            <div className="flex items-center gap-3 pr-2 mr-2 border-r border-white/10 h-10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">
                  {userData?.displayName || user.displayName}
                </p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest">
                  {isAdmin ? 'Admin' : isApproved ? 'Competidor' : 'Pendente'}
                </p>
              </div>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="relative group h-10 w-10 flex-shrink-0">
                <img 
                  src={userData?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white/10 group-hover:border-primary/50 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-dark flex items-center justify-center text-dark">
                  <ChevronDown size={10} className={showProfileMenu ? 'rotate-180' : ''} />
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfileMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-14 right-0 w-48 glass-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-[70] py-1"
                    >
                      <button 
                        onClick={() => { setShowAvatarSelector(true); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-primary transition-all"
                      >
                        <UserIcon size={14} /> Mudar Avatar
                      </button>
                      <button 
                        onClick={() => signOut(auth)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-[11px] font-black uppercase tracking-widest text-red-500 transition-all"
                      >
                        <LogOut size={14} /> Sair
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

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

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowNotifications(false)} />
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
                        <p className="text-xs text-white/20 font-medium">Tudo em dia!</p>
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
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {showAvatarSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-dark w-full max-w-lg p-8 rounded-[3rem] border-white/10 shadow-2xl relative">
              <button onClick={() => setShowAvatarSelector(false)} className="absolute top-8 right-8 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"><X size={20} /></button>
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Seu Estilo</h2>
                <p className="text-white/40 text-sm font-medium">Escolha o avatar que mais combina com você.</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
                {AVATARS.map((avatar) => (
                  <button key={avatar} onClick={() => handleUpdateAvatar(avatar)} className="relative group aspect-square rounded-3xl bg-white/5 border-2 border-transparent hover:border-primary transition-all overflow-hidden p-1 shadow-lg">
                    <img src={avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Avatar" />
                    <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <CheckCircle2 size={32} className="text-white drop-shadow-lg" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
/header>
  );
}
