

import React, { useState, useEffect, useMemo } from 'react';
import { PlayerStats } from '../types';
import { getAllPlayerStats } from '../services/statsService';
import PlayerProfileCard from './PlayerProfileCard';
import { UsersIcon, UserCircleIcon } from './Icons';

const PlayersView: React.FC = () => {
    const [allStats, setAllStats] = useState<Record<string, PlayerStats>>({});
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setAllStats(getAllPlayerStats());
    }, []);
    
    const sortedPlayers = useMemo(() => {
       // FIX: Add explicit types for 'player', 'a', and 'b' to resolve type inference issues.
       return Object.values(allStats)
        .filter((player: PlayerStats) => player.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a: PlayerStats, b: PlayerStats) => a.name.localeCompare(b.name));
    }, [allStats, searchTerm]);

    if (selectedPlayer) {
        return (
            <div className="container mx-auto max-w-4xl py-8 px-4">
                <button 
                    onClick={() => setSelectedPlayer(null)} 
                    className="mb-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                    &larr; Back to Player List
                </button>
                <div className="flex items-center gap-4 mb-6">
                    <UserCircleIcon className="w-16 h-16 text-green-400" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">{selectedPlayer.name}</h1>
                        <p className="text-gray-400">Career Statistics</p>
                    </div>
                </div>
                <PlayerProfileCard stats={selectedPlayer} />
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="flex items-center mb-8">
                <UsersIcon className="w-10 h-10 text-green-400 mr-4"/>
                <h1 className="text-4xl font-bold text-white">Player Statistics</h1>
            </div>
            
            <input 
                type="text"
                placeholder="Search for a player..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 mb-6 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />

            <div className="space-y-3">
                {sortedPlayers.length > 0 ? (
                    sortedPlayers.map(playerStats => (
                        <div 
                            key={playerStats.name} 
                            className="bg-slate-800 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-colors"
                            onClick={() => setSelectedPlayer(playerStats)}
                        >
                            <p className="font-bold text-white text-lg">{playerStats.name}</p>
                            <div className="text-right text-sm text-gray-400">
                                <span>Runs: <span className="font-semibold text-white">{playerStats.runsScored}</span></span>
                                <span className="ml-4">Wickets: <span className="font-semibold text-white">{playerStats.wicketsTaken}</span></span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No player stats found. Complete a match to see stats here.</p>
                )}
            </div>
        </div>
    );
};

export default PlayersView;
