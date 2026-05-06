import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WORLD_CUP_2026_GROUPS } from '../lib/groups';
import { WORLD_CUP_2026_ROUNDS } from '../lib/matches';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFlagUrl } from '../lib/flags';
import { Info, LayoutGrid } from 'lucide-react';

interface TeamStats {
  name: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export default function GroupsPage() {
  const [results, setResults] = useState<Record<string, { home: number; away: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'results'), (snapshot) => {
      const data: any = {};
      snapshot.forEach((doc) => data[doc.id] = doc.data());
      setResults(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const calculateStandings = (groupTeams: string[]) => {
    const stats: Record<string, TeamStats> = {};
    
    groupTeams.forEach(team => {
      stats[team] = {
        name: team, points: 0, played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0
      };
    });

    // Get all matches for these teams
    const allMatches = WORLD_CUP_2026_ROUNDS.flatMap(r => r.matches);
    
    allMatches.forEach(match => {
      const result = results[match.id];
      if (result && stats[match.homeTeam] && stats[match.awayTeam]) {
        const h = result.home;
        const a = result.away;
        
        stats[match.homeTeam].played++;
        stats[match.awayTeam].played++;
        stats[match.homeTeam].goalsFor += h;
        stats[match.homeTeam].goalsAgainst += a;
        stats[match.awayTeam].goalsFor += a;
        stats[match.awayTeam].goalsAgainst += h;
        
        if (h > a) {
          stats[match.homeTeam].points += 3;
          stats[match.homeTeam].wins++;
          stats[match.awayTeam].losses++;
        } else if (a > h) {
          stats[match.awayTeam].points += 3;
          stats[match.awayTeam].wins++;
          stats[match.homeTeam].losses++;
        } else {
          stats[match.homeTeam].points += 1;
          stats[match.awayTeam].points += 1;
          stats[match.homeTeam].draws++;
          stats[match.awayTeam].draws++;
        }
        
        stats[match.homeTeam].goalDifference = stats[match.homeTeam].goalsFor - stats[match.homeTeam].goalsAgainst;
        stats[match.awayTeam].goalDifference = stats[match.awayTeam].goalsFor - stats[match.awayTeam].goalsAgainst;
      }
    });

    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.wins - a.wins;
    });
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black text-white font-lexend tracking-tight uppercase mb-2">
            Grupos do <span className="text-primary">Mundial</span>
          </h1>
          <p className="text-white/50 font-medium">
            Acompanhe a classificação em tempo real das 48 seleções.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <LayoutGrid className="text-primary w-5 h-5" />
          </div>
          <span className="font-black text-sm text-white uppercase tracking-widest">
            104 Jogos Totais
          </span>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {WORLD_CUP_2026_GROUPS.map((group, gIndex) => {
          const standings = calculateStandings(group.teams);
          
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIndex * 0.1 }}
              className="glass-dark rounded-[2.5rem] p-8 border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-lexend font-black text-2xl text-secondary tracking-tight">
                  {group.name}
                </h2>
                <Info className="w-5 h-5 text-white/20" />
              </div>

              <div className="w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_repeat(6,32px)] gap-2 mb-4 px-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Seleção</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center">P</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center">J</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center">V</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center">E</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center">D</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center">SG</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-2">
                  {standings.map((team, tIndex) => (
                    <div 
                      key={team.name}
                      className={`
                        grid grid-cols-[1fr_repeat(6,32px)] gap-2 items-center px-4 py-3 rounded-2xl transition-all
                        ${tIndex < 2 ? 'bg-primary/10 border border-primary/10' : 'bg-white/[0.02] border border-white/5'}
                      `}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={getFlagUrl(team.name)} 
                          className="w-6 h-4 object-cover rounded-sm flex-shrink-0 flag-3d" 
                          alt="" 
                        />
                        <span className="font-bold text-sm text-white truncate">{team.name}</span>
                      </div>
                      <span className={`text-sm font-black text-center ${tIndex < 2 ? 'text-primary' : 'text-white/60'}`}>{team.points}</span>
                      <span className="text-sm font-bold text-white/40 text-center">{team.played}</span>
                      <span className="text-sm font-bold text-white/40 text-center">{team.wins}</span>
                      <span className="text-sm font-bold text-white/40 text-center">{team.draws}</span>
                      <span className="text-sm font-bold text-white/40 text-center">{team.losses}</span>
                      <span className={`text-sm font-black text-center ${team.goalDifference > 0 ? 'text-primary/60' : team.goalDifference < 0 ? 'text-red-500/60' : 'text-white/20'}`}>
                        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
