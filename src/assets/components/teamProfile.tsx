import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ClipboardList } from 'lucide-react';
import { THEME } from '../constants/theme';
import { CleanStats, FullSeasonStats, PlayerClean } from '../interface/interface';
import { aggregateStats, calculateMetrics, formatStat } from '../constants/metrics';

type RosterStats = FullSeasonStats & { PlayerName: string };

const TeamProfile: React.FC<{ processedData: PlayerClean[], allYearsAvailable: (data: PlayerClean[]) => string[]  }> = ({ processedData, allYearsAvailable }) => {
  const [selectedYear, setSelectedYear] = useState<string>(allYearsAvailable(processedData)[0] || "");
  const [sortConfig, setSortConfig] = useState<{ key: keyof RosterStats; direction: 'asc' | 'desc' }>({ key: 'OPS', direction: 'desc' });

  // Static chronological/performance data for charts
  const staticRosterData = useMemo(() => {
    const roster: RosterStats[] = [];
    processedData.forEach(player => {
      const season = player.Seasons.find(s => s.Year === selectedYear);
      if (season) {
        roster.push({
          ...season,
          ...calculateMetrics(season),
          PlayerName: player.Player.replace(/\s\d+$/, '') // Shorten name
        });
      }
    });
    // Default chart sort by OPS highest to lowest
    return roster.sort((a, b) => b.OPS - a.OPS);
  }, [selectedYear, processedData]);

  // Sorted data exclusively for the table
  const sortedTableData = useMemo(() => {
    const dataToSort = [...staticRosterData];
    
    return dataToSort.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortConfig.direction === 'asc' 
                ? aVal.localeCompare(bVal) 
                : bVal.localeCompare(aVal);
        }

        const aNum = Number(aVal) || 0;
        const bNum = Number(bVal) || 0;

        if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [staticRosterData, sortConfig]);

  // Calculate overall team totals based on the roster for the selected year
  const teamTotals = useMemo(() => {
    if (staticRosterData.length === 0) return null;
    const agg = aggregateStats(staticRosterData);
    return { ...agg, ...calculateMetrics(agg) };
  }, [staticRosterData]);

  const requestSort = (key: keyof RosterStats) => {
    setSortConfig(current => ({
        key,
        // Defaulting to desc on new clicks as higher stats are usually preferred
        direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Aggregate hits for pie chart using static data
  const hitDist = useMemo(() => {
    const totals = staticRosterData.reduce((acc, curr) => {
      acc.single += curr["1B"];
      acc.double += curr["2B"];
      acc.triple += curr["3B"];
      acc.hr += curr.HR;
      return acc;
    }, { single: 0, double: 0, triple: 0, hr: 0 });
    return [
      { name: 'Singles', value: totals.single },
      { name: 'Doubles', value: totals.double },
      { name: 'Triples', value: totals.triple },
      { name: 'Home Runs', value: totals.hr },
    ].filter(d => d.value > 0);
  }, [staticRosterData]);

  const PIE_COLORS = ['#9ca3af', '#4b5563', THEME.secondary, THEME.primary];

  const SortableHeader = ({ label, sortKey, className = "px-4 py-3" }: { label: string, sortKey: keyof RosterStats, className?: string }) => (
    <th
        className={`${className} cursor-pointer hover:opacity-75 transition-opacity select-none`}
        onClick={() => requestSort(sortKey)}
    >
        <div className="flex items-center gap-1">
            {label}
            {sortConfig.key === sortKey && (
                <span className="text-[10px]">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
            )}
        </div>
    </th>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <ClipboardList className="w-8 h-8 text-[#DF4601]" />
          <h2 className="text-3xl font-bold text-gray-900">Team Profile</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-700">Roster Year:</span>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border-2 border-[#000000] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DF4601] bg-white font-semibold min-w-[120px]"
          >
            {allYearsAvailable(processedData).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Roster OPS */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#DF4601] lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-gray-800">{selectedYear} Roster OPS</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staticRosterData} margin={{bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="PlayerName" tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis domain={[0, 1.2]} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="OPS" fill={THEME.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hit Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#000000]">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Team Hit Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hitDist}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={5} dataKey="value"
                >
                  {hitDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: BB vs SO Scatter / Bar */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#000000] lg:col-span-3">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Player Discipline (Walks vs Strikeouts)</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staticRosterData} margin={{bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="PlayerName" tick={{fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Legend verticalAlign="top" />
                <Bar dataKey="BB" name="Walks" fill={THEME.primary} />
                <Bar dataKey="SO" name="Strikeouts" fill={THEME.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Detailed Team Roster Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mt-6">
        <div className="bg-[#000] p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">{selectedYear} Full Roster Stats</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b-2 border-[#DF4601]">
              <tr>
                <SortableHeader label="Player" sortKey="PlayerName" />
                <SortableHeader label="GP" sortKey="GP" />
                <SortableHeader label="AB" sortKey="AB" />
                <SortableHeader label="H" sortKey="H" />
                <SortableHeader label="2B" sortKey="2B" />
                <SortableHeader label="3B" sortKey="3B" />
                <SortableHeader label="HR" sortKey="HR" />
                <SortableHeader label="RBI" sortKey="RBI" />
                <SortableHeader label="SB" sortKey="SB" />
                <SortableHeader label="AVG" sortKey="AVG" className="px-4 py-3 bg-orange-100 text-[#DF4601]" />
                <SortableHeader label="OBP" sortKey="OBP" className="px-4 py-3 bg-orange-100 text-[#DF4601]" />
                <SortableHeader label="SLG" sortKey="SLG" className="px-4 py-3 bg-orange-100 text-[#DF4601]" />
                <SortableHeader label="OPS" sortKey="OPS" className="px-4 py-3 bg-orange-100 text-black font-bold" />
                <SortableHeader label="wOBA" sortKey="wOBA" className="px-4 py-3 bg-gray-200" />
                <SortableHeader label="RC" sortKey="RC" className="px-4 py-3 bg-gray-200" />
              </tr>
            </thead>
            <tbody>
              {sortedTableData.map((row, i) => (
                <tr key={row.PlayerName} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50`}>
                  <td className="px-4 py-3 font-bold text-gray-900">{row.PlayerName}</td>
                  <td className="px-4 py-3">{row.GP}</td>
                  <td className="px-4 py-3">{row.AB}</td>
                  <td className="px-4 py-3">{row.H}</td>
                  <td className="px-4 py-3">{row["2B"]}</td>
                  <td className="px-4 py-3">{row["3B"]}</td>
                  <td className="px-4 py-3">{row.HR}</td>
                  <td className="px-4 py-3">{row.RBI}</td>
                  <td className="px-4 py-3">{row.SB}</td>
                  <td className="px-4 py-3 font-medium bg-orange-50 text-[#DF4601]">{formatStat(row.AVG, true)}</td>
                  <td className="px-4 py-3 font-medium bg-orange-50 text-[#DF4601]">{formatStat(row.OBP, true)}</td>
                  <td className="px-4 py-3 font-medium bg-orange-50 text-[#DF4601]">{formatStat(row.SLG, true)}</td>
                  <td className="px-4 py-3 font-bold bg-orange-50 text-black">{formatStat(row.OPS, true)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatStat(row.wOBA, true)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatStat(row.RC)}</td>
                </tr>
              ))}
              {teamTotals && (
                <tr className="bg-[#DF4601] text-white font-bold border-t-4 border-[#000000]">
                  <td className="px-4 py-4">TEAM TOTALS</td>
                  <td className="px-4 py-4">{teamTotals.GP}</td>
                  <td className="px-4 py-4">{teamTotals.AB}</td>
                  <td className="px-4 py-4">{teamTotals.H}</td>
                  <td className="px-4 py-4">{teamTotals["2B"]}</td>
                  <td className="px-4 py-4">{teamTotals["3B"]}</td>
                  <td className="px-4 py-4">{teamTotals.HR}</td>
                  <td className="px-4 py-4">{teamTotals.RBI}</td>
                  <td className="px-4 py-4">{teamTotals.SB}</td>
                  <td className="px-4 py-4">{formatStat(teamTotals.AVG, true)}</td>
                  <td className="px-4 py-4">{formatStat(teamTotals.OBP, true)}</td>
                  <td className="px-4 py-4">{formatStat(teamTotals.SLG, true)}</td>
                  <td className="px-4 py-4">{formatStat(teamTotals.OPS, true)}</td>
                  <td className="px-4 py-4">{formatStat(teamTotals.wOBA, true)}</td>
                  <td className="px-4 py-4">{formatStat(teamTotals.RC)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TeamProfile;