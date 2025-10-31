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

export interface Ball {
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  extraType?: 'Wd' | 'Nb';
  boundary?: 4 | 6;
  bowlerId: number;
  batsmanId: number;
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
  target: number | null;
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