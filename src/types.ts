export type GameState = 'registration' | 'playing' | 'leaderboard';

export interface Team {
  id: string;
  name: string;
  score: number;
  board: BingoCell[];
  completedLines: number;
  deviceId: string;
  timeRemaining: number;
  startTime: number;
}

export interface BingoCell {
  answered: boolean;
  answer: string;
}

export interface BingoQuestion {
  id: number;
  question: string;
  position: number;
}