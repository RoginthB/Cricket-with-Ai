export interface Player {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  outMethod?: string;
  // Bowling stats added to unify player/bowler types
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface Over {
  balls: Ball[];
  overNumber: number;
}

export type DismissalMethod = 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | 'Hit Wicket' | 'Caught & Bowled';

export interface WicketDetails {
  method: DismissalMethod;
  fielderId?: number;
  batsmanOutId: number;
}

export interface Ball {
  runs: number; // For normal balls: runs off bat. For Nb: runs off bat. For Byes/Leg-byes: number of extras.
  isWicket: boolean;
  wicketDetails?: WicketDetails;
  isExtra: boolean;
  extraType?: 'Wd' | 'Nb' | 'B' | 'Lb';
  extraRuns?: number; // For wides that go to the boundary, extraRuns = 4 (total 5).
  boundary?: 4 | 6;
  bowlerId: number;
  batsmanId: number; // The batsman on strike for this ball.
}

export interface Team {
  id: number;
  name: string;
  players: Player[];
  score: number;
  wickets: number;
  overs: number;
}

export interface FallOfWicket {
  runs: number;
  wicket: number;
  over: number;
  player: string;
}

export interface Innings {
  battingTeam: Team;
  bowlingTeam: Team;
  overs: Over[];
  fallOfWickets: FallOfWicket[];
}

export interface MatchState {
  id: string;
  description: string;
  status: 'scheduled' | 'live' | 'completed';
  teams: [Team, Team];
  innings: [Innings, Innings | null];
  currentInnings: number;
  striker: Player;
  nonStriker: Player;
  currentBowler: Player;
  tossWinner: Team | null;
  decision: 'bat' | 'bowl' | null;
  isMatchOver: boolean;
  matchWinner?: Team;
  maxOvers: number;
  playersPerTeam: number;
  date?: string;
  venue?: string;
  isTossCompleted: boolean;
  isInningsBreak?: boolean;
  target: number | null;
  nextActionRequired: 'SELECT_OPENERS' | 'SELECT_NEXT_BATSMAN' | 'SELECT_BOWLER' | null;
  statsProcessed?: boolean; // To track if stats have been updated from this match
}

export interface ScheduledMatch {
  matchNumber: number;
  teamA: string;
  teamB: string;
  date: string;
  venue: string;
}

export interface TopPerformer {
  name: string;
  team: string;
  stat1: string;
}

export interface MatchSummaryData {
  narrative: string;
  topBatsman: TopPerformer;
  topBowler: TopPerformer;
}

export interface PlayerRosterItem {
  id: number;
  name: string;
}

export interface CustomTeam {
  id: string;
  name: string;
  players: PlayerRosterItem[];
}

export interface BestBowling {
  wickets: number;
  runs: number;
}

export interface PlayerStats {
  name: string; // Keyed by player name
  matches: number;
  // Batting
  inningsBatted: number;
  runsScored: number;
  ballsFaced: number;
  highestScore: number;
  notOuts: number;
  fifties: number;
  hundreds: number;
  fours: number;
  sixes: number;
  // Bowling
  oversBowled: number; // Stored as a decimal like 10.5 for 10 overs and 5 balls
  runsConceded: number;
  wicketsTaken: number;
  bestBowling: BestBowling | null;
}
