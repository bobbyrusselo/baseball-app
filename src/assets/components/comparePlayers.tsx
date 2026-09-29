import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line, Cell } from 'recharts';
import { THEME } from '../constants/theme';
import { CleanStats, FullSeasonStats, PlayerClean } from '../interface/interface';
import { aggregateStats, calculateMetrics, formatStat } from '../constants/metrics';

const ComparePlayers: React.FC<{ processedData: PlayerClean[], allYearsAvailable: (data: PlayerClean[]) => string[] }> = ({ processedData, allYearsAvailable }) => {
  const [playerA, setPlayerA] = useState<string>(processedData[0]?.Player || "");
  const [playerB, setPlayerB] = useState<string>(processedData[1]?.Player || "");
  
  // NEW: Multi-select year filter state
  const [selectedYears, setSelectedYears] = useState<string[]>(allYearsAvailable(processedData));

  const toggleYear = (yr: string) => {
    setSelectedYears(prev => {
      if (prev.includes(yr)) {
        return prev.filter(y => y !== yr);
      } else {
        return [...prev, yr].sort((a, b) => b.localeCompare(a));
      }
    });
  };

  const selectAllYears = () => setSelectedYears(allYearsAvailable(processedData));
  const clearYears = () => setSelectedYears([]);

  const getFilteredCareerStats = (playerName: string): FullSeasonStats | null => {
    const p = processedData.find(pl => pl.Player === playerName);
    if (!p) return null;
    
    // Aggregate only the seasons that match our selected years
    const filteredSeasons = p.Seasons.filter(s => selectedYears.includes(s.Year));
    if (filteredSeasons.length === 0) return null;

    const agg = aggregateStats(filteredSeasons);
    // Use player name for the chart labels
    return { ...agg, ...calculateMetrics(agg), Year: playerName };
  };

  const statsA = getFilteredCareerStats(playerA);
  const statsB = getFilteredCareerStats(playerB);
  const comparisonData = [statsA, statsB].filter(Boolean) as FullSeasonStats[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 mb-6">
        <Target className="w-8 h-8 text-[#DF4601]" />
        <h2 className="text-3xl font-bold text-gray-900">Head-to-Head Comparison</h2>
      </div>

      {/* NEW: Year Selection UI */}
      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-gray-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
           <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Seasons to Include in Matchup</h3>
           <div className="flex gap-2 mt-2 sm:mt-0">
              <button onClick={selectAllYears} className="text-xs font-bold text-[#DF4601] hover:underline">Select All</button>
              <span className="text-gray-300">|</span>
              <button onClick={clearYears} className="text-xs font-bold text-gray-500 hover:underline">Clear</button>
           </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allYearsAvailable(processedData).map(yr => (
            <button
              key={yr}
              onClick={() => toggleYear(yr)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedYears.includes(yr) 
                  ? 'bg-[#000000] text-white border-[#000000] shadow-sm' 
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#000000] flex flex-col md:flex-row gap-6 justify-center items-center">
        <div className="flex-1 w-full max-w-xs">
          <label className="block text-sm font-bold text-gray-700 mb-2">Player A</label>
          <select 
            value={playerA}
            onChange={(e) => setPlayerA(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DF4601]"
          >
            {processedData.map(p => <option key={p.Player} value={p.Player}>{p.Player}</option>)}
          </select>
        </div>
        <div className="bg-[#DF4601] text-white p-4 rounded-full font-black italic shadow-lg shrink-0">VS</div>
        <div className="flex-1 w-full max-w-xs">
          <label className="block text-sm font-bold text-gray-700 mb-2">Player B</label>
          <select 
            value={playerB}
            onChange={(e) => setPlayerB(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000000]"
          >
             {processedData.map(p => <option key={p.Player} value={p.Player}>{p.Player}</option>)}
          </select>
        </div>
      </div>

      {comparisonData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Comparison Chart 1: Filtered OPS */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#DF4601]">
              <h3 className="text-lg font-bold mb-4 text-center">Aggregate OPS</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false}/>
                    <XAxis dataKey="Year" />
                    <YAxis domain={[0, 'dataMax + 0.2']} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="OPS" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? THEME.primary : THEME.secondary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Chart 2: Filtered Hits */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#000000]">
              <h3 className="text-lg font-bold mb-4 text-center">Total Hits</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false}/>
                    <XAxis type="number" />
                    <YAxis dataKey="Year" type="category" width={80} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="H" radius={[0, 4, 4, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? THEME.primary : THEME.secondary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Chart 3: RBI & Runs */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#DF4601]">
              <h3 className="text-lg font-bold mb-4 text-center">Production (R & RBI)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="Year" />
                    <YAxis />
                    <Tooltip cursor={{fill: THEME.gray}} />
                    <Legend />
                    <Bar dataKey="R" fill={THEME.primary} />
                    <Bar dataKey="RBI" fill={THEME.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Chart 4: Sabermetrics (wOBA & ISO) */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#000000]">
              <h3 className="text-lg font-bold mb-4 text-center">Quality of Contact (wOBA / ISO)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="Year" />
                    <YAxis />
                    <Tooltip cursor={{fill: THEME.gray}} />
                    <Legend />
                    <Bar dataKey="wOBA" fill="#10b981" />
                    <Bar dataKey="ISO" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Chart 5: SB vs BB */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#DF4601] lg:col-span-2 xl:col-span-1">
              <h3 className="text-lg font-bold mb-4 text-center">Speed & Eye (SB / BB)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="Year" />
                    <YAxis />
                    <Tooltip cursor={{fill: THEME.gray}} />
                    <Legend />
                    <Bar dataKey="BB" fill={THEME.secondary} barSize={40} />
                    <Line type="monotone" dataKey="SB" stroke={THEME.primary} strokeWidth={4} dot={{r: 6}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Side-by-side Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[statsA, statsB].map((stats, idx) => stats && (
              <div key={idx} className={`bg-white rounded-xl shadow-md overflow-hidden border-t-4 ${idx === 0 ? 'border-[#DF4601]' : 'border-[#000000]'}`}>
                <div className={`p-4 text-white font-bold text-xl ${idx === 0 ? 'bg-[#DF4601]' : 'bg-[#000000]'}`}>
                  {stats.Year} <span className="text-sm font-normal text-white/80 ml-2">({selectedYears.length} Seasons Selected)</span>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm text-left">
                      <tbody>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-gray-50 w-1/2">Games Played</td><td className="px-4 py-2">{stats.GP}</td></tr>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-gray-50">At Bats</td><td className="px-4 py-2">{stats.AB}</td></tr>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-gray-50">Hits / HR</td><td className="px-4 py-2">{stats.H} / {stats.HR}</td></tr>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-gray-50">Runs / RBI</td><td className="px-4 py-2">{stats.R} / {stats.RBI}</td></tr>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-gray-50">BB / SO</td><td className="px-4 py-2">{stats.BB} / {stats.SO}</td></tr>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-orange-100 text-[#DF4601]">AVG / OBP / SLG</td><td className="px-4 py-2 font-bold">{formatStat(stats.AVG, true)} / {formatStat(stats.OBP, true)} / {formatStat(stats.SLG, true)}</td></tr>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-[#000] text-white">OPS</td><td className="px-4 py-2 font-black text-lg">{formatStat(stats.OPS, true)}</td></tr>
                        <tr className="border-b"><td className="px-4 py-2 font-bold bg-gray-50">wOBA / ISO</td><td className="px-4 py-2">{formatStat(stats.wOBA, true)} / {formatStat(stats.ISO, true)}</td></tr>
                      </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="p-12 text-center bg-gray-200 rounded-xl border-2 border-dashed border-gray-400">
           <h3 className="text-xl font-bold text-gray-500 mb-2">No Matching Seasons</h3>
           <p className="text-gray-400">Select at least one valid year where these players have recorded stats.</p>
        </div>
      )}
    </div>
  );
};
export default ComparePlayers;