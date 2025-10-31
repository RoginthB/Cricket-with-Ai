import { useState, useCallback, useEffect } from 'react';
import { MatchState, Ball, Over, Player, Team, Innings } from '../types';

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
        // Only notify if the state has genuinely changed
        onStateChange(history.present);
    }, [history.present, onStateChange]);

    // Effect to sync with parent if the initial state prop changes
    useEffect(() => {
        setHistory({ past: [], present: initialState, future: [] });
    }, [JSON.stringify(initialState)]);


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
            return {
                past: [...h.past, h.present],
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
            const currentBattingTeam = currentInningsData.battingTeam;
            const currentBowlingTeam = currentInningsData.bowlingTeam;
            const updatedStriker = currentBattingTeam.players.find((p: Player) => p.id === newState.striker.id);
            const updatedNonStriker = currentBattingTeam.players.find((p: Player) => p.id === newState.nonStriker.id);
            const updatedBowler = currentBowlingTeam.players.find((p: Player) => p.id === newState.currentBowler.id);
            if(updatedStriker) newState.striker = updatedStriker;
            if(updatedNonStriker) newState.nonStriker = updatedNonStriker;
            if(updatedBowler) newState.currentBowler = updatedBowler;
            return newState;
        });
    }, [updateState]);

    const completeToss = useCallback((tossWinnerId: number, decision: 'bat' | 'bowl', maxOvers: number) => {
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
            newState.maxOvers = maxOvers;
            newState.innings[0]!.battingTeam = battingTeam;
            newState.innings[0]!.bowlingTeam = bowlingTeam;
            newState.striker = battingTeam.players.find((p: Player) => !p.isOut)!;
            newState.nonStriker = battingTeam.players.find((p: Player) => !p.isOut && p.id !== newState.striker.id)!;
            newState.currentBowler = bowlingTeam.players.find((p: Player, i: number) => i >= 6) || bowlingTeam.players.slice(-1)[0];
            newState.isTossCompleted = true;
            return newState;
        });
    }, [updateState]);

    const recordBall = useCallback((ballData: Partial<Ball> & { runs: number; isWicket: boolean }) => {
        updateState(prevState => {
            if (prevState.isMatchOver) return prevState;
            const newState = JSON.parse(JSON.stringify(prevState));
            const maxWickets = newState.playersPerTeam - 1;
            const currentInningsData = newState.innings[newState.currentInnings - 1] as Innings;
            let currentOver = currentInningsData.overs.slice(-1)[0];
            if (!currentOver) {
                currentOver = { overNumber: 1, balls: [] };
                currentInningsData.overs.push(currentOver);
            }
            const fullBallData: Ball = { ...ballData, bowlerId: newState.currentBowler.id, batsmanId: newState.striker.id, isExtra: ballData.isExtra ?? false, };
            if(!ballData.extraType){
                currentOver.balls.push(fullBallData);
            }
            currentInningsData.battingTeam.score += ballData.runs;
            if (ballData.extraType) {
                currentInningsData.battingTeam.score += 1;
            }
            const striker = currentInningsData.battingTeam.players.find((p: Player) => p.id === newState.striker.id)!;
            if(!ballData.extraType || ballData.extraType === 'Nb'){
                 striker.balls += 1;
            }
            if(!ballData.isExtra){
                striker.runs += ballData.runs;
                if (ballData.boundary === 4) striker.fours++;
                if (ballData.boundary === 6) striker.sixes++;
            }
            const bowler = newState.teams.find((t: Team) => t.id === currentInningsData.bowlingTeam.id)!.players.find((p: Player) => p.id === newState.currentBowler.id)!;
            bowler.runsConceded += ballData.runs;
             if (ballData.extraType) {
                bowler.runsConceded += 1;
             }
            if (ballData.isWicket) {
                striker.isOut = true;
                striker.outMethod = `b ${bowler.name}`;
                currentInningsData.battingTeam.wickets += 1;
                bowler.wickets += 1;
                currentInningsData.fallOfWickets.push({ runs: currentInningsData.battingTeam.score, wicket: currentInningsData.battingTeam.wickets, over: currentInningsData.battingTeam.overs, player: striker.name, });
                if (currentInningsData.battingTeam.wickets < maxWickets) {
                    const nextBatsman = currentInningsData.battingTeam.players.find((p: Player) => !p.isOut && p.id !== newState.nonStriker.id);
                    if (nextBatsman) {
                        newState.striker = nextBatsman;
                    }
                }
            }
            if (ballData.runs % 2 !== 0 && !ballData.isExtra) {
                [newState.striker, newState.nonStriker] = [newState.nonStriker, newState.striker];
            }
            const isLastBallOfOver = currentOver.balls.length === 6 && !ballData.extraType;
            if (isLastBallOfOver) {
                [newState.striker, newState.nonStriker] = [newState.nonStriker, newState.striker];
                const overAsString = (Math.floor(currentInningsData.battingTeam.overs) + 1).toFixed(1);
                currentInningsData.battingTeam.overs = parseFloat(overAsString);
                currentInningsData.overs.push({ overNumber: currentInningsData.overs.length + 1, balls: [] });
                bowler.overs = parseFloat((bowler.overs + 0.5).toFixed(1));
                 if (String(bowler.overs).endsWith('.6')) {
                    bowler.overs = Math.ceil(bowler.overs);
                 }
                const currentBowlerIndex = currentInningsData.bowlingTeam.players.findIndex(p => p.id === bowler.id);
                const nextBowlerIndex = (currentBowlerIndex + 1) % currentInningsData.bowlingTeam.players.length;
                newState.currentBowler = currentInningsData.bowlingTeam.players[nextBowlerIndex];
            } else if (!ballData.extraType) {
                 currentInningsData.battingTeam.overs = parseFloat((Math.floor(currentInningsData.battingTeam.overs) + currentOver.balls.length / 10).toFixed(1));
                 bowler.overs = parseFloat((Math.floor(bowler.overs) + currentOver.balls.length / 10).toFixed(1));
            }
            const isAllOut = currentInningsData.battingTeam.wickets >= maxWickets;
            const isOversFinished = currentInningsData.battingTeam.overs >= newState.maxOvers;
            const isTargetReached = newState.target && currentInningsData.battingTeam.score >= newState.target;
            const inningsOver = isAllOut || isOversFinished;
            if (newState.currentInnings === 1 && inningsOver) {
                newState.target = currentInningsData.battingTeam.score + 1;
                newState.currentInnings = 2;
                const newBattingTeam = JSON.parse(JSON.stringify(newState.innings[0]!.bowlingTeam));
                const newBowlingTeam = JSON.parse(JSON.stringify(newState.innings[0]!.battingTeam));
                newState.innings[1] = { battingTeam: newBattingTeam, bowlingTeam: newBowlingTeam, overs: [{ overNumber: 1, balls: [] }], fallOfWickets: [], };
                newState.striker = newBattingTeam.players.find((p: Player) => !p.isOut)!;
                newState.nonStriker = newBattingTeam.players.find((p: Player) => !p.isOut && p.id !== newState.striker.id)!;
                newState.currentBowler = newBowlingTeam.players.find((p: Player, i: number) => i >= 6) || newBowlingTeam.players.slice(-1)[0];
            } else if (newState.currentInnings === 2 && (inningsOver || isTargetReached)) {
                newState.isMatchOver = true;
                newState.status = 'completed';
                if(isTargetReached) {
                    newState.matchWinner = currentInningsData.battingTeam;
                } else if (newState.target && currentInningsData.battingTeam.score < newState.target - 1) {
                    newState.matchWinner = currentInningsData.bowlingTeam;
                }
            }
            const battingTeamIndex = newState.teams.findIndex((t: Team) => t.id === currentInningsData.battingTeam.id)!;
            newState.teams[battingTeamIndex] = currentInningsData.battingTeam;
            const bowlingTeamIndex = newState.teams.findIndex((t: Team) => t.id === currentInningsData.bowlingTeam.id)!;
            const bowlerTeam = newState.teams[bowlingTeamIndex];
            const bowlerInTeamIndex = bowlerTeam.players.findIndex((p: Player) => p.id === bowler.id);
            if (bowlerInTeamIndex !== -1) {
                bowlerTeam.players[bowlerInTeamIndex] = bowler;
            }
            currentInningsData.bowlingTeam = bowlerTeam;
            const finalBattingTeam = currentInningsData.battingTeam;
            const finalBowlingTeam = currentInningsData.bowlingTeam;
            const updatedStriker = finalBattingTeam.players.find(p => p.id === newState.striker.id);
            const updatedNonStriker = finalBattingTeam.players.find(p => p.id === newState.nonStriker.id);
            const updatedBowler = finalBowlingTeam.players.find(p => p.id === newState.currentBowler.id);
            if (updatedStriker) newState.striker = updatedStriker;
            if (updatedNonStriker) newState.nonStriker = updatedNonStriker;
            if (updatedBowler) newState.currentBowler = updatedBowler;
            return newState;
        });
    }, [updateState]);

    return { matchState, recordBall, completeToss, updateRosters, undo, redo, canUndo, canRedo };
};