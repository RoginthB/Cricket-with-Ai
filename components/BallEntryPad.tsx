
import React from 'react';

interface BallEntryPadProps {
  onRecordBall: (ballData: any) => void;
  disabled: boolean;
}

const ActionButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, className = '', disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center
      ${className} 
      ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
  >
    {children}
  </button>
);

const BallEntryPad: React.FC<BallEntryPadProps> = ({ onRecordBall, disabled }) => {
  const runs = [0, 1, 2, 3, 4, 6];
  const extras = ['Wd', 'Nb'];
  const wicket = 'OUT';

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-gray-300">Record Ball</h3>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {runs.map((run) => (
          <ActionButton
            key={run}
            onClick={() => onRecordBall({ runs: run, isWicket: false, isExtra: false, boundary: (run === 4 || run === 6) ? run : undefined })}
            className="bg-green-600 text-white focus:ring-green-500"
            disabled={disabled}
          >
            {run}
          </ActionButton>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2 sm:mt-3">
        {extras.map((extra) => (
          <ActionButton
            key={extra}
            onClick={() => onRecordBall({ runs: 1, isWicket: false, isExtra: true, extraType: extra })}
            className="bg-yellow-500 text-slate-900 focus:ring-yellow-400"
            disabled={disabled}
          >
            {extra}
          </ActionButton>
        ))}
         <ActionButton
          onClick={() => onRecordBall({ runs: 0, isWicket: true, isExtra: false })}
          className="bg-red-600 text-white focus:ring-red-500"
          disabled={disabled}
        >
          {wicket}
        </ActionButton>
      </div>
    </div>
  );
};

export default BallEntryPad;