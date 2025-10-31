import React from 'react';
import { Team, Player } from '../types';

interface BowlingCardProps {
  team: Team;
}

const BowlingCard: React.FC<BowlingCardProps> = ({ team }) => {
  const bowlers = team.players.filter(p => p.overs > 0);

  const calculateEconomy = (player: Player) => {
    if (player.overs === 0) return '0.00';
    const oversInt = Math.floor(player.overs);
    const balls = Math.round((player.overs - oversInt) * 10);
    const totalBalls = oversInt * 6 + balls;
    if (totalBalls === 0) return '0.00';
    return ((player.runsConceded / totalBalls) * 6).toFixed(2);
  };
  
  const renderBowlerRow = (player: Player) => {
    return (
      <tr key={player.id} className="hover:bg-slate-800/50">
        <td className="px-4 py-2 font-semibold text-white">{player.name}</td>
        <td className="px-4 py-2 text-center text-gray-300">{player.overs.toFixed(1)}</td>
        <td className="px-4 py-2 text-center text-gray-300">{player.maidens}</td>
        <td className="px-4 py-2 text-center text-gray-300">{player.runsConceded}</td>
        <td className="px-4 py-2 text-center font-bold text-white">{player.wickets}</td>
        <td className="px-4 py-2 text-center text-gray-300 font-mono">{calculateEconomy(player)}</td>
      </tr>
    );
  };

  return (
    <div className="text-white">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Bowler</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">O</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">M</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">R</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">W</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">Econ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {bowlers.map(renderBowlerRow)}
           {bowlers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">Yet to bowl</td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default BowlingCard;
