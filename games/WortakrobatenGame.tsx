import React, { useState, useCallback } from 'react';
import { WACard, CustomWASet, WASettings, WAGameState } from '../types';
import { WA_SETS } from './wortakrobatenData';
import WASetupScreen from '../components/WASetupScreen';
import WAGameplayScreen from '../components/WAGameplayScreen';
import WAResultsScreen from '../components/WAResultsScreen';
import { useNotification } from '../components/Notification';

// Hilfsfunktion zum Mischen eines Arrays
const shuffleArray = <T,>(array: T[]): T[] => {
    return array.map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
};

interface WortakrobatenGameProps {
    onExit: () => void;
}

enum GamePhase {
    SETUP,
    GAMEPLAY,
    RESULTS,
}

const WortakrobatenGame: React.FC<WortakrobatenGameProps> = ({ onExit }) => {
    const { addNotification } = useNotification();
    const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
    const [players, setPlayers] = useState<string[]>([]);
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [cards, setCards] = useState<WACard[]>([]);
    const [settings, setSettings] = useState<Omit<WASettings, 'playerNames' | 'customWACards' | 'selectedSets'>>({
        roundTime: 90,
        winScore: 20,
        roundCount: 5,
        playStyle: 'teams',
        winCondition: 'score',
        turnStyle: 'classic',
        gameMode: 'mixed',
    });
    const [gameState, setGameState] = useState<WAGameState>({
        teamAScore: 0,
        teamBScore: 0,
        playerScores: {},
        currentTeam: 'A',
        teamAPlayerIndex: 0,
        teamBPlayerIndex: 0,
        currentPlayerIndex: 0,
        turnsTaken: 0,
        currentRound: 1,
    });
    const [lastGameSettings, setLastGameSettings] = useState<Omit<WASettings, 'customWACards'> | null>(null);

    const handleStartGame = useCallback((newSettings: WASettings) => {
        setLastGameSettings({ ...newSettings });
        setSettings({ ...newSettings });

        const { playerNames, gameMode, selectedSets, customWACards, playStyle } = newSettings;
        
        setPlayers(playerNames);
        
        if (playStyle === 'teams') {
            setTeamA(playerNames.filter((_, i) => i % 2 === 0));
            setTeamB(playerNames.filter((_, i) => i % 2 !== 0));
        } else {
            setTeamA([]);
            setTeamB([]);
        }

        // Assemble card list
        let cardsForGame: WACard[] = [];
        const allAvailableSets: CustomWASet[] = [...WA_SETS, ...customWACards];

        selectedSets.forEach(setName => {
            const set = allAvailableSets.find(s => s.name === setName);
            if (set) {
                cardsForGame.push(...set.cards);
            }
        });
        
        // Filter by gameMode
        if (gameMode === 'explain') {
            cardsForGame = cardsForGame.filter(c => c.type === 'explain');
        } else if (gameMode === 'pantomime') {
            cardsForGame = cardsForGame.filter(c => c.type === 'pantomime');
        }

        if (cardsForGame.length === 0) {
            addNotification("Keine Karten für den gewählten Modus in den ausgewählten Sets gefunden. Bitte ändere deine Auswahl.", "error");
             setLastGameSettings(null); // Force user to re-configure
             setPhase(GamePhase.SETUP);
             return;
        }

        setCards(shuffleArray(cardsForGame));
        
        setGameState({
            teamAScore: 0,
            teamBScore: 0,
            playerScores: playerNames.reduce((acc, name) => ({ ...acc, [name]: 0 }), {}),
            currentTeam: 'A',
            teamAPlayerIndex: 0,
            teamBPlayerIndex: 0,
            currentPlayerIndex: 0,
            turnsTaken: 0,
            currentRound: 1,
        });
        
        setPhase(GamePhase.GAMEPLAY);
    }, [addNotification]);

    const handleTurnEnd = useCallback((pointsScored: number, guesserName?: string) => {
        const newGameState = { ...gameState };
        let winner: 'Team A' | 'Team B' | string | null = null;
        
        if (settings.playStyle === 'teams') {
            if (gameState.currentTeam === 'A') {
                const newScore = newGameState.teamAScore + pointsScored;
                newGameState.teamAScore = newScore;
                newGameState.teamAPlayerIndex = (newGameState.teamAPlayerIndex + 1) % teamA.length;
                if (settings.winCondition === 'score' && newScore >= settings.winScore) winner = 'Team A';
            } else {
                const newScore = newGameState.teamBScore + pointsScored;
                newGameState.teamBScore = newScore;
                newGameState.teamBPlayerIndex = (newGameState.teamBPlayerIndex + 1) % teamB.length;
                if (settings.winCondition === 'score' && newScore >= settings.winScore) winner = 'Team B';
            }
            
            newGameState.turnsTaken++;
            if (newGameState.turnsTaken % 2 === 0) {
                newGameState.currentRound++;
            }

            if (settings.winCondition === 'rounds' && newGameState.currentRound > settings.roundCount) {
                winner = newGameState.teamAScore > newGameState.teamBScore ? 'Team A' : 'Team B';
                 if (newGameState.teamAScore === newGameState.teamBScore) winner = 'Unentschieden';
            }

            newGameState.currentTeam = gameState.currentTeam === 'A' ? 'B' : 'A';
        } else { // Free for all
            const explainerName = players[gameState.currentPlayerIndex];
            const newScore = newGameState.playerScores[explainerName] + pointsScored;
            newGameState.playerScores[explainerName] = newScore;

            if (settings.winCondition === 'score' && newScore >= settings.winScore) {
                winner = explainerName;
            }

            newGameState.turnsTaken++;
            if (newGameState.turnsTaken % players.length === 0) {
                newGameState.currentRound++;
            }

            if (settings.winCondition === 'rounds' && newGameState.currentRound > settings.roundCount) {
                 const scores = Object.values(newGameState.playerScores);
                 const maxScore = Math.max(...scores);
                 const winners = Object.keys(newGameState.playerScores).filter(name => newGameState.playerScores[name] === maxScore);
                 winner = winners.join(' & ');
            }

            if (!winner) {
                if (guesserName) {
                    newGameState.currentPlayerIndex = players.indexOf(guesserName);
                } else {
                    newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % players.length;
                }
            }
        }

        setGameState(newGameState);

        if (winner) {
            setPhase(GamePhase.RESULTS);
        }
    }, [gameState, settings, players, teamA, teamB]);

    const handlePlayAgain = () => {
        setPhase(GamePhase.SETUP);
    };

    const renderGame = () => {
        switch (phase) {
            case GamePhase.SETUP:
                return <WASetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
            
            case GamePhase.GAMEPLAY:
                let currentExplainer = '';
                if(settings.playStyle === 'teams') {
                    currentExplainer = gameState.currentTeam === 'A' 
                    ? teamA[gameState.teamAPlayerIndex] 
                    : teamB[gameState.teamBPlayerIndex];
                } else {
                    currentExplainer = players[gameState.currentPlayerIndex];
                }

                return (
                    <WAGameplayScreen
                        settings={settings}
                        gameState={gameState}
                        explainer={currentExplainer || ''}
                        players={players}
                        cards={cards}
                        onTurnEnd={handleTurnEnd}
                        onShuffleCards={() => setCards(shuffleArray(cards))}
                        onExit={onExit}
                    />
                );

            case GamePhase.RESULTS:
                let winner = "Unentschieden";
                if (settings.playStyle === 'teams') {
                    if (gameState.teamAScore > gameState.teamBScore) winner = 'Team A';
                    if (gameState.teamBScore > gameState.teamAScore) winner = 'Team B';
                } else {
                    const scores = Object.values(gameState.playerScores);
                    const maxScore = Math.max(...scores);
                    const winners = Object.keys(gameState.playerScores).filter(name => gameState.playerScores[name] === maxScore);
                    winner = winners.join(' & ');
                }
                
                return (
                    <WAResultsScreen
                        winner={winner}
                        playStyle={settings.playStyle}
                        teamAScore={gameState.teamAScore}
                        teamBScore={gameState.teamBScore}
                        playerScores={gameState.playerScores}
                        onPlayAgain={handlePlayAgain}
                        onExit={onExit}
                    />
                );

            default:
                return <div>Error</div>;
        }
    };

    return <>{renderGame()}</>;
};

export default WortakrobatenGame;
