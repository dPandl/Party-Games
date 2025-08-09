import React, { useState, useCallback } from 'react';
import { WWPlayer, WerwolfRole } from '../types';
import WWSetupScreen, { WWRoleSelection } from '../components/WWSetupScreen';
import TransitionScreen from '../components/TransitionScreen';
import WWRoleRevealScreen from '../components/WWRoleRevealScreen';
import WWGameplayScreen from '../components/WWGameplayScreen';
import WWResultsScreen from '../components/WWResultsScreen';

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
    return array.map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
};

// --- Interfaces & Enums ---
interface WerwoelfeGameProps {
    onExit: () => void;
}

interface WWLastSettings {
    playerNames: string[];
    roles: WWRoleSelection;
}

enum WW_Game_Phase {
  SETUP,
  ROLE_REVEAL_TRANSITION,
  ROLE_REVEAL,
  GAMEPLAY,
  GAME_OVER,
}

// --- Component ---
const WerwoelfeGame: React.FC<WerwoelfeGameProps> = ({ onExit }) => {
    const [phase, setPhase] = useState<WW_Game_Phase>(WW_Game_Phase.SETUP);
    const [players, setPlayers] = useState<WWPlayer[]>([]);
    const [lastSettings, setLastSettings] = useState<WWLastSettings | null>(null);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);

    const handleStartGame = useCallback((playerNames: string[], roles: WWRoleSelection) => {
        setLastSettings({ playerNames, roles });

        const playerCount = playerNames.length;
        const werewolfCount = Math.max(1, Math.floor(playerCount / 4));
        
        const rolePool: WerwolfRole[] = [];
        for (let i = 0; i < werewolfCount; i++) rolePool.push('Werwolf');
        if (roles.seer) rolePool.push('Seherin');
        if (roles.witch) rolePool.push('Hexe');
        if (roles.hunter) rolePool.push('Jäger');
        if (roles.cupid) rolePool.push('Amor');
        
        while (rolePool.length < playerCount) {
            rolePool.push('Dorfbewohner');
        }

        const shuffledRoles = shuffleArray(rolePool);

        const newPlayers: WWPlayer[] = playerNames.map((name, index) => ({
            id: index,
            name,
            role: shuffledRoles[index],
            isAlive: true,
            isLover: false,
        }));
        
        setPlayers(shuffleArray(newPlayers)); // Shuffle player order for reveal
        setCurrentPlayerIndex(0);
        setPhase(WW_Game_Phase.ROLE_REVEAL_TRANSITION);
    }, []);

    const handleNextReveal = () => {
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(i => i + 1);
            setPhase(WW_Game_Phase.ROLE_REVEAL_TRANSITION);
        } else {
            // Sort players by ID for a stable order in gameplay
            setPlayers(current => [...current].sort((a, b) => a.id - b.id));
            setPhase(WW_Game_Phase.GAMEPLAY);
        }
    };

    const handleEndGame = (winningFaction: string) => {
        setWinner(winningFaction);
        setPhase(WW_Game_Phase.GAME_OVER);
    };

    const handlePlayAgain = () => {
        setWinner(null);
        setPhase(WW_Game_Phase.SETUP);
    };

    const renderGame = () => {
        switch (phase) {
            case WW_Game_Phase.SETUP:
                return <WWSetupScreen onStartGame={handleStartGame} onExit={onExit} lastSettings={lastSettings} />;
            
            case WW_Game_Phase.ROLE_REVEAL_TRANSITION:
                return <TransitionScreen 
                            nextPlayerName={players[currentPlayerIndex].name} 
                            onReady={() => setPhase(WW_Game_Phase.ROLE_REVEAL)} 
                            headerGradient="bg-gradient-to-r from-indigo-400 to-red-500"
                            buttonGradient="bg-gradient-to-r from-indigo-600 to-red-700"
                            buttonShadow="shadow-indigo-500/30"
                       />;

            case WW_Game_Phase.ROLE_REVEAL:
                return <WWRoleRevealScreen 
                            player={players[currentPlayerIndex]} 
                            onContinue={handleNextReveal}
                            isLastPlayer={currentPlayerIndex === players.length - 1}
                        />;
            
            case WW_Game_Phase.GAMEPLAY:
                return <WWGameplayScreen 
                            initialPlayers={players} 
                            onEndGame={handleEndGame}
                            onExit={onExit}
                        />;

            case WW_Game_Phase.GAME_OVER:
                return winner ? <WWResultsScreen 
                                    winner={winner} 
                                    players={players} 
                                    onPlayAgain={handlePlayAgain}
                                    onExit={onExit}
                                /> : null;

            default:
                return <div>Error</div>;
        }
    };

    return <>{renderGame()}</>;
};

export default WerwoelfeGame;