import React, { useState, useEffect } from 'react';
import { MatchState } from '../types';
import { PencilIcon } from './Icons';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchState;
  onSave: (updatedMatch: MatchState) => void;
}

const EditMatchModal: React.FC<EditMatchModalProps> = ({ isOpen, onClose, match, onSave }) => {
  const [editableMatch, setEditableMatch] = useState<MatchState>(match);

  useEffect(() => {
    setEditableMatch(match);
  }, [match]);

  const handleSave = () => {
    onSave(editableMatch);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditableMatch(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleTeamNameChange = (teamIndex: 0 | 1, newName: string) => {
      const newTeams = [...editableMatch.teams] as [any, any];
      newTeams[teamIndex].name = newName;
      setEditableMatch(prev => ({ ...prev, teams: newTeams }));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <PencilIcon className="w-6 h-6 text-blue-400" />
                Edit Scheduled Match
            </h2>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <input type="text" name="description" value={editableMatch.description} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Team 1 Name</label>
            <input type="text" value={editableMatch.teams[0].name} onChange={e => handleTeamNameChange(0, e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Team 2 Name</label>
            <input type="text" value={editableMatch.teams[1].name} onChange={e => handleTeamNameChange(1, e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                <input type="date" name="date" value={editableMatch.date || ''} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Venue</label>
                <input type="text" name="venue" value={editableMatch.venue || ''} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Max Overs</label>
                <input type="number" name="maxOvers" value={editableMatch.maxOvers} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" min="1"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Players per Team</label>
                <input type="number" name="playersPerTeam" value={editableMatch.playersPerTeam} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" min="2"/>
            </div>
          </div>
        </div>
        <div className="p-6 flex justify-end gap-4 border-t border-slate-700">
            <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 font-bold py-2 px-6 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-6 rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditMatchModal;