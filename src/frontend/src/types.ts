export interface Player {
  id: string;
  name: string;
  mobile: string;
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper";
  jerseyNumber: number;
  battingStyle?: string;
  bowlingStyle?: string;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  venue: string;
  format: "T20" | "ODI" | "Test" | "T10";
  result?: "Won" | "Lost" | "Draw" | "No Result";
  teamScore?: string;
  oppScore?: string;
  notes?: string;
}

export interface TeamSettings {
  teamName: string;
  captainMobile: string;
  founded: string;
  homeGround: string;
}

// Lineup types
export interface LineupPlayer {
  playerId: string;
  battingOrder: number;
  isCaptain: boolean;
  isWicketKeeper: boolean;
}

export interface Lineup {
  matchDate: string;
  players: LineupPlayer[];
}

// Scorecard types
export interface ScorecardBatsman {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissal: string; // "not out", "b Bowler", "c Fielder b Bowler", etc.
  isNotOut: boolean;
}

export interface ScorecardBowler {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
}

export type BallEvent = "W" | "4" | "6" | "0" | "1" | "2" | "3" | "+";

export interface Scorecard {
  matchDate: string;
  batting: ScorecardBatsman[];
  bowling: ScorecardBowler[];
  lastBalls: BallEvent[];
  currentRunRate: number;
  requiredRunRate?: number;
  partnership: { runs: number; balls: number };
}
