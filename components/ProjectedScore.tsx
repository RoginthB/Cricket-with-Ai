import React, { useState } from 'react';
import { generateProjectedScore, generateWinPrediction } from '../services/geminiService';
import { MatchState } from '../types';
import { WandIcon } from './Icons';

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
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <WandIcon className="w-6 h-6 text-purple-400 mr-3" />
        <h3 className="text-xl font-bold text-white">AI {isFirstInnings ? 'Score Predictor' : 'Win Predictor'}</h3>
      </div>
      
      {isFirstInnings ? (
        <>
            <p className="text-gray-400 mb-4 text-sm">
                Based on the current run rate, wickets in hand, and player stats, the AI can project the final score for the first innings.
            </p>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || matchState.isMatchOver}
                    className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-300"
                >
                    {isLoading ? 'Calculating...' : 'Calculate Projection'}
                </button>
                {isLoading && (
                    <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                {prediction && !isLoading && (
                    <div className="text-center bg-slate-900 p-3 rounded-lg">
                        <p className="text-xs text-gray-400">Projected Score</p>
                        <p className="text-2xl font-bold text-yellow-400">{prediction}</p>
                    </div>
                )}
                {error && <p className="text-red-400">{error}</p>}
            </div>
        </>
      ) : (
        <>
            <p className="text-gray-400 mb-4 text-sm">
                The chase is on! The AI can analyze the current situation to predict which team has the upper hand.
            </p>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || matchState.isMatchOver}
                    className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-300"
                >
                    {isLoading ? 'Analyzing...' : 'Predict Winner'}
                </button>
                 {isLoading && (
                    <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                {prediction && !isLoading && (
                    <div className="bg-slate-900 p-3 rounded-lg flex-grow">
                        <p className="text-xs text-gray-400">AI Prediction</p>
                        <p className="text-lg font-semibold text-yellow-400">{prediction}</p>
                    </div>
                )}
                {error && <p className="text-red-400">{error}</p>}
            </div>
        </>
      )}
    </div>
  );
};

export default ProjectedScore;