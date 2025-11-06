import React, { useState } from 'react';
import { UndoIcon, RedoIcon } from './Icons';

interface ActionToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ActionButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold transition-colors
        ${disabled ? 'bg-slate-700 text-gray-500 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-500'}`}
    >
        {children}
    </button>
);

const UndoConfirmationModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white">Confirm Undo</h2>
        <p className="text-gray-300">
          Are you sure you want to undo the last ball entry? This will revert the score and player stats.
        </p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Confirm Undo
          </button>
        </div>
      </div>
    </div>
  );
};


const ActionToolbar: React.FC<ActionToolbarProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);

  const handleUndoClick = () => {
    if (canUndo) {
      setIsUndoModalOpen(true);
    }
  };

  const handleConfirmUndo = () => {
    onUndo();
    setIsUndoModalOpen(false);
  };

  const handleCancelUndo = () => {
    setIsUndoModalOpen(false);
  };

  return (
    <>
      <UndoConfirmationModal
        isOpen={isUndoModalOpen}
        onConfirm={handleConfirmUndo}
        onCancel={handleCancelUndo}
      />
      <div className="bg-slate-800 rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-2 gap-3">
              <ActionButton onClick={handleUndoClick} disabled={!canUndo}>
                  <UndoIcon className="w-5 h-5"/>
                  Undo
              </ActionButton>
              <ActionButton onClick={onRedo} disabled={!canRedo}>
                  <RedoIcon className="w-5 h-5"/>
                  Redo
              </ActionButton>
          </div>
      </div>
    </>
  );
};

export default ActionToolbar;
