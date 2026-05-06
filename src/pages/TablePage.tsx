import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { getFlagUrl } from '../lib/flags';
import { Save, Lock, Edit3 } from 'lucide-react';

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

  const handleSaveResult = async (matchId: string, home: number, away: number) => {
    try {
      await setDoc(doc(db, 'results', matchId), { home, away });
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
            Tabela de <span className="text-primary italic">Resultados</span>
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

      <div className="glass-dark rounded-[2.5rem] overflow-hidden border-white/5">
        <div className="overflow-x-auto">
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
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ match, isAdmin, savedResult, onSave }: any) {
  const [home, setHome] = useState(savedResult?.home ?? '');
  const [away, setAway] = useState(savedResult?.away ?? '');

  useEffect(() => {
    if (savedResult) {
      setHome(savedResult.home);
      setAway(savedResult.away);
    }
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
            <img src={getFlagUrl(match.homeTeam)} className="w-8 h-5 object-cover rounded-sm shadow-sm" alt="" />
            <span className="text-[10px] font-bold text-white/60 text-center truncate w-full">{match.homeTeam}</span>
          </div>
          <span className="text-white/20 font-black italic">VS</span>
          <div className="flex flex-col items-center gap-1 w-24">
            <img src={getFlagUrl(match.awayTeam)} className="w-8 h-5 object-cover rounded-sm shadow-sm" alt="" />
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
                className="w-12 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black focus:border-primary transition-all"
              />
              <span className="flex items-center text-white/20">-</span>
              <input 
                type="number" 
                value={away} 
                onChange={(e) => setAway(e.target.value)}
                className="w-12 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black focus:border-primary transition-all"
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
          <button 
            onClick={() => onSave(match.id, Number(home), Number(away))}
            className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-dark transition-all"
          >
            <Save size={18} />
          </button>
        </td>
      )}
    </tr>
  );
}
