import React, { useState, useEffect } from 'react';
import { CustomTeam, PlayerRosterItem } from '../types';
import { UsersIcon, PlusIcon, TrashIcon, PencilIcon, SaveIcon, UndoIcon, RedoIcon } from './Icons';
import { useHistoryState } from '../hooks/useHistoryState';

interface TeamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamsUpdated: (teams: CustomTeam[]) => void;
}

const TeamEditor: React.FC<{
    team: CustomTeam;
    onSave: (team: CustomTeam) => void;
    onCancel: () => void;
}> = ({ team, onSave, onCancel }) => {
    const { state: editableTeam, updateState: setEditableTeam, undo, redo, canUndo, canRedo, resetState } = useHistoryState<CustomTeam>(team);

    useEffect(() => {
        resetState(team);
    }, [team, resetState]);

    const handlePlayerChange = (index: number, name: string) => {
        setEditableTeam(prev => {
            const newPlayers = [...prev.players];
            newPlayers[index] = { ...newPlayers[index], name };
            return { ...prev, players: newPlayers };
        });
    };

    const handleAddPlayer = () => {
        const newPlayer: PlayerRosterItem = { id: Date.now(), name: '' };
        setEditableTeam(prev => ({ ...prev, players: [...prev.players, newPlayer] }));
    };

    const handleRemovePlayer = (id: number) => {
        setEditableTeam(prev => ({ ...prev, players: prev.players.filter(p => p.id !== id) }));
    };

    return (
         <div className="p-6 bg-slate-800 rounded-b-lg">
            <h3 className="text-xl font-bold text-white mb-4">{team.id ? 'Edit Team' : 'Create New Team'}</h3>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Team Name"
                    value={editableTeam.name}
                    onChange={e => setEditableTeam(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white"
                />
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {editableTeam.players.map((player, index) => (
                        <div key={player.id} className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={`Player ${index + 1} Name`}
                                value={player.name}
                                onChange={e => handlePlayerChange(index, e.target.value)}
                                className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            />
                            <button onClick={() => handleRemovePlayer(player.id)} className="p-2 text-red-400 hover:text-red-600">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddPlayer} className="w-full flex justify-center items-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                    <PlusIcon className="w-5 h-5" /> Add Player
                </button>
            </div>
            <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                    <button onClick={undo} disabled={!canUndo} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white">
                        <UndoIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={redo} disabled={!canRedo} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white">
                        <RedoIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="bg-slate-600 hover:bg-slate-700 font-bold py-2 px-6 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(editableTeam)} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg">Save Team</button>
                </div>
            </div>
        </div>
    );
};

const TeamEditorModal: React.FC<TeamEditorModalProps> = ({ isOpen, onClose, onTeamsUpdated }) => {
  const [teams, setTeams] = useState<CustomTeam[]>([]);
  const [editingTeam, setEditingTeam] = useState<CustomTeam | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedTeams = localStorage.getItem('customTeams');
      const parsedTeams = savedTeams ? JSON.parse(savedTeams) : [];
      setTeams(parsedTeams);
      onTeamsUpdated(parsedTeams);
    }
  }, [isOpen]);

  const saveTeamsToStorage = (updatedTeams: CustomTeam[]) => {
    localStorage.setItem('customTeams', JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
    onTeamsUpdated(updatedTeams);
  };

  const handleCreateNew = () => {
    setEditingTeam({ id: '', name: '', players: Array.from({length: 11}, (_, i) => ({id: i, name: ''})) });
  };
  
  const handleSaveTeam = (teamToSave: CustomTeam) => {
    let updatedTeams;
    if (teamToSave.id) { // Existing team
        updatedTeams = teams.map(t => t.id === teamToSave.id ? teamToSave : t);
    } else { // New team
        updatedTeams = [...teams, { ...teamToSave, id: `team_${Date.now()}` }];
    }
    saveTeamsToStorage(updatedTeams);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (id: string) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
        const updatedTeams = teams.filter(t => t.id !== id);
        saveTeamsToStorage(updatedTeams);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-blue-400" />
                Team Manager
            </h2>
        </div>
        
        {editingTeam ? (
            <TeamEditor team={editingTeam} onSave={handleSaveTeam} onCancel={() => setEditingTeam(null)} />
        ) : (
            <>
                <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                    {teams.length > 0 ? (
                        teams.map(team => (
                            <div key={team.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white">{team.name}</p>
                                    <p className="text-xs text-gray-400">{team.players.length} Players</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingTeam(team)} className="p-2 text-blue-400 hover:text-blue-300">
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => handleDeleteTeam(team.id)} className="p-2 text-red-400 hover:text-red-600">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No custom teams saved. Create one to get started!</p>
                    )}
                </div>
                <div className="p-6 border-t border-slate-700">
                    <button onClick={handleCreateNew} className="w-full flex justify-center items-center gap-2 p-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
                        <PlusIcon className="w-6 h-6" /> Create New Team
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default TeamEditorModal;
