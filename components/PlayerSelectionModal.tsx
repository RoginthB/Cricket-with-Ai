import React, { useState, useMemo } from 'react';
import { Team, Player } from '../types';
import { UsersIcon } from './Icons';

interface PlayerSelectionModalProps {
  isOpen: boolean;
  mode: 'SELECT_OPENERS' | 'SELECT_NEXT_BATSMAN' | 'SELECT_BOWLER';
  team: Team;
  onSelectOpeners?: (strikerId: number, nonStrikerId: number) => void;
  onSelectPlayer?: (playerId: number) => void;
  disabledPlayerIds?: number[];
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  mode,
  team,
  onSelectOpeners,
  onSelectPlayer,
  disabledPlayerIds = [],
}) => {
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const title = useMemo(() => {
    switch (mode) {
      case 'SELECT_OPENERS': return 'Select Opening Batsmen';
      case 'SELECT_NEXT_BATSMAN': return 'Select Next Batsman';
      case 'SELECT_BOWLER': return 'Select Bowler';
      default: return 'Select Player';
    }
  }, [mode]);

  const handleConfirm = () => {
    if (mode === 'SELECT_OPENERS' && onSelectOpeners && strikerId && nonStrikerId) {
      onSelectOpeners(Number(strikerId), Number(nonStrikerId));
    } else if (onSelectPlayer && selectedPlayerId) {
      onSelectPlayer(Number(selectedPlayerId));
    }
  };

  const isConfirmDisabled = useMemo(() => {
    if (mode === 'SELECT_OPENERS') {
      return !strikerId || !nonStrikerId || strikerId === nonStrikerId;
    }
    return !selectedPlayerId;
  }, [mode, strikerId, nonStrikerId, selectedPlayerId]);

  if (!isOpen) return null;
  
  const renderOpenersSelection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Striker</label>
        <select
          value={strikerId}
          onChange={(e) => setStrikerId(e.target.value)}
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
        >
          <option value="">-- Select Striker --</option>
          {team.players.map(p => (
            <option key={p.id} value={p.id} disabled={p.id === Number(nonStrikerId)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Non-Striker</label>
        <select
          value={nonStrikerId}
          onChange={(e) => setNonStrikerId(e.target.value)}
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
        >
          <option value="">-- Select Non-Striker --</option>
          {team.players.map(p => (
            <option key={p.id} value={p.id} disabled={p.id === Number(strikerId)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
  
  const renderSinglePlayerSelection = () => (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {team.players.map(player => {
        const isDisabled = disabledPlayerIds.includes(player.id);
        return (
          <button
            key={player.id}
            onClick={() => !isDisabled && setSelectedPlayerId(String(player.id))}
            disabled={isDisabled}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              selectedPlayerId === String(player.id)
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {player.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-lg w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="selection-modal-title">
        <div className="p-6 border-b border-slate-700">
          <h2 id="selection-modal-title" className="text-2xl font-bold text-white flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-green-400" />
            {title}
          </h2>
        </div>
        <div className="p-6">
          {mode === 'SELECT_OPENERS' ? renderOpenersSelection() : renderSinglePlayerSelection()}
        </div>
        <div className="p-6 flex justify-end gap-4 border-t border-slate-700">
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-8 rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionModal;
