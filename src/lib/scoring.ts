import { WORLD_CUP_2026_ROUNDS, Match } from './matches';
import { WORLD_CUP_2026_GROUPS } from './groups';
import { KNOCKOUT_MATCHES } from './knockout';

export interface GameResult {
  homeScore: number;
  awayScore: number;
}

export interface TeamStats {
  name: string;
  group: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export function calculatePoints(prediction: GameResult, official: GameResult): number {
  const predHome = prediction.homeScore;
  const predAway = prediction.awayScore;
  const offHome = official.homeScore;
  const offAway = official.awayScore;

  if (predHome === offHome && predAway === offAway) return 3;

  const predResult = Math.sign(predHome - predAway);
  const offResult = Math.sign(offHome - offAway);

  return predResult === offResult ? 1 : 0;
}

export function isMatchLocked(matchDate: string, matchTime: string): boolean {
  const matchDateTime = new Date(`${matchDate}T${matchTime}`);
  const now = new Date();
  const LOCK_TIME = 30 * 60 * 1000;
  return (matchDateTime.getTime() - now.getTime()) <= LOCK_TIME;
}

export function getGroupStandings(results: Record<string, GameResult>) {
  const allStats: Record<string, TeamStats> = {};
  
  // Initialize teams
  WORLD_CUP_2026_GROUPS.forEach(group => {
    group.teams.forEach(team => {
      allStats[team] = {
        name: team, group: group.id, points: 0, played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0
      };
    });
  });

  // Process matches
  const groupMatches = WORLD_CUP_2026_ROUNDS.flatMap(r => r.matches);
  groupMatches.forEach(match => {
    const res = results[match.id];
    if (res && allStats[match.homeTeam] && allStats[match.awayTeam]) {
      const h = res.homeScore;
      const a = res.awayScore;
      
      allStats[match.homeTeam].played++;
      allStats[match.awayTeam].played++;
      allStats[match.homeTeam].goalsFor += h;
      allStats[match.homeTeam].goalsAgainst += a;
      allStats[match.awayTeam].goalsFor += a;
      allStats[match.awayTeam].goalsAgainst += h;
      
      if (h > a) {
        allStats[match.homeTeam].points += 3;
        allStats[match.homeTeam].wins++;
        allStats[match.awayTeam].losses++;
      } else if (a > h) {
        allStats[match.awayTeam].points += 3;
        allStats[match.awayTeam].wins++;
        allStats[match.homeTeam].losses++;
      } else {
        allStats[match.homeTeam].points += 1;
        allStats[match.awayTeam].points += 1;
        allStats[match.homeTeam].draws++;
        allStats[match.awayTeam].draws++;
      }
      
      allStats[match.homeTeam].goalDifference = allStats[match.homeTeam].goalsFor - allStats[match.homeTeam].goalsAgainst;
      allStats[match.awayTeam].goalDifference = allStats[match.awayTeam].goalsFor - allStats[match.awayTeam].goalsAgainst;
    }
  });

  // Group by group and sort
  const standingsByGroup: Record<string, TeamStats[]> = {};
  WORLD_CUP_2026_GROUPS.forEach(group => {
    standingsByGroup[group.id] = group.teams
      .map(t => allStats[t])
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.wins - a.wins;
      });
  });

  return standingsByGroup;
}

export function getKnockoutTeam(
  standings: Record<string, TeamStats[]>, 
  placeholder: string,
  results: Record<string, any>
): string {
  // Case 1: Xº do Grupo Y
  const groupMatch = placeholder.match(/(\d)º do Grupo ([A-L])/);
  if (groupMatch) {
    const pos = parseInt(groupMatch[1]) - 1;
    const groupId = groupMatch[2];
    return standings[groupId]?.[pos]?.name || placeholder;
  }

  // Case 2: 3º do Grupo (X, Y, Z...)
  if (placeholder.includes('3º do Grupo')) {
    const groupsMatch = placeholder.match(/\(([A-L, ]+)\)/);
    if (groupsMatch) {
      const allowedGroups = groupsMatch[1].split(/[ ,]+/).map(s => s.trim());
      const thirdPlaces = allowedGroups
        .map(id => standings[id]?.[2])
        .filter(t => t && t.played > 0)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.wins - a.wins;
        });
      return thirdPlaces[0]?.name || placeholder;
    }
  }

  // Case 3: Vencedor Jogo X
  if (placeholder.startsWith('Vencedor Jogo ') || placeholder.startsWith('Vencedor ')) {
    const parentMatchId = placeholder.replace('Vencedor Jogo ', '').replace('Vencedor ', '').trim();
    const parentMatch = KNOCKOUT_MATCHES.find(m => m.id === parentMatchId);
    if (!parentMatch) return placeholder;

    // Recursively get the teams for the parent match
    const parentHome = getKnockoutTeam(standings, parentMatch.homePlaceholder, results);
    const parentAway = getKnockoutTeam(standings, parentMatch.awayPlaceholder, results);

    const scoreData = results[parentMatchId];
    if (!scoreData) return placeholder;
    
    // Normalize score (handles both { homeScore, awayScore } and { home, away })
    const home = scoreData.home !== undefined ? scoreData.home : scoreData.homeScore;
    const away = scoreData.away !== undefined ? scoreData.away : scoreData.awayScore;
    if (home === undefined || away === undefined || home === '' || away === '') return placeholder;

    const h = Number(home);
    const a = Number(away);
    
    if (h > a) return parentHome;
    if (a > h) return parentAway;
    if (h === a) {
      if (scoreData.qualifier === 'away') return parentAway;
      return parentHome; // Default to home in case of draw and no qualifier
    }
  }

  // Case 4: Perdedor S1, Perdedor S2
  if (placeholder.startsWith('Perdedor ')) {
    const parentMatchId = placeholder.replace('Perdedor ', '').trim();
    const parentMatch = KNOCKOUT_MATCHES.find(m => m.id === parentMatchId);
    if (!parentMatch) return placeholder;

    const parentHome = getKnockoutTeam(standings, parentMatch.homePlaceholder, results);
    const parentAway = getKnockoutTeam(standings, parentMatch.awayPlaceholder, results);

    const scoreData = results[parentMatchId];
    if (!scoreData) return placeholder;

    const home = scoreData.home !== undefined ? scoreData.home : scoreData.homeScore;
    const away = scoreData.away !== undefined ? scoreData.away : scoreData.awayScore;
    if (home === undefined || away === undefined || home === '' || away === '') return placeholder;

    const h = Number(home);
    const a = Number(away);

    if (h > a) return parentAway;
    if (a > h) return parentHome;
    if (h === a) {
      if (scoreData.qualifier === 'away') return parentHome;
      return parentAway; // Default to away in case of draw and no qualifier
    }
  }

  return placeholder;
}
