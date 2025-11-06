
import React from 'react';
import { PlayerStats } from '../types';

interface PlayerProfileCardProps {
    stats: PlayerStats;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="font-bold text-white text-lg">{value}</span>
    </div>
);

const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({ stats }) => {

    const battingAverage = (stats.inningsBatted - stats.notOuts > 0) 
        ? (stats.runsScored / (stats.inningsBatted - stats.notOuts)).toFixed(2) 
        : 'N/A';

    const strikeRate = stats.ballsFaced > 0 
        ? ((stats.runsScored / stats.ballsFaced) * 100).toFixed(2) 
        : '0.00';

    const bowlingAverage = stats.wicketsTaken > 0 
        ? (stats.runsConceded / stats.wicketsTaken).toFixed(2)
        : 'N/A';
        
    const oversToBalls = (overs: number) => {
        const o = Math.floor(overs);
        const b = Math.round((overs - o) * 10);
        return o * 6 + b;
    };

    const economy = stats.oversBowled > 0
        ? ((stats.runsConceded / oversToBalls(stats.oversBowled)) * 6).toFixed(2)
        : '0.00';

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-white">Batting Career</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 mt-4">
                    <StatItem label="Matches" value={stats.matches} />
                    <StatItem label="Innings" value={stats.inningsBatted} />
                    <StatItem label="Not Outs" value={stats.notOuts} />
                    <StatItem label="Runs" value={stats.runsScored} />
                    <StatItem label="Highest Score" value={stats.highestScore} />
                    <StatItem label="Average" value={battingAverage} />
                    <StatItem label="Strike Rate" value={strikeRate} />
                    <StatItem label="100s" value={stats.hundreds} />
                    <StatItem label="50s" value={stats.fifties} />
                    <StatItem label="4s" value={stats.fours} />
                    <StatItem label="6s" value={stats.sixes} />
                </div>
            </div>
             <div>
                <h3 className="text-2xl font-bold text-white">Bowling Career</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 mt-4">
                    <StatItem label="Matches" value={stats.matches} />
                    <StatItem label="Wickets" value={stats.wicketsTaken} />
                    <StatItem label="Average" value={bowlingAverage} />
                    <StatItem label="Economy" value={economy} />
                    <StatItem label="Best Bowling" value={stats.bestBowling ? `${stats.bestBowling.wickets}/${stats.bestBowling.runs}` : '-'} />
                    <StatItem label="Overs" value={stats.oversBowled.toFixed(1)} />
                </div>
            </div>
        </div>
    );
};

export default PlayerProfileCard;
