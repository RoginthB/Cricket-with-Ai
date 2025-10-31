import React, { useState, useEffect } from 'react';
import { MatchState, MatchSummaryData } from '../types';
import { generateMatchSummary } from '../services/geminiService';
import { TrophyIcon, UserCircleIcon, CricketBallIcon } from './Icons';

interface MatchSummaryProps {
  matchState: MatchState;
}

const MatchSummary: React.FC<MatchSummaryProps> = ({ matchState }) => {
    const [summary, setSummary] = useState<MatchSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!matchState.isMatchOver) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await generateMatchSummary(matchState);
                setSummary(data);
            } catch (e: any) {
                setError("Could not generate AI summary. Please check API key.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, [matchState]);
    
    const { matchWinner, teams, innings, playersPerTeam = 11 } = matchState;
    const firstInnings = innings[0]!;
    const secondInnings = innings[1];

    let margin = "";
    if (matchWinner) {
        if (secondInnings && matchWinner.id === secondInnings.battingTeam.id) {
            const wicketsLeft = (playersPerTeam - 1) - secondInnings.battingTeam.wickets;
            margin = `won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
        } else if (firstInnings && matchWinner.id === firstInnings.battingTeam.id) {
            const runDifference = firstInnings.battingTeam.score - (secondInnings ? secondInnings.battingTeam.score : 0);
            margin = `won by ${runDifference} run${runDifference !== 1 ? 's' : ''}`;
        }
    } else {
        margin = "Match Tied";
    }

    const renderSummaryContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-8">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-gray-300">Generating AI Match Summary...</p>
                </div>
            );
        }

        if (error || !summary) {
            return <div className="text-center p-8 text-red-400 bg-red-900/50 rounded-lg">{error || "An unknown error occurred."}</div>;
        }

        return (
            <>
                <p className="text-lg text-gray-300 italic text-center mb-6">"{summary.narrative}"</p>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-100 border-b border-slate-700 pb-3">Top Performers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/70 p-4 rounded-lg flex items-center">
                        <UserCircleIcon className="w-12 h-12 text-blue-400 mr-4"/>
                        <div>
                            <p className="text-xs text-gray-400">Top Batsman</p>
                            <p className="font-bold text-white text-lg">{summary.topBatsman.name}</p>
                            <p className="text-sm text-gray-300">{summary.topBatsman.team}</p>
                            <p className="font-mono text-blue-400 font-semibold">{summary.topBatsman.stat1}</p>
                        </div>
                    </div>
                     <div className="bg-slate-900/70 p-4 rounded-lg flex items-center">
                        <CricketBallIcon className="w-12 h-12 text-red-400 mr-4"/>
                        <div>
                            <p className="text-xs text-gray-400">Top Bowler</p>
                            <p className="font-bold text-white text-lg">{summary.topBowler.name}</p>
                            <p className="text-sm text-gray-300">{summary.topBowler.team}</p>
                            <p className="font-mono text-red-400 font-semibold">{summary.topBowler.stat1}</p>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-white mb-2">Match Summary</h2>
                <div className="flex items-center justify-center text-yellow-400 font-bold text-xl">
                    <TrophyIcon className="w-8 h-8 mr-2"/>
                    <span>{matchWinner ? `${matchWinner.name} ${margin}` : margin}</span>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{teams[0].name}</span>
                        <span className="font-bold text-2xl">{teams[0].score}/{teams[0].wickets} <span className="text-base text-gray-400">({teams[0].overs.toFixed(1)})</span></span>
                    </div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{teams[1].name}</span>
                        <span className="font-bold text-2xl">{teams[1].score}/{teams[1].wickets} <span className="text-base text-gray-400">({secondInnings ? secondInnings.battingTeam.overs.toFixed(1) : '0.0'})</span></span>
                    </div>
                </div>
            </div>

            {renderSummaryContent()}

        </div>
    );
};

export default MatchSummary;

// Add this to your CSS or a style tag in index.html for the animation
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