import React, { useState, useEffect } from 'react';
import { generateTournamentSchedule } from '../services/geminiService';
import { ScheduledMatch, CustomTeam, MatchState } from '../types';
import { CalendarIcon, WandIcon, UsersIcon, PencilIcon, TrashIcon } from './Icons';
import TeamEditorModal from './TeamEditorModal';

interface AISchedulerProps {
    matches: MatchState[];
    onScheduleGenerated: (matches: ScheduledMatch[], maxOvers: number, playersPerTeam: number) => void;
    onEditMatch: (match: MatchState) => void;
    onDeleteMatch: (matchId: string) => void;
}

const AIScheduler: React.FC<AISchedulerProps> = ({ matches, onScheduleGenerated, onEditMatch, onDeleteMatch }) => {
  const [prompt, setPrompt] = useState<string>('Schedule a T20 tournament for 8 teams: India, Australia, England, Pakistan, South Africa, New Zealand, West Indies, and Sri Lanka. It should be a round-robin format. Start it next month.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTeamEditorOpen, setIsTeamEditorOpen] = useState<boolean>(false);
  const [customTeams, setCustomTeams] = useState<CustomTeam[]>([]);
  const [maxOvers, setMaxOvers] = useState(20);
  const [playersPerTeam, setPlayersPerTeam] = useState(11);

  useEffect(() => {
    const savedTeams = localStorage.getItem('customTeams');
    if (savedTeams) {
      setCustomTeams(JSON.parse(savedTeams));
    }
  }, []);
  
  const scheduledMatches = matches.filter(m => m.status === 'scheduled');

  const handleUseTeamsInPrompt = () => {
    const teamList = customTeams.map(t => t.name).join(', ');
    setPrompt(`Schedule a tournament for the following teams: ${teamList}.`);
  };

  const handleGenerate = async () => {
    if (!prompt || maxOvers < 1 || playersPerTeam < 2) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTournamentSchedule(prompt);
      onScheduleGenerated(result, maxOvers, playersPerTeam);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTeamsUpdated = (updatedTeams: CustomTeam[]) => {
      setCustomTeams(updatedTeams);
  };

  return (
    <>
      <TeamEditorModal 
        isOpen={isTeamEditorOpen}
        onClose={() => setIsTeamEditorOpen(false)}
        onTeamsUpdated={handleTeamsUpdated}
      />
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center mb-6">
            <WandIcon className="w-8 h-8 text-purple-400 mr-4"/>
            <h2 className="text-3xl font-bold text-white">AI Tournament Scheduler</h2>
          </div>
          
          <p className="text-gray-400 mb-6">
            Describe your tournament, set the match format, and the AI will generate a complete fixture list.
          </p>

          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a weekend league for 4 local teams..."
              className="w-full h-32 p-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Max Overs</label>
                    <input type="number" value={maxOvers} onChange={e => setMaxOvers(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" min="1"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Players per Team</label>
                    <input type="number" value={playersPerTeam} onChange={e => setPlayersPerTeam(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" min="2"/>
                 </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setIsTeamEditorOpen(true)}
                className="md:col-span-1 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
              >
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Manage Teams
              </button>
              <button
                  onClick={handleUseTeamsInPrompt}
                  disabled={customTeams.length === 0}
                  className="md:col-span-2 w-full bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700/50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                  Use Saved Teams in Prompt
              </button>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating & Saving Schedule...
                </>
              ) : (
                  'Generate & Save Schedule'
              )}
            </button>
          </div>
          
          {error && <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}

          {scheduledMatches.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4 text-white">Current Scheduled Matches</h3>
              <div className="space-y-3">
                 {scheduledMatches.map(match => (
                    <div key={match.id} className="bg-slate-900 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <p className="font-semibold text-white">{match.description}</p>
                            <p className="text-sm text-gray-400">{match.date} @ {match.venue}</p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <button onClick={() => onEditMatch(match)} className="p-2 text-blue-400 hover:text-blue-300"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDeleteMatch(match.id)} className="p-2 text-red-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AIScheduler;