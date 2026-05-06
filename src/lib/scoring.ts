export interface GameResult {
  homeScore: number;
  awayScore: number;
}

export function calculatePoints(prediction: GameResult, official: GameResult): number {
  const predHome = prediction.homeScore;
  const predAway = prediction.awayScore;
  const offHome = official.homeScore;
  const offAway = official.awayScore;

  // Exact score
  if (predHome === offHome && predAway === offAway) {
    return 3;
  }

  // Check winner/draw
  const predResult = Math.sign(predHome - predAway);
  const offResult = Math.sign(offHome - offAway);

  if (predResult === offResult) {
    return 1;
  }

  return 0;
}

export function isMatchLocked(matchDate: string, matchTime: string): boolean {
  const matchDateTime = new Date(`${matchDate}T${matchTime}`);
  const now = new Date();
  
  // 30 minutes in milliseconds
  const LOCK_TIME = 30 * 60 * 1000;
  
  return (matchDateTime.getTime() - now.getTime()) <= LOCK_TIME;
}
