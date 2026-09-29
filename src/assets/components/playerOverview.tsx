import React, { useState, useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
     LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { User } from 'lucide-react';
import { THEME } from '../constants/theme';
import { CleanStats, FullSeasonStats, PlayerClean } from '../interface/interface';
import { aggregateStats, calculateMetrics, formatStat } from '../constants/metrics';

const PlayerOverview: React.FC<{ processedData: PlayerClean[] }> = ({ processedData }) => {
    const [selectedPlayer, setSelectedPlayer] = useState<string>(processedData[0]?.Player || "");
    const [sortConfig, setSortConfig] = useState<{ key: keyof FullSeasonStats; direction: 'asc' | 'desc' }>({ key: 'Year', direction: 'asc' });

    const player = useMemo(() => processedData.find(p => p.Player === selectedPlayer), [selectedPlayer, processedData]);

    // Static chronological data for charts
    const chronologicalSeasonData: FullSeasonStats[] = useMemo(() => {
        if (!player) return [];
        return player.Seasons.map(s => ({
            ...s,
            ...calculateMetrics(s)
        })).sort((a, b) => a.Year.localeCompare(b.Year));
    }, [player]);

    // Sorted data exclusively for the table
    const sortedTableData: FullSeasonStats[] = useMemo(() => {
        const dataToSort = [...chronologicalSeasonData];
        
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
    }, [chronologicalSeasonData, sortConfig]);

    const careerStats = useMemo(() => {
        if (!player) return null;
        const agg = aggregateStats(player.Seasons);
        return { ...agg, ...calculateMetrics(agg) };
    }, [player]);

    const requestSort = (key: keyof FullSeasonStats) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const radarData = careerStats ? [
        { metric: 'AVG', value: careerStats.AVG, fullMark: 0.400 },
        { metric: 'OBP', value: careerStats.OBP, fullMark: 0.500 },
        { metric: 'SLG', value: careerStats.SLG, fullMark: 0.800 },
        { metric: 'ISO', value: careerStats.ISO, fullMark: 0.400 },
        { metric: 'wOBA', value: careerStats.wOBA, fullMark: 0.500 },
        { metric: 'BABIP', value: careerStats.BABIP, fullMark: 0.450 },
    ] : [];

    const SortableHeader = ({ label, sortKey, className = "px-4 py-3" }: { label: string, sortKey: keyof FullSeasonStats, className?: string }) => (
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
                    <User className="w-8 h-8 text-[#DF4601]" />
                    <h2 className="text-3xl font-bold text-gray-900">Player Overview</h2>
                </div>

                <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="px-4 py-2 border-2 border-[#000000] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DF4601] bg-white font-semibold min-w-[200px]"
                >
                    {processedData.map(p => (
                        <option key={p.Player} value={p.Player}>{p.Player} ({p.Status})</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#DF4601] lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Performance Trend (OPS)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chronologicalSeasonData}>
                                <defs>
                                    <linearGradient id="colorOPS" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="Year" />
                                <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                                <Tooltip />
                                <Area type="monotone" dataKey="OPS" stroke={THEME.primary} fillOpacity={1} fill="url(#colorOPS)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#000000] p-6 rounded-xl shadow-md border-t-4 border-[#DF4601] flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-white">Career Signature</h3>
                    <div className="flex-grow h-64 text-white">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#FFFFFF', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                                <Radar name="Metrics" dataKey="value" stroke={THEME.primary} fill={THEME.primary} fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: THEME.primary }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#000000]">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Hits Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chronologicalSeasonData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="Year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="1B" stackId="a" fill="#9ca3af" />
                                <Bar dataKey="2B" stackId="a" fill="#4b5563" />
                                <Bar dataKey="3B" stackId="a" fill={THEME.secondary} />
                                <Bar dataKey="HR" stackId="a" fill={THEME.primary} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#000000]">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Plate Discipline (BB vs SO)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chronologicalSeasonData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="Year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="BB" stroke={THEME.primary} strokeWidth={2} />
                                <Line type="monotone" dataKey="SO" stroke={THEME.secondary} strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#DF4601]">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Advanced Value</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chronologicalSeasonData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="Year" />
                                <YAxis domain={[0, 'auto']} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="wOBA" stroke={THEME.primary} strokeWidth={3} />
                                <Line type="monotone" dataKey="ISO" stroke={THEME.secondary} />
                                <Line type="monotone" dataKey="BABIP" stroke="#10b981" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mt-6">
                <div className="bg-[#000] p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">Historical Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b-2 border-[#DF4601]">
                            <tr>
                                <SortableHeader label="Year" sortKey="Year" />
                                <SortableHeader label="Team" sortKey="Team" />
                                <SortableHeader label="G" sortKey="GP" />
                                <SortableHeader label="AB" sortKey="AB" />
                                <SortableHeader label="R" sortKey="R" />
                                <SortableHeader label="H" sortKey="H" />
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
                            {sortedTableData.map((row) => (
                                <tr key={`${row.Year}-${row.Team}`} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold">{row.Year}</td>
                                    <td className="px-4 py-3">{row.Team}</td>
                                    <td className="px-4 py-3">{row.GP}</td>
                                    <td className="px-4 py-3">{row.AB}</td>
                                    <td className="px-4 py-3">{row.R}</td>
                                    <td className="px-4 py-3">{row.H}</td>
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
                            {careerStats && (
                                <tr className="bg-[#DF4601] text-white font-bold border-t-4 border-[#000000]">
                                    <td className="px-4 py-4" colSpan={2}>CAREER TOTALS</td>
                                    <td className="px-4 py-4">{careerStats.GP}</td>
                                    <td className="px-4 py-4">{careerStats.AB}</td>
                                    <td className="px-4 py-4">{careerStats.R}</td>
                                    <td className="px-4 py-4">{careerStats.H}</td>
                                    <td className="px-4 py-4">{careerStats.HR}</td>
                                    <td className="px-4 py-4">{careerStats.RBI}</td>
                                    <td className="px-4 py-4">{careerStats.SB}</td>
                                    <td className="px-4 py-4">{formatStat(careerStats.AVG, true)}</td>
                                    <td className="px-4 py-4">{formatStat(careerStats.OBP, true)}</td>
                                    <td className="px-4 py-4">{formatStat(careerStats.SLG, true)}</td>
                                    <td className="px-4 py-4">{formatStat(careerStats.OPS, true)}</td>
                                    <td className="px-4 py-4">{formatStat(careerStats.wOBA, true)}</td>
                                    <td className="px-4 py-4">{formatStat(careerStats.RC)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlayerOverview;