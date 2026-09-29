import react from 'react';
import { Users } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { THEME } from '../constants/theme';
import { CleanStats, FullSeasonStats, PlayerClean } from '../interface/interface';
import { aggregateStats, calculateMetrics, formatStat } from '../constants/metrics';

const TeamOverview: React.FC<{ processedData: PlayerClean[] }> = ({ processedData }) => {
  // Aggregate stats per year across all players
  const yearlyStatsMap = new Map<string, CleanStats[]>();
  processedData.forEach(player => {
    player.Seasons.forEach(season => {
      const existing = yearlyStatsMap.get(season.Year) || [];
      yearlyStatsMap.set(season.Year, [...existing, season]);
    });
  });

  const teamYearlyData: FullSeasonStats[] = Array.from(yearlyStatsMap.entries())
    .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
    .map(([year, seasons]) => {
      const agg = aggregateStats(seasons);
      agg.Year = year;
      return { ...agg, ...calculateMetrics(agg) };
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3">
        <Users className="w-8 h-8 text-[#DF4601]" />
        <h2 className="text-3xl font-bold text-gray-900">Team Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: YoY Team OPS */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#DF4601]">
          <h3 className="text-lg font-bold mb-4 text-gray-800">YoY Team OPS</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamYearlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="Year" tick={{fill: THEME.darkGray}} />
                <YAxis domain={['auto', 'auto']} tick={{fill: THEME.darkGray}} />
                <Tooltip contentStyle={{borderColor: THEME.primary}} />
                <Line type="monotone" dataKey="OPS" stroke={THEME.primary} strokeWidth={3} dot={{r: 4, fill: THEME.secondary}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: YoY Runs & RBI */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#000000]">
          <h3 className="text-lg font-bold mb-4 text-gray-800">YoY Runs & RBI</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamYearlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="Year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="R" name="Runs" fill={THEME.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="RBI" fill={THEME.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: YoY SO vs BB */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#000000]">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Strikeouts vs Walks (Discipline)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamYearlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="Year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="SO" name="Strikeouts" fill={THEME.secondary} opacity={0.8} />
                <Bar dataKey="BB" name="Walks" fill={THEME.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* Chart 4: YoY Rate Stats */}
         <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#DF4601]">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Slash Line (AVG/OBP/SLG)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamYearlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="Year" />
                <YAxis domain={[0, 0.6]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="AVG" stroke="#6b7280" strokeWidth={2} />
                <Line type="monotone" dataKey="OBP" stroke={THEME.primary} strokeWidth={2} />
                <Line type="monotone" dataKey="SLG" stroke={THEME.secondary} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white uppercase bg-[#000000]">
              <tr>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">GP</th>
                <th className="px-4 py-3">AB</th>
                <th className="px-4 py-3">R</th>
                <th className="px-4 py-3">H</th>
                <th className="px-4 py-3">HR</th>
                <th className="px-4 py-3">RBI</th>
                <th className="px-4 py-3 bg-[#DF4601]">AVG</th>
                <th className="px-4 py-3 bg-[#DF4601]">OBP</th>
                <th className="px-4 py-3 bg-[#DF4601]">SLG</th>
                <th className="px-4 py-3 bg-[#DF4601]">OPS</th>
              </tr>
            </thead>
            <tbody>
              {teamYearlyData.map((row, i) => (
                <tr key={row.Year} className={`border-b ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-orange-50`}>
                  <td className="px-4 py-3 font-bold">{row.Year}</td>
                  <td className="px-4 py-3">{row.GP}</td>
                  <td className="px-4 py-3">{row.AB}</td>
                  <td className="px-4 py-3">{row.R}</td>
                  <td className="px-4 py-3">{row.H}</td>
                  <td className="px-4 py-3">{row.HR}</td>
                  <td className="px-4 py-3">{row.RBI}</td>
                  <td className="px-4 py-3 font-medium text-[#DF4601]">{formatStat(row.AVG, true)}</td>
                  <td className="px-4 py-3 font-medium text-[#DF4601]">{formatStat(row.OBP, true)}</td>
                  <td className="px-4 py-3 font-medium text-[#DF4601]">{formatStat(row.SLG, true)}</td>
                  <td className="px-4 py-3 font-bold text-black">{formatStat(row.OPS, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;