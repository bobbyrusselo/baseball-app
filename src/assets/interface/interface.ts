
export interface RawSeasonStats {
  Year: number | string;
  Team: string;
  GP: number | string | null;
  PA: number | string | null;
  AB: number | string | null;
  H: number | string | null;
  "1B": number | string | null;
  "2B": number | string | null;
  "3B": number | string | null;
  HR: number | string | null;
  RBI: number | string | null;
  R: number | string | null;
  HBP: number | string | null;
  ROE: number | string | null;
  FC: number | string | null;
  CI: number | string | null;
  BB: number | string | null;
  SO: number | string | null;
  SF: number | string | null;
  SB: number | string | null;
}

export interface PlayerRaw {
  Player: string;
  Status: string;
  Seasons: RawSeasonStats[];
}

export interface CleanStats {
  Year: string;
  Team: string;
  GP: number;
  PA: number;
  AB: number;
  H: number;
  "1B": number;
  "2B": number;
  "3B": number;
  HR: number;
  RBI: number;
  R: number;
  HBP: number;
  ROE: number;
  FC: number;
  CI: number;
  BB: number;
  SO: number;
  SF: number;
  SB: number;
}

export interface PlayerClean {
  Player: string;
  Status: string;
  Seasons: CleanStats[];
}

export interface AdvancedMetrics {
  AVG: number;
  OBP: number;
  SLG: number;
  OPS: number;
  ISO: number;
  BABIP: number;
  wOBA: number;
  RC: number;
}

export type FullSeasonStats = CleanStats & AdvancedMetrics;