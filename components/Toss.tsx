import React, { useState } from 'react';
import { Team } from '../types';
import { CricketBallIcon, PencilIcon } from './Icons';
import RosterEditModal from './RosterEditModal';

interface TossProps {
  teams: [Team, Team];
  onCompleteToss: (winnerId: number, decision: 'bat' | 'bowl', maxOvers: number) => void;
  onUpdateRosters: (updatedTeams: [Team, Team]) => void;
}

const SelectionButton: React.FC<{
  label: string;
  onClick: () => void;
  isSelected: boolean;
}> = ({ label, onClick, isSelected }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${
      isSelected
        ? 'bg-green-500 border-green-400 text-white shadow-lg scale-105'
        : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600 hover:border-slate-500'
    }`}
  >
    {label}
  </button>
);

const Toss: React.FC<TossProps> = ({ teams, onCompleteToss, onUpdateRosters }) => {
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [decision, setDecision] = useState<'bat' | 'bowl' | null>(null);
  const [maxOvers, setMaxOvers] = useState<number>(20);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  const handleStartMatch = () => {
    if (winnerId !== null && decision !== null && maxOvers > 0) {
      onCompleteToss(winnerId, decision, maxOvers);
    }
  };
  
  const handleSaveRosters = (updatedTeams: [Team, Team]) => {
      onUpdateRosters(updatedTeams);
      setIsRosterModalOpen(false);
  };

  return (
    <>
      <RosterEditModal 
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        teams={teams}
        onSave={handleSaveRosters}
      />
      <div className="container mx-auto max-w-lg py-12 px-4">
        <div className="bg-slate-800 rounded-xl shadow-lg p-8 space-y-8">
          <div className="text-center">
            <CricketBallIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-white">Coin Toss</h2>
            <p className="text-gray-400 mt-2">Decide who bats first to start the match.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">1. Who won the toss?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectionButton
                label={teams[0].name}
                onClick={() => setWinnerId(teams[0].id)}
                isSelected={winnerId === teams[0].id}
              />
              <SelectionButton
                label={teams[1].name}
                onClick={() => setWinnerId(teams[1].id)}
                isSelected={winnerId === teams[1].id}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">2. Winner's Decision</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectionButton
                label="Bat First"
                onClick={() => setDecision('bat')}
                isSelected={decision === 'bat'}
              />
              <SelectionButton
                label="Bowl First"
                onClick={() => setDecision('bowl')}
                isSelected={decision === 'bowl'}
              />
            </div>
          </div>
          
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">3. Set Match Overs</h3>
              <input
                  type="number"
                  value={maxOvers}
                  onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setMaxOvers(isNaN(value) || value < 1 ? 1 : value);
                  }}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-center font-semibold text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="1"
              />
          </div>
          
          <div className="border-t border-slate-700 pt-6 space-y-4">
            <button
                onClick={() => setIsRosterModalOpen(true)}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                <PencilIcon className="w-5 h-5"/>
                Review & Edit Rosters
            </button>
            <button
              onClick={handleStartMatch}
              disabled={winnerId === null || decision === null || !maxOvers || maxOvers <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-colors duration-300 text-xl"
            >
              Start Match
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Toss;
