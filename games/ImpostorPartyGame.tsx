import React, { useState, useCallback } from 'react';
import { GameState, Player, GameSettings, CustomTheme } from '../types';
import { DEFAULT_DISCUSSION_TIME_SECONDS } from '../constants';
import { IMPOSTOR_THEMES } from './impostorPartyData';

import SetupScreen from '../components/SetupScreen';
import Spinner from '../Spinner';
import TransitionScreen from '../components/TransitionScreen';
import RevealScreen from '../components/RevealScreen';
import DiscussionScreen from '../components/DiscussionScreen';
import VotingScreen from '../components/VotingScreen';
import ResultsScreen from '../components/ResultsScreen';

interface ImpostorPartyGameProps {
    onExit: () => void;
}

const ImpostorPartyGame: React.FC<ImpostorPartyGameProps> = ({ onExit }) => {
    const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
    const [players, setPlayers] = useState<Player[]>([]);
    const [secretWord, setSecretWord] = useState<string>('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [votes, setVotes] = useState<number[]>([]);
    const [discussionTime, setDiscussionTime] = useState<number>(DEFAULT_DISCUSSION_TIME_SECONDS);
    const [withVoting, setWithVoting] = useState<boolean>(true);
    const [impostorHintEnabled, setImpostorHintEnabled] = useState<boolean>(false);
    const [selectedTheme, setSelectedTheme] = useState<string>('');
    const [lastGameSettings, setLastGameSettings] = useState<GameSettings | null>(null);


    const handleStartGame = useCallback((
        playerNames: string[],
        impostorCount: number,
        themes: string[],
        timeInSeconds: number,
        withVotingMode: boolean,
        giveHint: boolean,
        customThemes: CustomTheme[]
    ) => {
        setLastGameSettings({
            playerNames,
            impostorCount,
            themes,
            discussionTime: timeInSeconds,
            withVoting: withVotingMode,
            giveImpostorHint: giveHint,
        });

        setDiscussionTime(timeInSeconds);
        setWithVoting(withVotingMode);
        setImpostorHintEnabled(giveHint);
        
        const randomThemeName = themes[Math.floor(Math.random() * themes.length)];
        setSelectedTheme(randomThemeName);

        const customTheme = customThemes.find(ct => ct.name === randomThemeName);
        let word = '';

        if (customTheme && customTheme.words.length > 0) {
            const randomIndex = Math.floor(Math.random() * customTheme.words.length);
            let customWord = customTheme.words[randomIndex];
            // Capitalize the word to match Gemini's output style for consistency
            word = customWord.charAt(0).toUpperCase() + customWord.slice(1);
        } else {
            const themeData = IMPOSTOR_THEMES.find(t => t.name === randomThemeName);
            if (themeData && themeData.words.length > 0) {
                const randomIndex = Math.floor(Math.random() * themeData.words.length);
                word = themeData.words[randomIndex];
            } else {
                word = "Apfel"; 
                console.warn(`Theme "${randomThemeName}" not found in local data or has no words. Using fallback.`);
            }
        }

        const numPlayers = playerNames.length;
        const numImpostors = impostorCount;
        
        const shuffledIndexes = Array.from(Array(numPlayers).keys()).sort(() => Math.random() - 0.5);
        const impostorIndexes = new Set(shuffledIndexes.slice(0, numImpostors));
        
        const newPlayers: Player[] = playerNames.map((name, index) => ({
            id: index,
            name,
            role: impostorIndexes.has(index) ? 'Impostor' : 'Player',
        }));

        setPlayers(newPlayers);
        setSecretWord(word);
        setCurrentPlayerIndex(0);
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

    const handleFinishVoting = (finalVotes: number[]) => {
      setVotes(finalVotes);
      setGameState(GameState.RESULTS);
    };

    const handlePlayAgain = () => {
        setPlayers([]);
        setSecretWord('');
        setCurrentPlayerIndex(0);
        setVotes([]);
        setGameState(GameState.SETUP);
    };

    const handleEndDiscussion = () => {
        if (withVoting) {
            setGameState(GameState.VOTING);
        } else {
            setVotes([]);
            setGameState(GameState.RESULTS);
        }
    };

    const renderGameState = () => {
        switch (gameState) {
            case GameState.SETUP:
                return <SetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
            case GameState.TRANSITION:
                return <TransitionScreen 
                    nextPlayerName={players[currentPlayerIndex].name}
                    onReady={() => setGameState(GameState.REVEAL)}
                />;
            case GameState.REVEAL:
                return <RevealScreen 
                    player={players[currentPlayerIndex]}
                    secretWord={secretWord}
                    onContinue={handleNextPlayer}
                    isLastPlayer={currentPlayerIndex === players.length - 1}
                    impostorHintEnabled={impostorHintEnabled}
                    theme={selectedTheme}
                />;
            case GameState.DISCUSSION:
                return <DiscussionScreen 
                    discussionTime={discussionTime} 
                    onEndDiscussion={handleEndDiscussion}
                    withVoting={withVoting}
                />;
            case GameState.VOTING:
                return <VotingScreen players={players} onFinishVoting={handleFinishVoting} />;
            case GameState.RESULTS:
                return <ResultsScreen 
                    players={players} 
                    votes={votes} 
                    onPlayAgain={handlePlayAgain}
                    withVoting={withVoting}
                    secretWord={secretWord}
                />;
            default:
                return <SetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings}/>;
        }
    };

    return (
        <>{renderGameState()}</>
    );
};

export default ImpostorPartyGame;
