import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { getFlagUrl } from '../lib/flags';
import { Save, Lock, Edit3, Trash2 } from 'lucide-react';

export default function TablePage() {
  const { isAdmin } = useAuth();
  const [results, setResults] = useState<Record<string, { home: number; away: number }>>({});
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

  const handleSaveResult = async (matchId: string, home: any, away: any) => {
    if (home === '' || away === '') return;
    try {
      await setDoc(doc(db, 'results', matchId), { home: Number(home), away: Number(away) });
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

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
            Tabela de <span className="text-primary">Resultados</span>
          </h1>
          <p className="text-white/50 font-medium">
            {isAdmin ? 'Área do Administrador: Insira os resultados oficiais.' : 'Acompanhe os resultados oficiais de cada partida.'}
          </p>
        </div>
        {isAdmin && (
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Modo Edição Ativo
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block glass-dark rounded-[2.5rem] overflow-hidden border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Data/Hora</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Jogo</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Placar Oficial</th>
                {isAdmin && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {WORLD_CUP_2026_ROUNDS.flatMap(r => r.matches).map((match) => (
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
          {WORLD_CUP_2026_ROUNDS.flatMap(r => r.matches).map((match) => (
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
      </div>
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
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1 w-24">
            <img src={getFlagUrl(match.homeTeam)} className="w-8 h-5 object-cover rounded-sm shadow-sm flag-3d" alt="" />
            <span className="text-[10px] font-bold text-white/60 text-center truncate w-full">{match.homeTeam}</span>
          </div>
          <span className="text-white/20 font-black">VS</span>
          <div className="flex flex-col items-center gap-1 w-24">
            <img src={getFlagUrl(match.awayTeam)} className="w-8 h-5 object-cover rounded-sm shadow-sm flag-3d" alt="" />
            <span className="text-[10px] font-bold text-white/60 text-center truncate w-full">{match.awayTeam}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center gap-2">
          {isAdmin ? (
            <>
              <input 
                type="number" 
                value={home} 
                onChange={(e) => setHome(e.target.value)}
                className="w-12 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black focus:border-primary transition-all text-white"
              />
              <span className="flex items-center text-white/20">-</span>
              <input 
                type="number" 
                value={away} 
                onChange={(e) => setAway(e.target.value)}
                className="w-12 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black focus:border-primary transition-all text-white"
              />
            </>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-xl font-black text-white">{savedResult?.home ?? '-'}</span>
              <span className="text-white/20">-</span>
              <span className="text-xl font-black text-white">{savedResult?.away ?? '-'}</span>
            </div>
          )}
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
