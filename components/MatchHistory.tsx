import React, { useState } from 'react';
import { MatchState } from '../types';
import MatchSummary from './MatchSummary';
import { HistoryIcon } from './Icons';

interface MatchHistoryProps {
  matches: MatchState[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchState | null>(null);
  const completedMatches = matches.filter(m => m.status === 'completed');

  if (selectedMatch) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => setSelectedMatch(null)} className="mb-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
                &larr; Back to History
            </button>
            <MatchSummary matchState={selectedMatch} />
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex items-center mb-8">
            <HistoryIcon className="w-10 h-10 text-blue-400 mr-4"/>
            <h1 className="text-4xl font-bold text-white">Match History</h1>
        </div>
        <div className="space-y-4">
            {completedMatches.length > 0 ? (
                completedMatches.slice().reverse().map(match => (
                    <div key={match.id} className="bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="font-bold text-white">{match.description}</p>
                            <p className="text-sm text-gray-400">
                                {match.matchWinner ? `${match.matchWinner.name} won` : 'Match Tied'}
                            </p>
                        </div>
                        <button onClick={() => setSelectedMatch(match)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg self-end sm:self-auto">
                            View Summary
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 py-8">No completed matches found.</p>
            )}
        </div>
    </div>
  );
};

export default MatchHistory;