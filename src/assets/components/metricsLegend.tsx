import React from 'react';
import { BookOpen } from 'lucide-react';

const MetricsLegend: React.FC = () => {
  const standardMetrics = [
    { acronym: "GP", name: "Games Played" },
    { acronym: "PA", name: "Plate Appearances" },
    { acronym: "AB", name: "At Bats" },
    { acronym: "H", name: "Hits" },
    { acronym: "1B", name: "Singles" },
    { acronym: "2B", name: "Doubles" },
    { acronym: "3B", name: "Triples" },
    { acronym: "HR", name: "Home Runs" },
    { acronym: "RBI", name: "Runs Batted In" },
    { acronym: "R", name: "Runs Scored" },
    { acronym: "HBP", name: "Hit By Pitch" },
    { acronym: "ROE", name: "Reached On Error" },
    { acronym: "FC", name: "Fielder's Choice" },
    { acronym: "CI", name: "Catcher's Interference" },
    { acronym: "BB", name: "Base on Balls (Walks)" },
    { acronym: "SO", name: "Strikeouts" },
    { acronym: "SF", name: "Sacrifice Flies" },
    { acronym: "SB", name: "Stolen Bases" },
  ];

  const advancedMetrics = [
    { acronym: "AVG", name: "Batting Average", desc: "Hits per At Bat (H / AB)" },
    { acronym: "OBP", name: "On-Base Percentage", desc: "How frequently a batter reaches base (H + BB + HBP) / (AB + BB + HBP + SF)" },
    { acronym: "SLG", name: "Slugging Percentage", desc: "Total bases achieved per At Bat" },
    { acronym: "OPS", name: "On-Base Plus Slugging", desc: "Combines OBP and SLG into a single offensive metric" },
    { acronym: "ISO", name: "Isolated Power", desc: "Measures raw power (SLG - AVG)" },
    { acronym: "BABIP", name: "Batting Average on Balls In Play", desc: "How often a ball in play goes for a hit" },
    { acronym: "wOBA", name: "Weighted On-Base Average", desc: "Combines all aspects of hitting into one metric, weighting them in proportion to their actual run value" },
    { acronym: "RC", name: "Runs Created", desc: "Estimates a player's total run contribution to their team" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="w-8 h-8 text-[#DF4601]" />
        <h2 className="text-3xl font-bold text-gray-900">Metrics Legend</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border-t-4 border-[#000000] overflow-hidden h-fit">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
             <h3 className="font-bold text-lg text-gray-800">Standard Metrics</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2 w-24">Acronym</th>
                <th className="px-4 py-2">Full Statistic Name</th>
              </tr>
            </thead>
            <tbody>
              {standardMetrics.map((m, i) => (
                <tr key={m.acronym} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2 font-bold text-[#DF4601]">{m.acronym}</td>
                  <td className="px-4 py-2">{m.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-md border-t-4 border-[#DF4601] overflow-hidden h-fit">
           <div className="bg-orange-50 p-4 border-b border-orange-100">
             <h3 className="font-bold text-lg text-[#DF4601]">Advanced Sabermetrics</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-orange-100 text-[#DF4601]">
              <tr>
                <th className="px-4 py-2 w-24">Acronym</th>
                <th className="px-4 py-2">Meaning & Calculation</th>
              </tr>
            </thead>
            <tbody>
              {advancedMetrics.map((m, i) => (
                <tr key={m.acronym} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 font-bold text-[#000000] align-top">{m.acronym}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold mb-1">{m.name}</div>
                    <div className="text-gray-600 text-xs">{m.desc}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetricsLegend;