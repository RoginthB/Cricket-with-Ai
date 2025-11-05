import React, { useCallback } from 'react';
import Scoreboard from './Scoreboard';
import BallEntryPad from './BallEntryPad';
import Toss from './Toss';
import ProjectedScore from './ProjectedScore';
import MatchSummary from './MatchSummary';
import ScorecardTabs from './ScorecardTabs';
import { useMatchState } from '../hooks/useMatchState';
import { MatchState, Team } from '../types';
import ActionToolbar from './ActionToolbar';
import InningsBreak from './InningsBreak';
import PlayerSelectionModal from './PlayerSelectionModal';

interface ScoringViewProps {
  match: MatchState;
  onUpdate: (newState: MatchState) => void;
  onMatchFinished: () => void;
}

const ScoringView: React.FC<ScoringViewProps> = ({ match, onUpdate, onMatchFinished }) => {
  const { matchState, recordBall, completeToss, updateRosters, startSecondInnings, undo, redo, canUndo, canRedo, setOpeningBatsmen, setNextBatsman, setBowler } = useMatchState(match, onUpdate);

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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderPlayerSelectionModal()}
      {matchState.isMatchOver ? (
        <MatchSummary matchState={matchState} onFinish={onMatchFinished} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Scoreboard matchState={matchState} />
              <ProjectedScore matchState={matchState} />
            </div>
            <div className="space-y-4">
              <BallEntryPad onRecordBall={handleRecordBall} disabled={matchState.isMatchOver || !!matchState.nextActionRequired} />
              <ActionToolbar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
            </div>
          </div>
          <ScorecardTabs teams={matchState.teams} innings={matchState.innings} />
        </div>
      )}
    </div>
  );
};

export default ScoringView;