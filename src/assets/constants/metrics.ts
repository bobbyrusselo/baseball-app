import {  PlayerRaw, CleanStats, PlayerClean, AdvancedMetrics } from '../interface/interface';


const safeDiv = (num: number, den: number): number => den === 0 ? 0 : Math.round(num / den * 1000) / 1000;

export const parseValue = (val: string | number | null | undefined): number => {
  if (val === "DNP" || val === null || val === undefined) return 0;
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
};

// Cleans raw data and filters out seasons where the player literally did not play (DNP)
export const cleanData = (data: PlayerRaw[]): PlayerClean[] => {
  return data.map(player => {
    const cleanSeasons = player.Seasons
      .filter(s => s.GP !== "DNP" && s.GP !== null && s.GP !== 0) 
      .map(s => ({
        Year: String(s.Year),
        Team: s.Team,
        GP: parseValue(s.GP),
        PA: parseValue(s.PA),
        AB: parseValue(s.AB),
        H: parseValue(s.H),
        "1B": parseValue(s["1B"]),
        "2B": parseValue(s["2B"]),
        "3B": parseValue(s["3B"]),
        HR: parseValue(s.HR),
        RBI: parseValue(s.RBI),
        R: parseValue(s.R),
        HBP: parseValue(s.HBP),
        ROE: parseValue(s.ROE),
        FC: parseValue(s.FC),
        CI: parseValue(s.CI),
        BB: parseValue(s.BB),
        SO: parseValue(s.SO),
        SF: parseValue(s.SF),
        SB: parseValue(s.SB),
      }));
    return { ...player, Seasons: cleanSeasons };
  });
};

export const calculateMetrics = (stats: CleanStats): AdvancedMetrics => {
  const AVG = safeDiv(stats.H, stats.AB);
  const OBP = safeDiv(stats.H + stats.BB + stats.HBP, stats.AB + stats.BB + stats.HBP + stats.SF);
  const SLG = safeDiv(stats["1B"] + 2 * stats["2B"] + 3 * stats["3B"] + 4 * stats.HR, stats.AB);
  const OPS = OBP + SLG;
  const ISO = SLG - AVG;
  const BABIP = safeDiv(stats.H - stats.HR, stats.AB - stats.SO - stats.HR + stats.SF);
  const wOBA = safeDiv(
    (0.69 * stats.BB) + (0.72 * stats.HBP) + (0.88 * stats["1B"]) + (1.27 * stats["2B"]) + (1.62 * stats["3B"]) + (2.1 * stats.HR),
    stats.AB + stats.BB + stats.SF + stats.HBP
  );
  const RC = safeDiv((stats.H + stats.BB) * (stats["1B"] + 2 * stats["2B"] + 3 * stats["3B"] + 4 * stats.HR), stats.AB + stats.BB);

  return { AVG, OBP, SLG, OPS, ISO, BABIP, wOBA, RC };
};

// Aggregate multiple seasons into one stat line
export const aggregateStats = (seasons: CleanStats[]): CleanStats => {
  const agg: CleanStats = {
    Year: "Career/Total", Team: "Multiple", GP: 0, PA: 0, AB: 0, H: 0, "1B": 0, "2B": 0, "3B": 0,
    HR: 0, RBI: 0, R: 0, HBP: 0, ROE: 0, FC: 0, CI: 0, BB: 0, SO: 0, SF: 0, SB: 0
  };
  seasons.forEach(s => {
    agg.GP += s.GP; agg.PA += s.PA; agg.AB += s.AB; agg.H += s.H;
    agg["1B"] += s["1B"]; agg["2B"] += s["2B"]; agg["3B"] += s["3B"]; agg.HR += s.HR;
    agg.RBI += s.RBI; agg.R += s.R; agg.HBP += s.HBP; agg.ROE += s.ROE;
    agg.FC += s.FC; agg.CI += s.CI; agg.BB += s.BB; agg.SO += s.SO;
    agg.SF += s.SF; agg.SB += s.SB;
  });
  return agg;
};


export const formatStat = (val: number, isRate: boolean = false): string => {
  if (isRate) return val.toFixed(3).replace(/^0+/, ''); // Format like .300
  return Math.round(val).toString();
};

