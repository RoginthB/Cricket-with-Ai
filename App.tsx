import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import AIScheduler from './components/AIScheduler';
import Home from './components/Home';
import ScoringView from './components/ScoringView';
import MatchHistory from './components/MatchHistory';
import EditMatchModal from './components/EditMatchModal';
import { MatchState, Player, Team, ScheduledMatch, CustomTeam, PlayerRosterItem } from './types';

type View = 'home' | 'scoring' | 'scheduler' | 'history';

const rosterToPlayers = (roster: PlayerRosterItem[], teamName: string, idStart: number): Player[] =>
  roster.map((player, i) => ({
    id: idStart + i,
    name: player.name,
    runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false,
    overs: 0, maidens: 0, runsConceded: 0, wickets: 0,
  }));

// Helper to create default players
const createDefaultPlayers = (namePrefix: string, idStart: number, count: number = 11): Player[] =>
  Array.from({ length: count }, (_, i) => ({
    id: idStart + i,
    name: `${namePrefix} ${i + 1}`,
    runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false,
    overs: 0, maidens: 0, runsConceded: 0, wickets: 0,
  }));

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [matches, setMatches] = useState<MatchState[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<MatchState | null>(null);

  // Load matches from localStorage on initial render
  useEffect(() => {
    try {
      const savedMatches = localStorage.getItem('cricketMatches');
      if (savedMatches) {
        setMatches(JSON.parse(savedMatches));
      }
      const savedActiveId = localStorage.getItem('activeMatchId');
      if (savedActiveId && savedActiveId !== 'null') {
         const foundMatch = (JSON.parse(savedMatches || '[]') as MatchState[]).find(m => m.id === savedActiveId);
         if (foundMatch && foundMatch.status === 'live') {
            setActiveMatchId(savedActiveId);
            setCurrentView('scoring');
         }
      }
    } catch (error) {
      console.error("Failed to load matches from localStorage", error);
    }
  }, []);

  // Save matches to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cricketMatches', JSON.stringify(matches));
    } catch (error) {
      console.error("Failed to save matches to localStorage", error);
    }
  }, [matches]);

  // Save active match ID
  useEffect(() => {
    try {
      localStorage.setItem('activeMatchId', activeMatchId || '');
    } catch (error) {
      console.error("Failed to save active match ID", error);
    }
  }, [activeMatchId]);

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
  };

  const handleUpdateMatch = useCallback((updatedMatch: MatchState) => {
    setMatches(prevMatches => prevMatches.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  }, []);
  
  const handleUpdateScheduledMatch = (updatedMatch: MatchState) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    setEditingMatch(null);
  }

  const handleDeleteMatch = (matchId: string) => {
    if(window.confirm("Are you sure you want to delete this scheduled match?")) {
        setMatches(prev => prev.filter(m => m.id !== matchId));
    }
  }

  const handleCreateMatch = (team1Info: CustomTeam | string, team2Info: CustomTeam | string, description: string, maxOvers: number, playersPerTeam: number) => {
      const matchId = `match_${Date.now()}`;
      
      const team1Name = typeof team1Info === 'string' ? team1Info : team1Info.name;
      const team2Name = typeof team2Info === 'string' ? team2Info : team2Info.name;

      const team1Players = typeof team1Info === 'string' 
        ? createDefaultPlayers(team1Name, 1, playersPerTeam)
        : rosterToPlayers(team1Info.players, team1Name, 1);
        
      const team2Players = typeof team2Info === 'string'
        ? createDefaultPlayers(team2Name, 1 + team1Players.length, playersPerTeam)
        : rosterToPlayers(team2Info.players, team2Name, 1 + team1Players.length);

      const team1: Team = { id: 1, name: team1Name, players: team1Players, score: 0, wickets: 0, overs: 0.0 };
      const team2: Team = { id: 2, name: team2Name, players: team2Players, score: 0, wickets: 0, overs: 0.0 };

      const newMatch: MatchState = {
        id: matchId,
        description,
        status: 'live',
        teams: [team1, team2],
        innings: [{ battingTeam: team1, bowlingTeam: team2, overs: [{ overNumber: 1, balls: [] }], fallOfWickets: [] }, null],
        currentInnings: 1,
        striker: null!,
        nonStriker: null!,
        currentBowler: null!,
        tossWinner: null,
        decision: null,
        isMatchOver: false,
        maxOvers,
        playersPerTeam,
        isTossCompleted: false,
        isInningsBreak: false,
        target: null,
        nextActionRequired: null,
      };

      setMatches(prev => [...prev, newMatch]);
      setActiveMatchId(matchId);
      setCurrentView('scoring');
  };
  
  const handleStartScoring = (matchId: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? {...m, status: 'live'} : m));
    setActiveMatchId(matchId);
    setCurrentView('scoring');
  };

  const handleScheduleGenerated = (scheduledMatches: ScheduledMatch[], maxOvers: number, playersPerTeam: number) => {
      const savedTeamsRaw = localStorage.getItem('customTeams');
      const customTeams: CustomTeam[] = savedTeamsRaw ? JSON.parse(savedTeamsRaw) : [];
      const customTeamMap = new Map(customTeams.map(t => [t.name, t]));

      const newMatches: MatchState[] = scheduledMatches.map((sm, i) => {
          const id = `scheduled_${Date.now()}_${i}`;
          
          const team1Roster = customTeamMap.get(sm.teamA);
          const team2Roster = customTeamMap.get(sm.teamB);

          const team1Players = team1Roster ? rosterToPlayers(team1Roster.players, sm.teamA, 1) : createDefaultPlayers(sm.teamA, 1, playersPerTeam);
          // FIX: Corrected arguments for rosterToPlayers and made player ID generation robust by using team1Players.length.
          const team2Players = team2Roster ? rosterToPlayers(team2Roster.players, sm.teamB, 1 + team1Players.length) : createDefaultPlayers(sm.teamB, 1 + team1Players.length, playersPerTeam);

          const team1: Team = { id: 1, name: sm.teamA, players: team1Players, score: 0, wickets: 0, overs: 0.0 };
          const team2: Team = { id: 2, name: sm.teamB, players: team2Players, score: 0, wickets: 0, overs: 0.0 };
          return {
              id,
              description: `${sm.teamA} vs ${sm.teamB}`,
              status: 'scheduled',
              date: sm.date,
              venue: sm.venue,
              teams: [team1, team2],
              innings: [{ battingTeam: team1, bowlingTeam: team2, overs: [{ overNumber: 1, balls: [] }], fallOfWickets: [] }, null],
              currentInnings: 1,
              striker: null!, 
              nonStriker: null!, 
              currentBowler: null!,
              tossWinner: null, decision: null, isMatchOver: false, 
              maxOvers, 
              playersPerTeam, 
              isTossCompleted: false, 
              isInningsBreak: false,
              target: null,
              nextActionRequired: null,
          };
      });
      // Avoid duplicates
      const existingIds = new Set(matches.map(m => `${m.description} ${m.date}`));
      const filteredNewMatches = newMatches.filter(m => !existingIds.has(`${m.description} ${m.date}`));
      
      setMatches(prev => [...prev, ...filteredNewMatches]);
      alert(`${filteredNewMatches.length} new matches scheduled and saved!`);
  };

  const activeMatch = matches.find(m => m.id === activeMatchId);

  const renderView = () => {
    switch(currentView) {
      case 'scoring':
        return activeMatch 
          ? <ScoringView 
              key={activeMatch.id} 
              match={activeMatch} 
              onUpdate={handleUpdateMatch}
              onMatchFinished={() => {
                setActiveMatchId(null);
                setCurrentView('history');
              }}
            /> 
          : <div className="text-center p-8 text-gray-400">No active match selected. Go to Home to start or resume a match.</div>;
      case 'scheduler':
        return <AIScheduler 
          matches={matches} 
          onScheduleGenerated={handleScheduleGenerated} 
          onEditMatch={setEditingMatch}
          onDeleteMatch={handleDeleteMatch}
        />;
      case 'history':
        return <MatchHistory matches={matches} />;
      case 'home':
      default:
        return <Home 
          matches={matches} 
          onCreateMatch={handleCreateMatch} 
          onStartScoring={handleStartScoring}
          onEditMatch={setEditingMatch}
          onDeleteMatch={handleDeleteMatch}
        />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      {editingMatch && (
        <EditMatchModal
          isOpen={!!editingMatch}
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={handleUpdateScheduledMatch}
        />
      )}
      <main>
        {renderView()}
      </main>
    </div>
  );
};

export default App;