import React, { useCallback, useState, useMemo } from 'react';
import { Scoreboard } from './Scoreboard';
import BallEntryPad from './BallEntryPad';
import Toss from './Toss';
import ProjectedScore from './ProjectedScore';
import MatchSummary from './MatchSummary';
import ScorecardTabs from './ScorecardTabs';
import { useMatchState } from '../hooks/useMatchState';
import { MatchState, Team, Player, DismissalMethod } from '../types';
import ActionToolbar from './ActionToolbar';
import InningsBreak from './InningsBreak';
import PlayerSelectionModal from './PlayerSelectionModal';
import AITacticalAdvisor from './AITacticalAdvisor';
import { WandIcon } from './Icons';

interface ScoringViewProps {
  match: MatchState;
  onUpdate: (newState: MatchState) => void;
  onMatchFinished: () => void;
}

type AdvancedModalType = 'wicket' | 'wide' | 'noball' | 'byes';

const AdvancedEntryModal: React.FC<{
    isOpen: boolean;
    type: AdvancedModalType;
    onClose: () => void;
    onConfirm: (data: any) => void;
    bowlingTeam: Team;
    striker: Player;
    nonStriker: Player;
}> = ({ isOpen, type, onClose, onConfirm, bowlingTeam, striker, nonStriker }) => {
    
    // Wicket State
    const [dismissal, setDismissal] = useState<DismissalMethod | null>(null);
    const [fielderId, setFielderId] = useState<string>('');
    const [batsmanOutId, setBatsmanOutId] = useState<string>(striker?.id.toString() || '');

    // Extras State
    const [runs, setRuns] = useState(0);
    const [extraRuns, setExtraRuns] = useState(0);
    const [byeType, setByeType] = useState<'B' | 'Lb'>('B');
    
    React.useEffect(() => {
        if(isOpen) {
            // Reset state on open
            setDismissal(null);
            setFielderId('');
            setBatsmanOutId(striker?.id.toString() || '');
            setRuns(0);
            setExtraRuns(0);
            setByeType('B');
        }
    }, [isOpen, striker]);

    if (!isOpen) return null;

    const dismissalTypes: DismissalMethod[] = ['Bowled', 'Caught', 'Caught & Bowled', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'];
    const requiresFielder = dismissal === 'Caught' || dismissal === 'Stumped' || dismissal === 'Run Out';

    const handleConfirmClick = () => {
        let ballData: any = { runs: 0, isExtra: true };

        switch (type) {
            case 'wicket':
                ballData = {
                    runs: runs,
                    isWicket: true,
                    isExtra: false, // Wicket is not an extra itself, though can happen on one
                    wicketDetails: {
                        method: dismissal,
                        fielderId: fielderId ? Number(fielderId) : undefined,
                        batsmanOutId: Number(batsmanOutId),
                    }
                };
                break;
            case 'wide':
                ballData = { runs: 0, extraRuns: extraRuns, extraType: 'Wd' };
                break;
            case 'noball':
                ballData = { runs: runs, extraType: 'Nb' };
                break;
            case 'byes':
                ballData = { runs: runs, extraType: byeType };
                break;
        }
        onConfirm(ballData);
    };
    
    const renderWicketContent = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Dismissal Type</label>
                <select value={dismissal || ''} onChange={e => setDismissal(e.target.value as DismissalMethod)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                    <option value="">-- Select Method --</option>
                    {dismissalTypes.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            {dismissal === 'Run Out' && (
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Who was out?</label>
                    <select value={batsmanOutId} onChange={e => setBatsmanOutId(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                        <option value={striker.id}>{striker.name} (Striker)</option>
                        <option value={nonStriker.id}>{nonStriker.name} (Non-Striker)</option>
                    </select>
                </div>
            )}
            {requiresFielder && (
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        {dismissal === 'Stumped' ? 'Wicket Keeper' : 'Fielder'}
                    </label>
                    <select value={fielderId} onChange={e => setFielderId(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                        <option value="">-- Select Fielder --</option>
                        {bowlingTeam.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
    
    const renderExtrasContent = () => {
         const title = type === 'wide' ? 'Wide' : type === 'noball' ? 'No Ball' : 'Byes / Leg Byes';
         const runsLabel = type === 'noball' ? 'Runs off Bat' : 'Additional Runs';
         const runsOptions = type === 'noball' ? [0,1,2,3,4,6] : [0,1,2,3,4];

         return (
             <div className="space-y-4">
                <h3 className="text-xl font-bold">{title}</h3>
                {type === 'byes' && (
                    <div className="flex gap-2">
                        <button onClick={() => setByeType('B')} className={`w-full p-2 rounded ${byeType === 'B' ? 'bg-blue-600' : 'bg-slate-700'}`}>Byes</button>
                        <button onClick={() => setByeType('Lb')} className={`w-full p-2 rounded ${byeType === 'Lb' ? 'bg-blue-600' : 'bg-slate-700'}`}>Leg Byes</button>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{runsLabel}</label>
                    <div className="flex flex-wrap gap-2">
                        {runsOptions.map(r => (
                             <button key={r} onClick={() => type === 'wide' ? setExtraRuns(r) : setRuns(r)} className={`p-3 w-12 h-12 rounded-lg font-bold transition ${ (type === 'wide' ? extraRuns : runs) === r ? 'bg-green-600' : 'bg-slate-700'}`}>{r}</button>
                        ))}
                    </div>
                </div>
             </div>
         );
    }
    
    const isConfirmDisabled = useMemo(() => {
        if (type === 'wicket') {
            if (!dismissal) return true;
            if (requiresFielder && !fielderId) return true;
        }
        return false;
    }, [type, dismissal, requiresFielder, fielderId]);

    const modalTitle = {
        wicket: 'Record Wicket',
        wide: 'Record Wide',
        noball: 'Record No Ball',
        byes: 'Record Byes/Leg Byes'
    }[type];

    return (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">{modalTitle}</h2>
                </div>
                <div className="p-6">
                    {type === 'wicket' ? renderWicketContent() : renderExtrasContent()}
                </div>
                <div className="p-6 flex justify-end gap-4 border-t border-slate-700">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 font-bold py-2 px-6 rounded-lg">Cancel</button>
                    <button onClick={handleConfirmClick} disabled={isConfirmDisabled} className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed font-bold py-2 px-6 rounded-lg">Confirm</button>
                </div>
            </div>
        </div>
    );
};


const ScoringView: React.FC<ScoringViewProps> = ({ match, onUpdate, onMatchFinished }) => {
  const { matchState, recordBall, completeToss, updateRosters, startSecondInnings, undo, redo, canUndo, canRedo, setOpeningBatsmen, setNextBatsman, setBowler } = useMatchState(match, onUpdate);

  const [advancedModal, setAdvancedModal] = useState<{ isOpen: boolean; type: AdvancedModalType | null }>({ isOpen: false, type: null });

  const handleAdvancedEntry = (type: AdvancedModalType) => {
    setAdvancedModal({ isOpen: true, type: type });
  };
  
  const handleCloseAdvancedModal = () => {
     setAdvancedModal({ isOpen: false, type: null });
  }

  const handleConfirmAdvancedEntry = (ballData: any) => {
    recordBall(ballData);
    handleCloseAdvancedModal();
  };


  const handleRecordBall = useCallback((ballData: any) => {
    recordBall(ballData);
  }, [recordBall]);
  
  const handleTossComplete = (winnerId: number, decision: 'bat' | 'bowl') => {
    completeToss(winnerId, decision);
  };

  const handleUpdateRosters = (updatedTeams: [Team, Team]) => {
    updateRosters(updatedTeams);
  };

  const renderPlayerSelectionModal = () => {
    if (!matchState.nextActionRequired) return null;

    const currentInningsData = matchState.innings[matchState.currentInnings - 1]!;
    
    switch(matchState.nextActionRequired) {
      case 'SELECT_OPENERS':
        return <PlayerSelectionModal
          isOpen={true}
          mode="SELECT_OPENERS"
          team={currentInningsData.battingTeam}
          onSelectOpeners={setOpeningBatsmen}
        />;
      case 'SELECT_NEXT_BATSMAN':
        const availableBatsmen = currentInningsData.battingTeam.players.filter(p => !p.isOut && p.id !== matchState.nonStriker?.id);
        return <PlayerSelectionModal
          isOpen={true}
          mode="SELECT_NEXT_BATSMAN"
          team={{...currentInningsData.battingTeam, players: availableBatsmen}}
          onSelectPlayer={setNextBatsman}
        />;
      case 'SELECT_BOWLER':
        return <PlayerSelectionModal
          isOpen={true}
          mode="SELECT_BOWLER"
          team={currentInningsData.bowlingTeam}
          onSelectPlayer={setBowler}
          disabledPlayerIds={matchState.currentBowler ? [matchState.currentBowler.id] : []}
        />
    }
  }

  if (!matchState.isTossCompleted) {
    return <Toss 
        teams={matchState.teams} 
        onCompleteToss={handleTossComplete}
        onUpdateRosters={handleUpdateRosters}
    />;
  }

  if (matchState.isInningsBreak) {
    return <InningsBreak matchState={matchState} onStartSecondInnings={startSecondInnings} />;
  }
  
  const isFirstInnings = matchState.currentInnings === 1;
  const currentInningsData = matchState.innings[matchState.currentInnings - 1];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderPlayerSelectionModal()}
      {advancedModal.isOpen && advancedModal.type && (
          <AdvancedEntryModal
              isOpen={true}
              type={advancedModal.type}
              onClose={handleCloseAdvancedModal}
              onConfirm={handleConfirmAdvancedEntry}
              bowlingTeam={currentInningsData!.bowlingTeam}
              striker={matchState.striker}
              nonStriker={matchState.nonStriker}
          />
      )}
      {matchState.isMatchOver ? (
        <MatchSummary matchState={matchState} onFinish={onMatchFinished} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scoreboard: Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2">
            <Scoreboard matchState={matchState} />
          </div>

          {/* Sidebar: Appears after scoreboard on mobile, in 3rd column on desktop */}
          <div className="lg:row-span-2 lg:col-start-3 space-y-6">
            <BallEntryPad 
                onRecordBall={handleRecordBall} 
                onAdvancedEntry={handleAdvancedEntry}
                disabled={matchState.isMatchOver || !!matchState.nextActionRequired} 
            />
            <ActionToolbar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
            
            {/* AI Insights Block */}
            <div className="bg-slate-800 rounded-xl shadow-lg">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <WandIcon className="w-5 h-5 text-purple-400" />
                        AI Insights
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <h4 className="font-bold text-gray-200">{isFirstInnings ? 'Score Predictor' : 'Win Predictor'}</h4>
                        <p className="text-gray-400 mb-3 text-sm">
                            {isFirstInnings ? 'Project the first innings final score.' : 'Analyze the chase to predict the winner.'}
                        </p>
                        <ProjectedScore matchState={matchState} />
                    </div>
                    <hr className="border-slate-700" />
                    <div>
                        <h4 className="font-bold text-gray-200">Captain's Advisor</h4>
                        <p className="text-gray-400 mb-3 text-sm">
                            Get tactical suggestions for bowling changes, field placements, and more.
                        </p>
                        <AITacticalAdvisor matchState={matchState} />
                    </div>
                </div>
            </div>
          </div>
          
          {/* Scorecard Tabs: Appears after sidebar on mobile, below scoreboard on desktop */}
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2">
            <ScorecardTabs teams={matchState.teams} innings={matchState.innings} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringView;