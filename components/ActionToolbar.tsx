import React from 'react';
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


const ActionToolbar: React.FC<ActionToolbarProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-2 gap-3">
            <ActionButton onClick={onUndo} disabled={!canUndo}>
                <UndoIcon className="w-5 h-5"/>
                Undo
            </ActionButton>
            <ActionButton onClick={onRedo} disabled={!canRedo}>
                <RedoIcon className="w-5 h-5"/>
                Redo
            </ActionButton>
        </div>
    </div>
  );
};

export default ActionToolbar;