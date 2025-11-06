import React, { useMemo } from 'react';
import { MatchState, Player } from '../types';
import { CricketBallIcon } from './Icons';

interface ScoreboardProps {
  matchState: MatchState;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ matchState }) => {
  const { innings, currentInnings, striker, nonStriker, currentBowler, target, maxOvers, description, playersPerTeam } = matchState;
  const currentInningsData = innings[currentInnings - 1];
  const firstInnings = innings[0];

  if (!currentInningsData) {
    return <div>Loading match...</div>;
  }

  const { battingTeam, overs, fallOfWickets } = currentInningsData;
  const lastOver = overs[overs.length - 1];

  const convertOversToDecimal = (overs: number): number => {
    const ov = Math.floor(overs);
    const balls = Math.round((overs - ov) * 10);
    return ov + balls / 6;
  };
  
  const { crr, rrr, ballsRemaining } = useMemo(() => {
    const totalOversDecimal = convertOversToDecimal(battingTeam.overs);
    const crr = totalOversDecimal > 0 ? (battingTeam.score / totalOversDecimal).toFixed(2) : '0.00';

    let rrr = null;
    let ballsRemaining = null;
    if (target) {
      const remainingOvers = maxOvers - totalOversDecimal;
      rrr = remainingOvers > 0 ? ((target - battingTeam.score) / remainingOvers).toFixed(2) : 'N/A';
      ballsRemaining = (maxOvers * 6) - (Math.floor(battingTeam.overs) * 6 + (battingTeam.overs * 10 % 10));
    }
    return { crr, rrr, ballsRemaining };
  }, [battingTeam.overs, battingTeam.score, target, maxOvers]);


  const renderBall = (ball: any, index: number) => {
    // Defensive check to prevent rendering invalid data that might be causing artifacts.
    if (typeof ball !== 'object' || ball === null || typeof ball.runs !== 'number') {
      return null;
    }
    let content: string | number = ball.runs;
    if (ball.isWicket) content = 'W';
    else if (ball.extraType) content = ball.extraType;

    let bgColor = 'bg-gray-600';
    if (ball.isWicket) bgColor = 'bg-red-500';
    else if (ball.boundary === 4) bgColor = 'bg-blue-500';
    else if (ball.boundary === 6) bgColor = 'bg-purple-500';

    return (
        <div key={index} className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${bgColor}`}>
            {content}
        </div>
    );
  };
  
  const renderBatsmanRow = (player: Player | undefined, isStriker: boolean) => {
    if (!player) return null;
    const displayName = `${player.name}${isStriker ? '*' : ''}`;
    const strikeRate = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(2) : '0.00';

    return (
      <tr key={player.id} className='bg-slate-700/50'>
        <td className="px-2 py-2 sm:px-4">
            <p className="font-semibold text-white">{displayName}</p>
        </td>
        <td className="px-2 py-2 text-center font-bold text-lg sm:text-xl text-white">{player.runs}</td>
        <td className="px-2 py-2 text-center text-gray-300">{player.balls}</td>
        <td className="px-2 py-2 text-center text-gray-300">{player.fours}</td>
        <td className="px-2 py-2 text-center text-gray-300">{player.sixes}</td>
        <td className="px-2 py-2 text-center text-gray-300 font-mono">{strikeRate}</td>
      </tr>
    );
  };

  return (
    
    <div className="bg-slate-800 rounded-xl shadow-lg">
      {/* Match Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-base sm:text-lg font-bold text-white truncate" title={description}>{description}</h2>
        <p className="text-xs sm:text-sm text-gray-400">{maxOvers} Overs & {playersPerTeam - 1} Wickets Match</p>
      </div>

      <div className="p-4 sm:p-6">
        {/* Batting Team Score */}
        <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{battingTeam.name}</h2>
                <div className="text-right">
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tighter">
                        {battingTeam.score}
                        <span className="text-2xl sm:text-3xl text-gray-400 font-medium">/{battingTeam.wickets}</span>
                    </p>
                    <p className="text-sm sm:text-base text-gray-300">({battingTeam.overs.toFixed(1)} Overs)</p>
                </div>
            </div>
        </div>
        
        {/* Chase Information */}
        {currentInnings === 2 && firstInnings && (
            <div className="text-center text-sm text-gray-300 mb-4 -mt-2">
                <p>
                    <span className="font-semibold text-gray-200">{firstInnings.battingTeam.name}</span>: <span className="font-bold">{firstInnings.battingTeam.score}/{firstInnings.battingTeam.wickets}</span>
                </p>
            </div>
        )}

       {/* Rates Display */}
       <div className="border-t border-b border-slate-700 py-3 my-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
        <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">CRR</p>
            <p className="text-base sm:text-lg font-bold text-white">{crr}</p>
        </div>
        {target && (
            <>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Target</p>
                    <p className="text-base sm:text-lg font-bold text-yellow-400">{target}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">RRR</p>
                    <p className="text-base sm:text-lg font-bold text-white">{rrr}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Balls Left</p>
                    <p className="text-base sm:text-lg font-bold text-white">{ballsRemaining}</p>
                </div>
            </>
        )}
      </div>

      {/* Batting Scorecard */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-left min-w-[500px]">
            <thead>
                <tr className="border-b border-slate-600">
                    <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-400 uppercase">Batsman</th>
                    <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-400 uppercase text-center">R</th>
                    <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-400 uppercase text-center">B</th>
                    <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-400 uppercase text-center">4s</th>
                    <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-400 uppercase text-center">6s</th>
                    <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-400 uppercase text-center">S/R</th>
                </tr>
            </thead>
            <tbody>
                {renderBatsmanRow(striker, true)}
                {renderBatsmanRow(nonStriker, false)}
            </tbody>
        </table>
      </div>


      {/* Bowler & Last Over */}
      <div className="border-t border-slate-700 pt-4">
         <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
             <CricketBallIcon className="w-5 h-5 mr-2 text-red-500"/>
             <p className="font-semibold">{currentBowler?.name || 'N/A'}</p>
          </div>
          <p className="font-mono">
            {currentBowler ? `${currentBowler.wickets}/${currentBowler.runsConceded} (${currentBowler.overs.toFixed(1)})` : '-/- (-.-)'}
          </p>
        </div>
        <div className="flex justify-start items-center flex-wrap gap-2">
            <p className="text-sm font-medium text-gray-400">This Over:</p>
            {lastOver && lastOver.balls.map(renderBall)}
        </div>
      </div>
      
      {/* Fall of Wickets Section */}
      {fallOfWickets && fallOfWickets.length > 0 && (
        <div className="border-t border-slate-700 mt-4 pt-4">
            <p className="font-semibold text-gray-400 text-sm mb-2">Fall of Wickets:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
                {fallOfWickets.map(fow => {
                    // Defensive check to prevent rendering invalid data from fall of wickets array.
                    if (typeof fow !== 'object' || fow === null || typeof fow.wicket !== 'number') {
                        return null;
                    }
                    return (
                        <span key={fow.wicket}>
                            <span className="font-semibold text-white">{fow.wicket}-{fow.runs}</span>
                            <span className="text-gray-400"> ({fow.player}, {fow.over.toFixed(1)})</span>
                        </span>
                    );
                })}
            </div>
        </div>
      )}
    </div>
    </div>
  );
};

