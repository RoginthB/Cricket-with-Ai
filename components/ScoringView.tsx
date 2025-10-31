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

interface ScoringViewProps {
  match: MatchState;
  onUpdate: (newState: MatchState) => void;
}

const ScoringView: React.FC<ScoringViewProps> = ({ match, onUpdate }) => {
  const { matchState, recordBall, completeToss, updateRosters, undo, redo, canUndo, canRedo } = useMatchState(match, onUpdate);

  const handleRecordBall = useCallback((ballData: any) => {
    recordBall(ballData);
  }, [recordBall]);
  
  const handleTossComplete = (winnerId: number, decision: 'bat' | 'bowl', maxOvers: number) => {
    completeToss(winnerId, decision, maxOvers);
  };

  const handleUpdateRosters = (updatedTeams: [Team, Team]) => {
    updateRosters(updatedTeams);
  };

  if (!matchState.isTossCompleted) {
    return <Toss 
        teams={matchState.teams} 
        onCompleteToss={handleTossComplete}
        onUpdateRosters={handleUpdateRosters}
    />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {matchState.isMatchOver ? (
        <MatchSummary matchState={matchState} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Scoreboard matchState={matchState} />
              <ProjectedScore matchState={matchState} />
            </div>
            <div className="space-y-4">
              <BallEntryPad onRecordBall={handleRecordBall} disabled={matchState.isMatchOver} />
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