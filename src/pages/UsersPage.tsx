import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { UserCheck, UserX, ShieldCheck, Mail, Calendar, Search } from 'lucide-react';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  approved?: boolean;
  lastLogin: string;
}

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data: UserData[] = [];
      snapshot.forEach((doc) => data.push(doc.data() as UserData));
      setUsers(data.sort((a, b) => b.lastLogin.localeCompare(a.lastLogin)));
      setLoading(false);
    });

    return unsub;
  }, [isAdmin]);

  const handleToggleApproval = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        approved: !currentStatus
      });
    } catch (error) {
      console.error("Error updating approval:", error);
    }
  };

  if (!isAdmin) return <div className="p-20 text-center">Acesso Negado</div>;
  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
            Gestão de <span className="text-primary">Participantes</span>
          </h1>
          <p className="text-white/50 font-medium">Aprove ou remova competidores do seu bolão.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-all text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user) => (
            <motion.div
              layout
              key={user.uid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`glass-dark p-6 rounded-[2rem] border transition-all flex items-center justify-between gap-4 ${user.approved ? 'border-primary/20 bg-primary/5' : 'border-white/5'}`}
            >
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <div className="relative">
                  <img src={user.photoURL} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10" />
                  {user.approved && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-dark flex items-center justify-center text-dark">
                      <ShieldCheck size={12} />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white truncate">{user.displayName}</p>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                      <Mail size={10} />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                      <Calendar size={10} />
                      <span>Log: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleApproval(user.uid, user.approved || false)}
                className={`
                  flex flex-col items-center justify-center gap-1 w-24 h-24 rounded-2xl transition-all font-black text-[9px] uppercase tracking-widest border
                  ${user.approved 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                    : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-dark'
                  }
                `}
              >
                {user.approved ? (
                  <>
                    <UserX size={20} />
                    Bloquear
                  </>
                ) : (
                  <>
                    <UserCheck size={20} />
                    Aprovar
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-20 glass-dark rounded-[3rem] border-white/5">
          <p className="text-white/20 font-black uppercase tracking-widest">Nenhum participante encontrado</p>
        </div>
      )}
    </div>
  );
}
