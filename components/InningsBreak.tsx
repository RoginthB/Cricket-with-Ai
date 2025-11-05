import React from 'react';
import { MatchState } from '../types';
import BattingCard from './BattingCard';
import BowlingCard from './BowlingCard';
import { RedoIcon } from './Icons';

interface InningsBreakProps {
  matchState: MatchState;
  onStartSecondInnings: () => void;
}

const InningsBreak: React.FC<InningsBreakProps> = ({ matchState, onStartSecondInnings }) => {
  const firstInnings = matchState.innings[0];

  if (!firstInnings) {
    return <div className="text-center p-8">Error: Innings data not found.</div>;
  }
  
  const { battingTeam, bowlingTeam } = firstInnings;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 animate-fade-in">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 space-y-6">
        <div className="text-center border-b border-slate-700 pb-6">
          <h2 className="text-4xl font-extrabold text-white mb-2">Innings Break</h2>
          <p className="text-lg text-gray-300">
            {battingTeam.name} set a target of <span className="text-yellow-400 font-bold">{matchState.target}</span> runs.
          </p>
        </div>
        
        <div className="text-center bg-slate-900/50 p-4 rounded-lg">
             <p className="font-semibold text-xl text-white">{battingTeam.name} Innings</p>
             <p className="font-extrabold text-4xl tracking-tighter text-white">{battingTeam.score} / {battingTeam.wickets}</p>
             <p className="text-gray-400">({battingTeam.overs.toFixed(1)} Overs)</p>
        </div>

        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-white mb-3">{battingTeam.name} - Batting</h3>
                <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
                    <BattingCard inningsData={firstInnings} collapsible={false} />
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white mb-3">{bowlingTeam.name} - Bowling</h3>
                <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
                    <BowlingCard team={bowlingTeam} />
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <button
            onClick={onStartSecondInnings}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors duration-300 text-xl flex items-center justify-center gap-3"
          >
            Start 2nd Innings
            <RedoIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InningsBreak;

// Add animation style if not already present globally
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);