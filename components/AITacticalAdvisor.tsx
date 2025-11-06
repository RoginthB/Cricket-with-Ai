import React, { useState } from 'react';
import { generateTacticalAdvice } from '../services/geminiService';
import { MatchState } from '../types';

interface AITacticalAdvisorProps {
  matchState: MatchState;
}

const AITacticalAdvisor: React.FC<AITacticalAdvisorProps> = ({ matchState }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setIsLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const result = await generateTacticalAdvice(matchState);
      setAdvice(result);
    } catch (e: any) {
      setError('Failed to get tactical advice.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="space-y-4">
        <button
          onClick={handleGetAdvice}
          disabled={isLoading || matchState.isMatchOver || !!matchState.nextActionRequired}
          className="w-full flex-shrink-0 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold py-3 px-5 rounded-lg transition-colors duration-300"
        >
          {isLoading ? 'Thinking...' : 'Get Tactical Advice'}
        </button>
        
        {isLoading && (
          <div className="flex justify-center p-4">
              <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {error && <p className="text-center text-red-400 bg-red-900/20 p-2 rounded-lg">{error}</p>}

        {advice && !isLoading && (
          <div className="bg-slate-900 p-4 rounded-lg animate-fade-in">
              <p className="text-lg font-semibold text-yellow-400">{advice}</p>
          </div>
        )}
      </div>
  );
};

export default AITacticalAdvisor;
