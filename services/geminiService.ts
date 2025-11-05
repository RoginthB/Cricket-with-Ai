import { GoogleGenAI, Type } from "@google/genai";
import { MatchState, ScheduledMatch, MatchSummaryData } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

export const generateProjectedScore = async (matchState: MatchState): Promise<string> => {
  try {
    const { currentInnings, innings, striker, nonStriker, currentBowler, maxOvers } = matchState;
    const currentInningsData = innings[currentInnings - 1]!;
    const battingTeam = currentInningsData.battingTeam;
    const bowlingTeam = currentInningsData.bowlingTeam;

    const context = `
      Match State:
      - Batting Team: ${battingTeam.name}
      - Score: ${battingTeam.score}/${battingTeam.wickets}
      - Overs: ${battingTeam.overs.toFixed(1)}
      - Maximum Overs: ${maxOvers}
      - Current Batsmen: ${striker.name} (${striker.runs} off ${striker.balls}) and ${nonStriker.name} (${nonStriker.runs} off ${nonStriker.balls}).
      - Current Bowler: ${currentBowler.name} (${currentBowler.wickets}/${currentBowler.runsConceded}).
    `;

    const prompt = `You are a cricket analytics expert. Based on the following match situation, predict the final score for the batting team. Provide a single score or a narrow range (e.g., 175-180).
    
    ${context}
    
    Projected Final Score:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating projected score:", error);
    return "Not available";
  }
};

export const generateWinPrediction = async (matchState: MatchState): Promise<string> => {
  try {
    const { innings, currentInnings, target, striker, nonStriker, currentBowler, maxOvers } = matchState;
    const currentInningsData = innings[currentInnings - 1]!;
    const battingTeam = currentInningsData.battingTeam;
    const bowlingTeam = currentInningsData.bowlingTeam;
    const requiredRuns = target! - battingTeam.score;
    const ballsRemaining = (maxOvers * 6) - (Math.floor(battingTeam.overs) * 6 + (battingTeam.overs * 10 % 10));

    const context = `
      Match State (Second Innings Chase):
      - Chasing Team: ${battingTeam.name}
      - Target Score: ${target}
      - Current Score: ${battingTeam.score}/${battingTeam.wickets}
      - Overs Completed: ${battingTeam.overs.toFixed(1)} out of ${maxOvers}
      - Runs Needed: ${requiredRuns} from ${ballsRemaining} balls.
      - Current Batsmen: ${striker.name} (${striker.runs} off ${striker.balls}) and ${nonStriker.name} (${nonStriker.runs} off ${nonStriker.balls}).
      - Defending Team's Bowler: ${currentBowler.name}.
    `;

    const prompt = `You are a cricket analytics expert. Based on the following chase scenario, predict the winning team and provide a brief justification. For example: "${battingTeam.name} to win, they have wickets in hand and the required rate is manageable." or "${bowlingTeam.name} has the upper hand, the required rate is too high."
    
    ${context}
    
    Winning Prediction:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating win prediction:", error);
    return "Not available";
  }
};


export const generateTournamentSchedule = async (prompt: string): Promise<ScheduledMatch[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following request, generate a cricket tournament schedule. Ensure the output is a valid JSON array matching the provided schema. Request: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            matchNumber: {
                                type: Type.INTEGER,
                                description: 'The sequential number of the match.',
                            },
                            teamA: {
                                type: Type.STRING,
                                description: 'The name of the first team.',
                            },
                            teamB: {
                                type: Type.STRING,
                                description: 'The name of the second team.',
                            },
                            date: {
                                type: Type.STRING,
                                description: 'The date of the match (e.g., "2024-12-01").',
                            },
                            venue: {
                                type: Type.STRING,
                                description: 'The location or venue of the match.',
                            },
                        },
                        required: ["matchNumber", "teamA", "teamB", "date", "venue"],
                    },
                },
            },
        });

        const jsonString = response.text.trim();
        const schedule = JSON.parse(jsonString);
        return schedule as ScheduledMatch[];

    } catch (error) {
        console.error("Error generating tournament schedule:", error);
        throw new Error("Failed to generate schedule. The AI might be busy or the request is unclear.");
    }
};


export const generateMatchSummary = async (matchState: MatchState): Promise<MatchSummaryData> => {
    try {
        const { matchWinner, teams, innings } = matchState;
        const firstInnings = innings[0]!;
        const secondInnings = innings[1];

        let margin = "";
        if (matchWinner) {
            if (secondInnings && matchWinner.id === secondInnings.battingTeam.id) {
                const wicketsLeft = 10 - secondInnings.battingTeam.wickets;
                margin = `by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
            } else if (firstInnings && matchWinner.id === firstInnings.battingTeam.id) {
                const runDifference = firstInnings.battingTeam.score - (secondInnings ? secondInnings.battingTeam.score : 0);
                margin = `by ${runDifference} run${runDifference !== 1 ? 's' : ''}`;
            }
        } else {
            margin = "Match Tied";
        }

        const teamA = teams[0];
        const teamB = teams[1];

        const prompt = `You are a cricket commentator. Based on the following final match data, generate a concise match summary. Identify the top batsman and top bowler of the match from either team based on their impact and stats.

        Match Data:
        - ${teamA.name}: ${teamA.score}/${teamA.wickets} (${teamA.overs.toFixed(1)} overs)
        - ${teamB.name}: ${teamB.score}/${teamB.wickets} (${secondInnings ? secondInnings.battingTeam.overs.toFixed(1) : 'DNB'} overs)
        - Winner: ${matchWinner ? matchWinner.name : 'None'}
        - Result: ${margin}
        
        Team Scorecards (for context):
        - ${teamA.name} Players: ${JSON.stringify(teamA.players.map(p => ({ name: p.name, runs: p.runs, balls: p.balls, wickets: p.wickets, runsConceded: p.runsConceded, overs: p.overs})))}
        - ${teamB.name} Players: ${JSON.stringify(teamB.players.map(p => ({ name: p.name, runs: p.runs, balls: p.balls, wickets: p.wickets, runsConceded: p.runsConceded, overs: p.overs})))}

        Provide the output in the specified JSON format. The top batsman's stat should be "runs (balls)" and the top bowler's stat should be "wickets/runs".
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        narrative: {
                            type: Type.STRING,
                            description: 'A short, engaging summary of the match.',
                        },
                        topBatsman: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                team: { type: Type.STRING },
                                stat1: { type: Type.STRING, description: 'Runs and balls, e.g., "78 (45)"' },
                            },
                            required: ["name", "team", "stat1"],
                        },
                        topBowler: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                team: { type: Type.STRING },
                                stat1: { type: Type.STRING, description: 'Wickets and runs conceded, e.g., "4/21"' },
                            },
                            required: ["name", "team", "stat1"],
                        },
                    },
                    required: ["narrative", "topBatsman", "topBowler"],
                },
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as MatchSummaryData;

    } catch (error) {
        console.error("Error generating match summary:", error);
        throw new Error("Failed to generate match summary.");
    }
};

export const generateMatchHighlights = async (matchState: MatchState): Promise<string> => {
    try {
        const { matchWinner, innings, playersPerTeam = 11 } = matchState;
        const firstInnings = innings[0]!;
        const secondInnings = innings[1];

        let margin = "";
        if (matchWinner) {
            if (secondInnings && matchWinner.id === secondInnings.battingTeam.id) {
                const wicketsLeft = (playersPerTeam - 1) - secondInnings.battingTeam.wickets;
                margin = `won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
            } else if (firstInnings && matchWinner.id === firstInnings.battingTeam.id) {
                const runDifference = firstInnings.battingTeam.score - (secondInnings ? secondInnings.battingTeam.score : 0);
                margin = `won by ${runDifference} run${runDifference !== 1 ? 's' : ''}`;
            }
        } else {
            margin = "Match Tied";
        }

        const formatPlayerStats = (players: any[]) => players.map(p => ({ 
            name: p.name, 
            runs: p.runs, 
            balls: p.balls, 
            wickets: p.wickets, 
            runsConceded: p.runsConceded, 
            overs: p.overs 
        }));

        const innings1Context = `
        Innings 1 (${firstInnings.battingTeam.name}):
        - Final Score: ${firstInnings.battingTeam.score}/${firstInnings.battingTeam.wickets} (${firstInnings.battingTeam.overs.toFixed(1)} overs)
        - Batting: ${JSON.stringify(formatPlayerStats(firstInnings.battingTeam.players))}
        - Bowling: ${JSON.stringify(formatPlayerStats(firstInnings.bowlingTeam.players))}
        - Fall of Wickets: ${JSON.stringify(firstInnings.fallOfWickets)}
        `;

        const innings2Context = secondInnings ? `
        Innings 2 (${secondInnings.battingTeam.name}):
        - Final Score: ${secondInnings.battingTeam.score}/${secondInnings.battingTeam.wickets} (${secondInnings.battingTeam.overs.toFixed(1)} overs)
        - Batting: ${JSON.stringify(formatPlayerStats(secondInnings.battingTeam.players))}
        - Bowling: ${JSON.stringify(formatPlayerStats(secondInnings.bowlingTeam.players))}
        - Fall of Wickets: ${JSON.stringify(secondInnings.fallOfWickets)}
        ` : '';

        const prompt = `
        You are an expert cricket commentator. Based on the detailed match data below, generate a short, exciting, bulleted list of the top 3-5 highlights of the match. Focus on turning points like crucial wickets, quickfire fifties, sixes at important moments, or hat-tricks. Use markdown for the bulleted list.

        Match Result:
        - ${matchWinner ? `${matchWinner.name} ${margin}`: 'Match Tied'}

        ${innings1Context}
        ${innings2Context}

        Example Output:
        * **8.4 Overs:** Virat Kohli reaches his fifty with a glorious cover drive!
        * **12.1 Overs:** Turning Point! Jasprit Bumrah castles the set batsman with a searing yorker.
        * **19.5 Overs:** Andre Russell seals the victory with a monstrous six over long-on!

        Generate the highlights now:
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating match highlights:", error);
        throw new Error("Failed to generate match highlights.");
    }
};