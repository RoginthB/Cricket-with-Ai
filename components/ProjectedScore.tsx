import React, { useState } from 'react';
import { generateProjectedScore, generateWinPrediction } from '../services/geminiService';
import { MatchState } from '../types';

interface ProjectedScoreProps {
  matchState: MatchState;
}

const ProjectedScore: React.FC<ProjectedScoreProps> = ({ matchState }) => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isFirstInnings = matchState.currentInnings === 1;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = isFirstInnings
        ? await generateProjectedScore(matchState)
        : await generateWinPrediction(matchState);
      setPrediction(result);
    } catch (e: any) {
      setError('Failed to get prediction from AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading || matchState.isMatchOver || !!matchState.nextActionRequired}
                className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-300"
            >
                {isLoading ? (isFirstInnings ? 'Calculating...' : 'Analyzing...') : (isFirstInnings ? 'Calculate Projection' : 'Predict Winner')}
            </button>
            {isLoading && (
                <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            {prediction && !isLoading && (
                <div className={`bg-slate-900 p-3 rounded-lg flex-grow w-full sm:w-auto`}>
                    <p className="text-xs text-gray-400">{isFirstInnings ? 'Projected Score' : 'AI Prediction'}</p>
                    <p className={`font-semibold text-yellow-400 ${isFirstInnings ? 'text-2xl' : 'text-lg'}`}>{prediction}</p>
                </div>
            )}
        </div>
        {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
};

export default ProjectedScore;
