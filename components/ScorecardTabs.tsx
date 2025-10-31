import React, { useState } from 'react';
import { Team, Innings } from '../types';
import BattingCard from './BattingCard';
import BowlingCard from './BowlingCard';

type Tab = 't1Bat' | 't1Bowl' | 't2Bat' | 't2Bowl';

interface ScorecardTabsProps {
  teams: [Team, Team];
  innings: [Innings, Innings | null];
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-gray-300 hover:bg-slate-700'
    }`}
  >
    {label}
  </button>
);


const ScorecardTabs: React.FC<ScorecardTabsProps> = ({ teams, innings }) => {
  const [activeTab, setActiveTab] = useState<Tab>('t1Bat');
  
  const [team1, team2] = teams;
  const [innings1, innings2] = innings;

  const renderContent = () => {
    switch (activeTab) {
      case 't1Bat':
        return innings1 ? <BattingCard inningsData={innings1} /> : null;
      case 't1Bowl':
        return <BowlingCard team={team2} />;
      case 't2Bat':
        return innings2 ? <BattingCard inningsData={innings2} /> : <div>Second innings has not started.</div>;
      case 't2Bowl':
        return <BowlingCard team={team1} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center border-b border-slate-700 mb-4 pb-3 space-x-2 overflow-x-auto">
        <TabButton label={`${team1.name} Batting`} isActive={activeTab === 't1Bat'} onClick={() => setActiveTab('t1Bat')} />
        <TabButton label={`${team1.name} Bowling`} isActive={activeTab === 't1Bowl'} onClick={() => setActiveTab('t1Bowl')} />
        <TabButton label={`${team2.name} Batting`} isActive={activeTab === 't2Bat'} onClick={() => setActiveTab('t2Bat')} />
        <TabButton label={`${team2.name} Bowling`} isActive={activeTab === 't2Bowl'} onClick={() => setActiveTab('t2Bowl')} />
      </div>
      <div className="overflow-x-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ScorecardTabs;
