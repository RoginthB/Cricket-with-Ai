import React from 'react';
import { Innings, Player } from '../types';

interface BattingCardProps {
  inningsData: Innings;
}

const BattingCard: React.FC<BattingCardProps> = ({ inningsData }) => {
  const { battingTeam, fallOfWickets } = inningsData;
  
  const renderBatsmanRow = (player: Player) => {
    const strikeRate = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(2) : '0.00';
    let status = <span className="text-xs text-gray-500">Yet to bat</span>;
    if (player.balls > 0 || player.isOut) {
      status = player.isOut 
        ? <span className="text-xs text-gray-400">{player.outMethod}</span>
        : <span className="text-xs text-green-400">not out</span>;
    }

    return (
      <tr key={player.id} className="hover:bg-slate-800/50">
        <td className="px-4 py-2">
          <p className="font-semibold text-white">{player.name}</p>
          {status}
        </td>
        <td className="px-4 py-2 text-center font-bold text-lg text-white">{player.runs}</td>
        <td className="px-4 py-2 text-center text-gray-300">{player.balls}</td>
        <td className="px-4 py-2 text-center text-gray-300">{player.fours}</td>
        <td className="px-4 py-2 text-center text-gray-300">{player.sixes}</td>
        <td className="px-4 py-2 text-center text-gray-300 font-mono">{strikeRate}</td>
      </tr>
    );
  };
  
  const extras = 0; // Placeholder for future enhancement
  const totalScore = battingTeam.score;

  return (
    <div className="text-white">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Batsman</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">R</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">B</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">4s</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">6s</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-400 uppercase text-center">S/R</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {battingTeam.players.map(renderBatsmanRow)}
        </tbody>
      </table>
      <div className="border-t border-slate-600 mt-4 pt-4 px-4 space-y-2">
        <div className="flex justify-between items-center text-sm">
            <p className="font-semibold text-gray-400">Extras:</p>
            <p className="font-semibold text-white">{extras}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
            <p className="font-bold text-gray-300">Total:</p>
            <p className="font-bold text-white">{totalScore} / {battingTeam.wickets} ({battingTeam.overs.toFixed(1)} ov)</p>
        </div>
         {fallOfWickets.length > 0 && (
            <div className="pt-2">
                <p className="font-semibold text-gray-400 text-sm mb-1">Fall of Wickets:</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                    {fallOfWickets.map(fow => `${fow.wicket}-${fow.runs} (${fow.player}, ${fow.over.toFixed(1)})`).join(', ')}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BattingCard;
