import { useState, useCallback, useEffect } from 'react';
import { MatchState, Ball, Over, Player, Team, Innings, WicketDetails } from '../types';

interface StateHistory {
    past: MatchState[];
    present: MatchState;
    future: MatchState[];
}

export const useMatchState = (initialState: MatchState, onStateChange: (newState: MatchState) => void) => {
    const [history, setHistory] = useState<StateHistory>({
        past: [],
        present: initialState,
        future: [],
    });

    const { present: matchState } = history;
    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    // Effect to notify parent component on state changes for persistence
    useEffect(() => {
        onStateChange(history.present);
    }, [history.present, onStateChange]);

    const undo = useCallback(() => {
        setHistory(h => {
            if (h.past.length === 0) return h;
            const previous = h.past[h.past.length - 1];
            const newPast = h.past.slice(0, h.past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [h.present, ...h.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(h => {
            if (h.future.length === 0) return h;
            const next = h.future[0];
            const newFuture = h.future.slice(1);
            return {
                past: [...h.past, h.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const updateState = useCallback((newStateFn: (prevState: MatchState) => MatchState) => {
        setHistory(h => {
            const newPresent = newStateFn(h.present);
            if (JSON.stringify(newPresent) === JSON.stringify(h.present)) return h;
            const newPast = [...h.past, h.present];
            return {
                past: newPast,
                present: newPresent,
                future: [],
            };
        });
    }, []);


    const updateRosters = useCallback((updatedTeams: [Team, Team]) => {
        updateState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState));
            newState.teams = updatedTeams;
            const currentInningsData = newState.innings[newState.currentInnings - 1];
            if (currentInningsData) {
                const newBattingTeam = updatedTeams.find(t => t.id === currentInningsData.battingTeam.id);
                const newBowlingTeam = updatedTeams.find(t => t.id === currentInningsData.bowlingTeam.id);
                if (newBattingTeam) currentInningsData.battingTeam = newBattingTeam;
                if (newBowlingTeam) currentInningsData.bowlingTeam = newBowlingTeam;
            }
            // Invalidate current players if rosters change, forcing re-selection if match has started
            if (newState.isTossCompleted && !newState.nextActionRequired) {
                 const currentBattingTeam = currentInningsData.battingTeam;
                 const currentBowlingTeam = currentInningsData.bowlingTeam;
                 const updatedStriker = currentBattingTeam.players.find((p: Player) => p.id === newState.striker.id);
                 const updatedNonStriker = currentBattingTeam.players.find((p: Player) => p.id === newState.nonStriker.id);
                 const updatedBowler = currentBowlingTeam.players.find((p: Player) => p.id === newState.currentBowler.id);
                 if(updatedStriker) newState.striker = updatedStriker;
                 if(updatedNonStriker) newState.nonStriker = updatedNonStriker;
                 if(updatedBowler) newState.currentBowler = updatedBowler;
            }
            return newState;
        });
    }, [updateState]);

    const completeToss = useCallback((tossWinnerId: number, decision: 'bat' | 'bowl') => {
        updateState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState));
            const tossWinner = newState.teams.find((t: Team) => t.id === tossWinnerId)!;
            const tossLoser = newState.teams.find((t: Team) => t.id !== tossWinnerId)!;
            let battingTeam, bowlingTeam;
            if (decision === 'bat') {
                battingTeam = tossWinner;
                bowlingTeam = tossLoser;
            } else {
                battingTeam = tossLoser;
                bowlingTeam = tossWinner;
            }
            newState.tossWinner = tossWinner;
            newState.decision = decision;
            newState.innings[0]!.battingTeam = battingTeam;
            newState.innings[0]!.bowlingTeam = bowlingTeam;
            newState.isTossCompleted = true;
            newState.nextActionRequired = 'SELECT_OPENERS';
            return newState;
        });
    }, [updateState]);

    const setOpeningBatsmen = useCallback((strikerId: number, nonStrikerId: number) => {
        updateState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState));
            const currentInningsData = newState.innings[newState.currentInnings - 1]!;
            newState.striker = currentInningsData.battingTeam.players.find((p: Player) => p.id === strikerId)!;
            newState.nonStriker = currentInningsData.battingTeam.players.find((p: Player) => p.id === nonStrikerId)!;
            newState.nextActionRequired = 'SELECT_BOWLER'; // Immediately require bowler selection
            return newState;
        });
    }, [updateState]);

    const setNextBatsman = useCallback((batsmanId: number) => {
        updateState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState));
            const currentInningsData = newState.innings[newState.currentInnings - 1]!;
            const nextBatsman = currentInningsData.battingTeam.players.find((p: Player) => p.id === batsmanId)!;
            newState.striker = nextBatsman; // New batsman is always the striker
            newState.nextActionRequired = null;
            return newState;
        });
    }, [updateState]);
    
    const setBowler = useCallback((bowlerId: number) => {
        updateState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState));
            const currentInningsData = newState.innings[newState.currentInnings - 1]!;
            newState.currentBowler = currentInningsData.bowlingTeam.players.find((p: Player) => p.id === bowlerId)!;
            newState.nextActionRequired = null;
            return newState;
        });
    }, [updateState]);

    const startSecondInnings = useCallback(() => {
        updateState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState));
            
            newState.isInningsBreak = false;
            newState.currentInnings = 2;
            
            const newBattingTeam = JSON.parse(JSON.stringify(newState.innings[0]!.bowlingTeam));
            const newBowlingTeam = JSON.parse(JSON.stringify(newState.innings[0]!.battingTeam));

            newState.innings[1] = { 
                battingTeam: newBattingTeam, 
                bowlingTeam: newBowlingTeam, 
                overs: [{ overNumber: 1, balls: [] }], 
                fallOfWickets: [], 
            };
            
            newState.nextActionRequired = 'SELECT_OPENERS';

            return newState;
        });
    }, [updateState]);

    const recordBall = useCallback((ballData: Partial<Ball> & { runs: number }) => {
        updateState(prevState => {
            if (prevState.isMatchOver || prevState.isInningsBreak || prevState.nextActionRequired) return prevState;
            const newState = JSON.parse(JSON.stringify(prevState));
            const maxWickets = newState.playersPerTeam - 1;

            const currentInningsData = newState.innings[newState.currentInnings - 1] as Innings;
            const { battingTeam, bowlingTeam } = currentInningsData;
            
            let currentOver = currentInningsData.overs.slice(-1)[0];
            if (!currentOver) {
                currentOver = { overNumber: 1, balls: [] };
                currentInningsData.overs.push(currentOver);
            }

            const fullBallData: Ball = { 
                ...ballData,
                isWicket: ballData.isWicket ?? false,
                isExtra: ballData.isExtra ?? false,
                bowlerId: newState.currentBowler.id, 
                batsmanId: newState.striker.id,
            };

            // --- SCORE & STATS LOGIC ---
            let runsForTeam = 0;
            let runsForBatsman = 0;
            let isLegalDelivery = !fullBallData.isExtra || fullBallData.extraType === 'Nb';
            let ballsFaced = isLegalDelivery ? 1 : 0;

            if (fullBallData.isExtra) {
                switch(fullBallData.extraType) {
                    case 'Wd':
                        runsForTeam = 1 + (fullBallData.extraRuns || 0);
                        break;
                    case 'Nb':
                        runsForTeam = 1 + fullBallData.runs;
                        runsForBatsman = fullBallData.runs;
                        break;
                    case 'B':
                    case 'Lb':
                        runsForTeam = fullBallData.runs;
                        break;
                }
            } else {
                runsForTeam = fullBallData.runs;
                runsForBatsman = fullBallData.runs;
            }
            
            battingTeam.score += runsForTeam;
            
            const striker = battingTeam.players.find((p: Player) => p.id === newState.striker.id)!;
            striker.balls += ballsFaced;
            striker.runs += runsForBatsman;
            if (ballData.boundary === 4) striker.fours++;
            if (ballData.boundary === 6) striker.sixes++;

            const bowler = bowlingTeam.players.find((p: Player) => p.id === newState.currentBowler.id)!;
            bowler.runsConceded += runsForTeam;

            if (isLegalDelivery) {
                currentOver.balls.push(fullBallData);
            }

            // --- WICKET LOGIC ---
            if (fullBallData.isWicket) {
                const { wicketDetails } = fullBallData;
                if (!wicketDetails) throw new Error("Wicket details are missing");

                const batsmanOut = battingTeam.players.find((p: Player) => p.id === wicketDetails.batsmanOutId)!;
                batsmanOut.isOut = true;
                
                let outMethod = '';
                switch(wicketDetails.method) {
                    case 'Caught':
                        const fielder = bowlingTeam.players.find(p => p.id === wicketDetails.fielderId)!;
                        outMethod = `c ${fielder.name} b ${bowler.name}`;
                        bowler.wickets++;
                        break;
                    case 'Caught & Bowled':
                        outMethod = `c & b ${bowler.name}`;
                        bowler.wickets++;
                        break;
                    case 'Bowled':
                        outMethod = `b ${bowler.name}`;
                        bowler.wickets++;
                        break;
                    case 'LBW':
                        outMethod = `lbw b ${bowler.name}`;
                        bowler.wickets++;
                        break;
                    case 'Stumped':
                        const keeper = bowlingTeam.players.find(p => p.id === wicketDetails.fielderId)!;
                        outMethod = `st ${keeper.name} b ${bowler.name}`;
                        bowler.wickets++;
                        break;
                    case 'Hit Wicket':
                        outMethod = `hit wicket b ${bowler.name}`;
                        bowler.wickets++;
                        break;
                    case 'Run Out':
                        outMethod = 'run out';
                        if (wicketDetails.fielderId) {
                             const runOutFielder = bowlingTeam.players.find(p => p.id === wicketDetails.fielderId)!;
                             outMethod += ` (${runOutFielder.name})`
                        }
                        break;
                }
                batsmanOut.outMethod = outMethod;
                battingTeam.wickets++;
                currentInningsData.fallOfWickets.push({ runs: battingTeam.score, wicket: battingTeam.wickets, over: battingTeam.overs, player: batsmanOut.name, });
                
                if (battingTeam.wickets < maxWickets) {
                    newState.nextActionRequired = 'SELECT_NEXT_BATSMAN';
                    if (wicketDetails.batsmanOutId === newState.striker.id) {
                         // The new batsman will take strike, non-striker stays.
                    } else { // non-striker is out
                        newState.nonStriker = null; // will be replaced by new batsman
                    }
                }
            }

            // --- OVER & BATSMAN ROTATION LOGIC ---
            const runsForRotation = fullBallData.extraType === 'B' || fullBallData.extraType === 'Lb' ? fullBallData.runs : runsForBatsman;
            if (runsForRotation % 2 !== 0) {
                [newState.striker, newState.nonStriker] = [newState.nonStriker, newState.striker];
            }
            
            const isLastBallOfOver = currentOver.balls.length === 6;

            if (isLastBallOfOver) {
                [newState.striker, newState.nonStriker] = [newState.nonStriker, newState.striker];
                battingTeam.overs = Math.floor(battingTeam.overs) + 1;
                bowler.overs = Math.floor(bowler.overs) + 1;
                currentInningsData.overs.push({ overNumber: currentInningsData.overs.length + 1, balls: [] });
                
                if (!newState.nextActionRequired) {
                    newState.nextActionRequired = 'SELECT_BOWLER';
                }
            } else if (isLegalDelivery) {
                 battingTeam.overs = parseFloat((Math.floor(battingTeam.overs) + currentOver.balls.length / 10).toFixed(1));
                 bowler.overs = parseFloat((Math.floor(bowler.overs) + currentOver.balls.length / 10).toFixed(1));
            }

            // --- MATCH/INNINGS END LOGIC ---
            const isAllOut = battingTeam.wickets >= maxWickets;
            const isOversFinished = battingTeam.overs >= newState.maxOvers;
            const isTargetReached = newState.target && battingTeam.score >= newState.target;
            const inningsOver = isAllOut || isOversFinished;

            if (newState.currentInnings === 1 && inningsOver) {
                newState.target = battingTeam.score + 1;
                newState.isInningsBreak = true;
                newState.nextActionRequired = null;
            } else if (newState.currentInnings === 2 && (inningsOver || isTargetReached)) {
                newState.isMatchOver = true;
                newState.status = 'completed';
                newState.nextActionRequired = null;
                if(isTargetReached) {
                    newState.matchWinner = battingTeam;
                } else if (newState.target && battingTeam.score < newState.target - 1) {
                    newState.matchWinner = bowlingTeam;
                }
            }
            
            // --- SYNC STATE ---
            const battingTeamIndex = newState.teams.findIndex((t: Team) => t.id === battingTeam.id)!;
            newState.teams[battingTeamIndex] = battingTeam;
            const bowlingTeamIndex = newState.teams.findIndex((t: Team) => t.id === bowlingTeam.id)!;
            newState.teams[bowlingTeamIndex] = bowlingTeam;
            
            // Re-assign player objects from the source of truth (teams array)
            if (newState.striker) {
                newState.striker = battingTeam.players.find(p => p.id === newState.striker.id)!;
            }
            if (newState.nonStriker) {
                newState.nonStriker = battingTeam.players.find(p => p.id === newState.nonStriker.id)!;
            }
            newState.currentBowler = bowlingTeam.players.find(p => p.id === newState.currentBowler.id)!;
            
            return newState;
        });
    }, [updateState]);

    return { matchState, recordBall, completeToss, updateRosters, startSecondInnings, undo, redo, canUndo, canRedo, setOpeningBatsmen, setNextBatsman, setBowler };
};