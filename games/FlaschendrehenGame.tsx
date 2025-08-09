import React, { useState, useCallback } from 'react';
import FlaschendrehenSetupScreen from '../components/FlaschendrehenSetupScreen';
import FlaschendrehenSpinScreen from '../components/FlaschendrehenSpinScreen';
import { CustomTruthOrDareSet } from '../types';
import { TRUTH_OR_DARE_SETS } from './flaschendrehenData';


interface FlaschendrehenGameProps {
    onExit: () => void;
}

enum GamePhase {
    SETUP,
    GAMEPLAY,
}

interface FDSettings {
    playerNames: string[];
    categories: string[];
}

const FlaschendrehenGame: React.FC<FlaschendrehenGameProps> = ({ onExit }) => {
    const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
    const [players, setPlayers] = useState<string[]>([]);
    const [taskData, setTaskData] = useState<CustomTruthOrDareSet[]>([]);
    const [lastGameSettings, setLastGameSettings] = useState<FDSettings | null>(null);

    const handleStartGame = useCallback((
        playerNames: string[], 
        selectedCategories: string[],
        customTaskSets: CustomTruthOrDareSet[]
    ) => {
        setLastGameSettings({ playerNames, categories: selectedCategories });
        setPlayers(playerNames);
        
        const fullTaskData: CustomTruthOrDareSet[] = [];
        const allAvailableSets: CustomTruthOrDareSet[] = [...TRUTH_OR_DARE_SETS, ...customTaskSets];

        selectedCategories.forEach(categoryName => {
            const set = allAvailableSets.find(s => s.name === categoryName);
            if (set) {
                fullTaskData.push(set);
            }
        });

        if (fullTaskData.length === 0) {
            console.warn("No task data could be loaded, falling back to all defaults.");
            fullTaskData.push(...TRUTH_OR_DARE_SETS);
        }

        setTaskData(fullTaskData);
        setPhase(GamePhase.GAMEPLAY);
    }, []);

    const handleEndGame = () => {
        setPlayers([]);
        setTaskData([]);
        setPhase(GamePhase.SETUP);
    };

    switch (phase) {
        case GamePhase.SETUP:
            return <FlaschendrehenSetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
        case GamePhase.GAMEPLAY:
            return <FlaschendrehenSpinScreen players={players} taskData={taskData} onEndGame={handleEndGame} />;
        default:
            return <FlaschendrehenSetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
    }
};

export default FlaschendrehenGame;
