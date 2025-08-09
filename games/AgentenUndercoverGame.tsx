import React, { useState, useCallback } from 'react';
import { GameState, Player, CustomLocationSet } from '../types';
import { DEFAULT_DISCUSSION_TIME_SECONDS } from '../constants';
import { AGENTEN_LOCATION_SETS } from './agentenUndercoverData';

import AUSetupScreen from '../components/AUSetupScreen';
import Spinner from '../Spinner';
import TransitionScreen from '../components/TransitionScreen';
import AURevealScreen from '../components/AURevealScreen';
import AUDiscussionScreen from '../components/AUDiscussionScreen';
import AUVotingScreen from '../components/AUVotingScreen';
import AUResultsScreen from '../components/AUResultsScreen';

interface AgentenUndercoverGameProps {
    onExit: () => void;
}

interface AUSettings {
    playerNames: string[];
    selectedSets: string[];
}

export type GameOutcome = 'spy_won_guess' | 'agents_won_guess_wrong' | 'agents_won_voted_out' | 'spy_won_not_caught' | null;

const AgentenUndercoverGame: React.FC<AgentenUndercoverGameProps> = ({ onExit }) => {
    const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
    const [players, setPlayers] = useState<Player[]>([]);
    const [location, setLocation] = useState<string>('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [votes, setVotes] = useState<number[]>([]);
    const [gameOutcome, setGameOutcome] = useState<GameOutcome>(null);
    const [lastGameSettings, setLastGameSettings] = useState<AUSettings | null>(null);
    
    const discussionTime = DEFAULT_DISCUSSION_TIME_SECONDS;

    const handleStartGame = useCallback((
        playerNames: string[],
        selectedSets: string[],
        customLocationSets: CustomLocationSet[]
    ) => {
        setLastGameSettings({ playerNames, selectedSets });

        let allLocations: string[] = [];
        const allAvailableSets: CustomLocationSet[] = [...AGENTEN_LOCATION_SETS, ...customLocationSets];

        selectedSets.forEach(setName => {
            const set = allAvailableSets.find(s => s.name === setName);
            if (set) {
                allLocations.push(...set.locations);
            }
        });
        
        if (allLocations.length === 0) {
            // Fallback to default if no set is selected somehow
            allLocations.push(...AGENTEN_LOCATION_SETS[0].locations);
             console.warn("No location sets selected, falling back to default locations.");
        }
        
        const fetchedLocation = allLocations[Math.floor(Math.random() * allLocations.length)];
        
        const numPlayers = playerNames.length;
        const spyIndex = Math.floor(Math.random() * numPlayers);
        
        const newPlayers: Player[] = playerNames.map((name, index) => ({
            id: index,
            name,
            role: index === spyIndex ? 'Impostor' : 'Player', // 'Impostor' is the Spy, 'Player' is an Agent
        }));

        setPlayers(newPlayers);
        setLocation(fetchedLocation);
        setCurrentPlayerIndex(0);
        setGameOutcome(null);
        setVotes([]);
        setGameState(GameState.TRANSITION);
    }, []);

    const handleNextPlayer = () => {
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex < players.length) {
        setCurrentPlayerIndex(nextIndex);
        setGameState(GameState.TRANSITION);
      } else {
        setGameState(GameState.DISCUSSION);
      }
    };

    const handleSpyGuessResult = (wasCorrect: boolean) => {
        const outcome = wasCorrect ? 'spy_won_guess' : 'agents_won_guess_wrong';
        setGameOutcome(outcome);
        setGameState(GameState.RESULTS);
    };

    const handleFinishVoting = (finalVotes: number[]) => {
        setVotes(finalVotes);
        const maxVotes = Math.max(...finalVotes);
        const mostVotedPlayerIndex = finalVotes.indexOf(maxVotes);
        
        if (mostVotedPlayerIndex !== -1 && players[mostVotedPlayerIndex]?.role === 'Impostor') {
            setGameOutcome('agents_won_voted_out');
        } else {
            setGameOutcome('spy_won_not_caught');
        }
        setGameState(GameState.RESULTS);
    };

    const handleEndDiscussion = () => {
        setGameState(GameState.VOTING);
    };

    const handlePlayAgain = () => {
        setGameState(GameState.SETUP);
    };

    const renderGameState = () => {
        const spy = players.find(p => p.role === 'Impostor');

        switch (gameState) {
            case GameState.SETUP:
                return <AUSetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
            case GameState.TRANSITION:
                return <TransitionScreen 
                    nextPlayerName={players[currentPlayerIndex].name}
                    onReady={() => setGameState(GameState.REVEAL)}
                />;
            case GameState.REVEAL:
                return <AURevealScreen 
                    player={players[currentPlayerIndex]}
                    location={location}
                    onContinue={handleNextPlayer}
                    isLastPlayer={currentPlayerIndex === players.length - 1}
                />;
            case GameState.DISCUSSION:
                return <AUDiscussionScreen 
                    discussionTime={discussionTime} 
                    onEndDiscussion={handleEndDiscussion}
                    onSpyGuessResult={handleSpyGuessResult}
                    players={players}
                />;
            case GameState.VOTING:
                return <AUVotingScreen players={players} onFinishVoting={handleFinishVoting} />;
            case GameState.RESULTS:
                return <AUResultsScreen 
                    outcome={gameOutcome}
                    spy={spy}
                    location={location}
                    votes={votes}
                    players={players}
                    onPlayAgain={handlePlayAgain}
                />;
            default:
                return <AUSetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
        }
    };

    return <>{renderGameState()}</>;
};

export default AgentenUndercoverGame;
