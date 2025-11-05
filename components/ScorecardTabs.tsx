import React, { useState } from 'react';
import { Team, Innings } from '../types';
import BattingCard from './BattingCard';
import BowlingCard from './BowlingCard';

interface ScorecardTabsProps {
  teams: [Team, Team];
  innings: [Innings, Innings | null];
  isSummaryView?: boolean;
}

type ActiveTab = 'team1bat' | 'team1bowl' | 'team2bat' | 'team2bowl';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 whitespace-nowrap ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-gray-300 hover:bg-slate-700'
    }`}
  >
    {label}
  </button>
);


const ScorecardTabs: React.FC<ScorecardTabsProps> = ({ teams, innings, isSummaryView = false }) => {
    const [team1, team2] = teams;

    // Determine the initially active tab based on the current batting team
    const getInitialTab = (): ActiveTab => {
        const currentInningsData = innings[1] || innings[0];
        if (currentInningsData && currentInningsData.battingTeam.id === team1.id) return 'team1bat';
        if (currentInningsData && currentInningsData.battingTeam.id === team2.id) return 'team2bat';
        return 'team1bat';
    };
    
    const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTab());

    const team1BattingInnings = innings.find(inn => inn && inn.battingTeam.id === team1.id);
    const team1BowlingInnings = innings.find(inn => inn && inn.bowlingTeam.id === team1.id);
    
    const team2BattingInnings = innings.find(inn => inn && inn.battingTeam.id === team2.id);
    const team2BowlingInnings = innings.find(inn => inn && inn.bowlingTeam.id === team2.id);

    const renderContent = () => {
        switch (activeTab) {
        case 'team1bat':
            return team1BattingInnings 
            ? <BattingCard inningsData={team1BattingInnings} collapsible={!isSummaryView} /> 
            : <div className="p-4 text-center text-gray-500">Yet to bat</div>;
        case 'team1bowl':
            return team1BowlingInnings 
            ? <BowlingCard team={team1} />
            : <div className="p-4 text-center text-gray-500">Yet to bowl</div>;
        case 'team2bat':
            return team2BattingInnings 
            ? <BattingCard inningsData={team2BattingInnings} collapsible={!isSummaryView} />
            : <div className="p-4 text-center text-gray-500">Yet to bat</div>;
        case 'team2bowl':
            return team2BowlingInnings
            ? <BowlingCard team={team2} />
            : <div className="p-4 text-center text-gray-500">Yet to bowl</div>;
        default:
            return null;
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center border-b border-slate-700 mb-4 pb-3 space-x-2 overflow-x-auto">
            <TabButton label={`${team1.name} Batting`} isActive={activeTab === 'team1bat'} onClick={() => setActiveTab('team1bat')} />
            <TabButton label={`${team1.name} Bowling`} isActive={activeTab === 'team1bowl'} onClick={() => setActiveTab('team1bowl')} />
            <TabButton label={`${team2.name} Batting`} isActive={activeTab === 'team2bat'} onClick={() => setActiveTab('team2bat')} />
            <TabButton label={`${team2.name} Bowling`} isActive={activeTab === 'team2bowl'} onClick={() => setActiveTab('team2bowl')} />
        </div>
        <div className="overflow-x-auto">
            {renderContent()}
        </div>
        </div>
    );
};

export default ScorecardTabs;