
import { MatchState, PlayerStats, BestBowling } from '../types';

const STATS_STORAGE_KEY = 'cricketPlayerStats';

export const getAllPlayerStats = (): Record<string, PlayerStats> => {
    try {
        const statsJson = localStorage.getItem(STATS_STORAGE_KEY);
        return statsJson ? JSON.parse(statsJson) : {};
    } catch (error) {
        console.error("Failed to load player stats:", error);
        return {};
    }
};

const saveAllPlayerStats = (stats: Record<string, PlayerStats>) => {
    try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Failed to save player stats:", error);
    }
};

const initializePlayerStats = (name: string): PlayerStats => ({
    name,
    matches: 0,
    inningsBatted: 0,
    runsScored: 0,
    ballsFaced: 0,
    highestScore: 0,
    notOuts: 0,
    fifties: 0,
    hundreds: 0,
    fours: 0,
    sixes: 0,
    oversBowled: 0,
    runsConceded: 0,
    wicketsTaken: 0,
    bestBowling: null,
});

const isNewBestBowling = (currentBest: BestBowling | null, wickets: number, runs: number): boolean => {
    if (!currentBest) return true;
    if (wickets > currentBest.wickets) return true;
    if (wickets === currentBest.wickets && runs < currentBest.runs) return true;
    return false;
};

// Function to combine overs correctly (e.g., 1.5 + 1.2 = 3.1)
const addOvers = (overs1: number, overs2: number): number => {
    const o1 = Math.floor(overs1);
    const b1 = Math.round((overs1 - o1) * 10);
    const o2 = Math.floor(overs2);
    const b2 = Math.round((overs2 - o2) * 10);

    const totalBalls = (o1 * 6 + b1) + (o2 * 6 + b2);
    const finalOvers = Math.floor(totalBalls / 6);
    const finalBalls = totalBalls % 6;
    
    return parseFloat(`${finalOvers}.${finalBalls}`);
};


export const updateStatsAfterMatch = (match: MatchState) => {
    const allStats = getAllPlayerStats();

    const allPlayers = [...match.teams[0].players, ...match.teams[1].players];

    allPlayers.forEach(player => {
        if (!player.name) return; // Skip players with no name
        const stats = allStats[player.name] || initializePlayerStats(player.name);

        stats.matches += 1;

        // Batting Stats
        if (player.balls > 0 || player.isOut) {
            stats.inningsBatted += 1;
            stats.runsScored += player.runs;
            stats.ballsFaced += player.balls;
            stats.fours += player.fours;
            stats.sixes += player.sixes;

            if (player.runs > stats.highestScore) {
                stats.highestScore = player.runs;
            }
            if (!player.isOut && player.balls > 0) {
                stats.notOuts += 1;
            }
            if (player.runs >= 100) {
                stats.hundreds += 1;
            } else if (player.runs >= 50) {
                stats.fifties += 1;
            }
        }

        // Bowling Stats
        if (player.overs > 0) {
            stats.oversBowled = addOvers(stats.oversBowled, player.overs);
            stats.runsConceded += player.runsConceded;
            stats.wicketsTaken += player.wickets;

            if (player.wickets > 0 && isNewBestBowling(stats.bestBowling, player.wickets, player.runsConceded)) {
                stats.bestBowling = { wickets: player.wickets, runs: player.runsConceded };
            }
        }
        
        allStats[player.name] = stats;
    });

    saveAllPlayerStats(allStats);
    console.log("Player stats updated for match:", match.description);
};
