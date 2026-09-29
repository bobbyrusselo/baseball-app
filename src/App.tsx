import React, { useState, useMemo } from 'react';

// Import types
import { PlayerRaw,  PlayerClean,  } from './assets/interface/interface';
// Import icons
import {
  Users, User,  LayoutDashboard, 
   Award, Target, BookOpen, ClipboardList
} from 'lucide-react';

// Import utility functions
import {cleanData,} from './assets/constants/metrics.js';

// Import raw player data
import {stats} from './assets/data/player_grouped_stats.jsx';
const processedData = cleanData(stats as PlayerRaw[]);

// Function to get all unique years available in the dataset
const allYearsAvailable = (processedData: PlayerClean[]) => {
  return Array.from(
    new Set(processedData.flatMap(p => p.Seasons.map(s => s.Year)))
  ).sort((a, b) => b.localeCompare(a)); // Descending order
};

// Import team logo and style
const bird = '/bird.jpeg';
import { THEME } from './assets/constants/theme';


// Import components

import TeamOverview from './assets/components/teamOverview';
import TeamProfile from './assets/components/teamProfile';
import PlayerOverview from './assets/components/playerOverview';
import ComparePlayers from './assets/components/comparePlayers';
import MetricsLegend from './assets/components/metricsLegend.js';

// Main App Component

export default function App() {
  const [activeTab, setActiveTab] = useState<'team' | 'teamProfile' | 'player' | 'compare' | 'legend'>('team');

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-gray-800 selection:bg-[#DF4601] selection:text-white flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#000000] text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div>
            <img src={bird} alt="Company Logo" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider uppercase text-[#DF4601]">London Orioles</h1>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Baseball</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activeTab === 'team' ? 'bg-[#DF4601] text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Team Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('teamProfile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activeTab === 'teamProfile' ? 'bg-[#DF4601] text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <ClipboardList className="w-5 h-5" /> Team Profile
          </button>

          <button 
            onClick={() => setActiveTab('player')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activeTab === 'player' ? 'bg-[#DF4601] text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <User className="w-5 h-5" /> Player Profile
          </button>

          <button 
            onClick={() => setActiveTab('compare')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activeTab === 'compare' ? 'bg-[#DF4601] text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Target className="w-5 h-5" /> Player vs Player
          </button>

          <button 
            onClick={() => setActiveTab('legend')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activeTab === 'legend' ? 'bg-[#DF4601] text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <BookOpen className="w-5 h-5" /> Metrics Legend
          </button>
        </nav>

        <div className="p-6 border-t border-gray-800 text-xs text-gray-500">
           <p className="flex items-center gap-2"><Award className="w-4 h-4 text-[#DF4601]"/> Front Office Access</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[100vw]">
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#DF4601]">
          <div>
         
            <h2 className="text-xl font-bold text-gray-900">Advanced Scouting & Sabermetrics</h2>
          </div>
          <div className="hidden md:flex items-center text-sm font-bold bg-gray-100 px-4 py-2 rounded-lg text-gray-600">
            Season: <span className="text-[#000000] ml-2">2016 - 2026</span>
          </div>
        </header>

        {activeTab === 'team' && <TeamOverview processedData={processedData} />}
        {activeTab === 'teamProfile' && <TeamProfile processedData={processedData} allYearsAvailable={allYearsAvailable} />}
        {activeTab === 'player' && <PlayerOverview processedData={processedData} />}
        {activeTab === 'compare' && <ComparePlayers processedData={processedData} allYearsAvailable={allYearsAvailable} />}
        {activeTab === 'legend' && <MetricsLegend />}
        
      </main>
    </div>
  );
}