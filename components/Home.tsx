import React, { useState, useEffect } from 'react';
import { MatchState, CustomTeam } from '../types';
import { PlusIcon, CricketBallIcon, PencilIcon, TrashIcon, UsersIcon } from './Icons';
import TeamEditorModal from './TeamEditorModal';

interface HomeProps {
  matches: MatchState[];
  onCreateMatch: (team1Info: CustomTeam | string, team2Info: CustomTeam | string, description: string, maxOvers: number, playersPerTeam: number) => void;
  onStartScoring: (matchId: string) => void;
  onEditMatch: (match: MatchState) => void;
  onDeleteMatch: (matchId: string) => void;
}

const MatchCard: React.FC<{ 
    match: MatchState, 
    onStart: () => void,
    onEdit: () => void,
    onDelete: () => void,
}> = ({ match, onStart, onEdit, onDelete }) => (
    <div className="bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-shadow hover:shadow-lg">
        <div>
            <p className="font-bold text-white">{match.description}</p>
            <p className="text-sm text-gray-400">{match.teams[0].name} vs {match.teams[1].name}</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
            {match.status === 'scheduled' && (
                <>
                    <button onClick={onEdit} className="p-2 text-blue-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={onDelete} className="p-2 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                </>
            )}
            <button onClick={onStart} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                {match.status === 'live' ? 'Resume' : 'Start'}
            </button>
        </div>
    </div>
);

const CreateMatchModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (team1Info: CustomTeam | string, team2Info: CustomTeam | string, description: string, maxOvers: number, playersPerTeam: number) => void;
}> = ({ isOpen, onClose, onCreate }) => {
    const [team1Selection, setTeam1Selection] = useState('custom');
    const [team2Selection, setTeam2Selection] = useState('custom');
    const [team1Name, setTeam1Name] = useState('Team A');
    const [team2Name, setTeam2Name] = useState('Team B');
    const [description, setDescription] = useState('Friendly Match');
    const [maxOvers, setMaxOvers] = useState(20);
    const [playersPerTeam, setPlayersPerTeam] = useState(11);
    const [customTeams, setCustomTeams] = useState<CustomTeam[]>([]);

    useEffect(() => {
        if (isOpen) {
            const savedTeams = localStorage.getItem('customTeams');
            if (savedTeams) {
                setCustomTeams(JSON.parse(savedTeams));
            } else {
                setCustomTeams([]);
            }
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const team1Info = team1Selection === 'custom' ? team1Name : customTeams.find(t => t.id === team1Selection)!;
        const team2Info = team2Selection === 'custom' ? team2Name : customTeams.find(t => t.id === team2Selection)!;
        if (team1Info && team2Info && description && maxOvers > 0 && playersPerTeam > 1) {
            onCreate(team1Info, team2Info, description, maxOvers, playersPerTeam);
            onClose();
        }
    };

    if (!isOpen) return null;

    const renderTeamInput = (
        selection: string, 
        onSelectionChange: (val: string) => void,
        name: string,
        onNameChange: (val: string)
    ) => (
        <div className="flex flex-col sm:flex-row gap-2">
            <select
                value={selection}
                onChange={e => onSelectionChange(e.target.value)}
                className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
                <option value="custom">Custom Name</option>
                {customTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                ))}
            </select>
            {selection === 'custom' && (
                <input 
                    type="text" 
                    placeholder="Team Name" 
                    value={name} 
                    onChange={e => onNameChange(e.target.value)} 
                    className="flex-grow p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" 
                />
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-lg p-8 space-y-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white">Create New Match</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Description (e.g., League Final)" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                    {renderTeamInput(team1Selection, setTeam1Selection, team1Name, setTeam1Name)}
                    {renderTeamInput(team2Selection, setTeam2Selection, team2Name, setTeam2Name)}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label htmlFor="maxOvers" className="absolute left-3 top-1 text-xs text-gray-400">over</label>
                            <input id="maxOvers" type="number" value={maxOvers} onChange={e => setMaxOvers(Number(e.target.value))} className="w-full p-3 pt-5 bg-slate-900 border border-slate-700 rounded-lg text-white text-center" min="1" />
                        </div>
                        <div className="relative">
                            <label htmlFor="playersPerTeam" className="absolute left-3 top-1 text-xs text-gray-400">wickets</label>
                            <input id="playersPerTeam" type="number" value={playersPerTeam} onChange={e => setPlayersPerTeam(Number(e.target.value))} className="w-full p-3 pt-5 bg-slate-900 border border-slate-700 rounded-lg text-white text-center" min="2" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Create & Start</button>
                </div>
            </div>
        </div>
    );
};

const Home: React.FC<HomeProps> = ({ matches, onCreateMatch, onStartScoring, onEditMatch, onDeleteMatch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamEditorOpen, setIsTeamEditorOpen] = useState(false);
  const [teamUpdateTimestamp, setTeamUpdateTimestamp] = useState(Date.now());

  const scheduledMatches = matches.filter(m => m.status === 'scheduled');
  const liveMatches = matches.filter(m => m.status === 'live');

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
        <CreateMatchModal 
            key={teamUpdateTimestamp}
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onCreate={onCreateMatch} 
        />
        <TeamEditorModal 
            isOpen={isTeamEditorOpen}
            onClose={() => setIsTeamEditorOpen(false)}
            onTeamsUpdated={() => setTeamUpdateTimestamp(Date.now())}
        />
      
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center gap-3">
                 <button onClick={() => setIsTeamEditorOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg flex items-center gap-2 transition-colors">
                    <UsersIcon className="w-6 h-6" />
                    Manage Teams
                </button>
                <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg flex items-center gap-2 transition-colors">
                    <PlusIcon className="w-6 h-6" />
                    Create Match
                </button>
            </div>
        </div>

        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold text-gray-300 border-b-2 border-slate-700 pb-2 mb-4 flex items-center gap-3">
                    <CricketBallIcon className="w-6 h-6 text-red-500 animate-pulse" /> Live Matches
                </h2>
                <div className="space-y-3">
                    {liveMatches.length > 0 ? (
                        liveMatches.map(match => <MatchCard key={match.id} match={match} onStart={() => onStartScoring(match.id)} onEdit={() => onEditMatch(match)} onDelete={() => onDeleteMatch(match.id)} />)
                    ) : <p className="text-gray-500">No live matches currently in progress.</p>}
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold text-gray-300 border-b-2 border-slate-700 pb-2 mb-4">Scheduled Matches</h2>
                <div className="space-y-3">
                     {scheduledMatches.length > 0 ? (
                        scheduledMatches.map(match => <MatchCard key={match.id} match={match} onStart={() => onStartScoring(match.id)} onEdit={() => onEditMatch(match)} onDelete={() => onDeleteMatch(match.id)}/>)
                    ) : <p className="text-gray-500">No matches scheduled. Use the AI Scheduler to create a tournament.</p>}
                </div>
            </section>
        </div>
    </div>
  );
};

export default Home;