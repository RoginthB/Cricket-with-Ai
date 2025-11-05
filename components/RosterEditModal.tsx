import React, { useEffect } from 'react';
import { Team } from '../types';
import { UsersIcon, UndoIcon, RedoIcon } from './Icons';
import { useHistoryState } from '../hooks/useHistoryState';

interface RosterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: [Team, Team];
  onSave: (updatedTeams: [Team, Team]) => void;
}

const RosterEditModal: React.FC<RosterEditModalProps> = ({ isOpen, onClose, teams, onSave }) => {
  const { state: localTeams, updateState, undo, redo, canUndo, canRedo, resetState } = useHistoryState<[Team, Team]>(JSON.parse(JSON.stringify(teams)));

  useEffect(() => {
    // Sync with prop changes when modal is opened
    if (isOpen) {
        resetState(JSON.parse(JSON.stringify(teams)));
    }
  }, [teams, isOpen, resetState]);

  const handlePlayerNameChange = (teamIndex: 0 | 1, playerId: number, newName: string) => {
    updateState(prevTeams => {
        const newTeams = JSON.parse(JSON.stringify(prevTeams)) as [Team, Team];
        const playerIndex = newTeams[teamIndex].players.findIndex(p => p.id === playerId);
        if (playerIndex > -1) {
            newTeams[teamIndex].players[playerIndex].name = newName;
        }
        return newTeams;
    });
  };

  const handleSave = () => {
    onSave(localTeams);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-green-400" />
            Edit Team Rosters
          </h2>
          <p className="text-sm text-gray-400 mt-1">Player names can only be edited before the match starts.</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
          {localTeams.map((team, teamIndex) => (
            <div key={team.id}>
              <h3 className="text-lg font-bold text-white mb-3">{team.name}</h3>
              <div className="space-y-2">
                {team.players.map(player => (
                  <input
                    key={player.id}
                    type="text"
                    value={player.name}
                    onChange={(e) => handlePlayerNameChange(teamIndex as 0 | 1, player.id, e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 flex justify-between items-center border-t border-slate-700">
            <div className="flex gap-2">
                <button onClick={undo} disabled={!canUndo} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white">
                    <UndoIcon className="w-5 h-5"/>
                </button>
                <button onClick={redo} disabled={!canRedo} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white">
                    <RedoIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="flex gap-4">
              <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 font-bold py-2 px-6 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg">Save Rosters</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RosterEditModal;
