import React, { useState, useCallback, useEffect } from 'react';
import { Player, CustomDilemmaSet, Dilemma } from '../types';
import MKSetupScreen from '../components/MKSetupScreen';
import TransitionScreen from '../components/TransitionScreen';
import MKDilemmaScreen from '../components/MKDilemmaScreen';
import MKAnswerScreen from '../components/MKAnswerScreen';
import MKResultsScreen from '../components/MKResultsScreen';
import { MORAL_DILEMMAS_SETS } from './moralischerKompassData';

enum MKGameState {
  SETUP,
  DILEMMA,
  TRANSITION,
  ANSWERING,
  RESULTS,
}

interface MKGameProps {
  onExit: () => void;
}

interface MKSettings {
  playerNames: string[];
  selectedSets: string[];
}

export interface Answer {
  playerId: number;
  answer: string;
}

const MoralischerKompassGame: React.FC<MKGameProps> = ({ onExit }) => {
  const [gameState, setGameState] = useState<MKGameState>(MKGameState.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [dilemma, setDilemma] = useState<Dilemma | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [lastGameSettings, setLastGameSettings] = useState<MKSettings | null>(null);
  const [usedDilemmas, setUsedDilemmas] = useState<string[]>([]);
  const [allDilemmas, setAllDilemmas] = useState<Dilemma[]>([]);

  const pickNewDilemma = useCallback(() => {
    let possibleDilemmas = allDilemmas.filter(d => !usedDilemmas.includes(d.id));
    if (possibleDilemmas.length === 0 && allDilemmas.length > 0) {
      possibleDilemmas = allDilemmas; // Reset used list if all have been seen
      setUsedDilemmas([]);
    }
    
    if (possibleDilemmas.length > 0) {
      const newDilemma = possibleDilemmas[Math.floor(Math.random() * possibleDilemmas.length)];
      setDilemma(newDilemma);
      setUsedDilemmas(prev => [...prev, newDilemma.id]);
    } else {
      setDilemma({ id: 'fallback', text: "Keine Dilemmas gefunden. Bitte erstelle ein Set oder wähle ein Standard-Set aus.", optionA: 'OK', optionB: 'OK'});
    }
  }, [allDilemmas, usedDilemmas]);

  useEffect(() => {
    // Pick the first dilemma when the game starts or when allDilemmas is first set.
    if (gameState === MKGameState.DILEMMA && allDilemmas.length > 0 && dilemma === null) {
      pickNewDilemma();
    }
  }, [gameState, allDilemmas, dilemma, pickNewDilemma]);

  const handleStartGame = useCallback((
    playerNames: string[],
    selectedSets: string[],
    customDilemmaSets: CustomDilemmaSet[]
  ) => {
    setLastGameSettings({ playerNames, selectedSets });

    const newPlayers: Player[] = playerNames.map((name, index) => ({
      id: index,
      name,
      role: 'Player',
    }));
    
    let dilemmasForGame: Dilemma[] = [];
    const allAvailableSets = [...MORAL_DILEMMAS_SETS, ...customDilemmaSets];

    selectedSets.forEach(setName => {
        const set = allAvailableSets.find(s => s.name === setName);
        if (set) {
            dilemmasForGame.push(...set.dilemmas);
        }
    });
    
    if (dilemmasForGame.length === 0) { // Fallback
        dilemmasForGame.push(...MORAL_DILEMMAS_SETS[0].dilemmas);
    }
    
    setPlayers(newPlayers);
    setAllDilemmas(dilemmasForGame);
    setUsedDilemmas([]);
    setDilemma(null); // Reset dilemma to trigger useEffect for new pick
    setAnswers([]);
    setCurrentPlayerIndex(0);
    setGameState(MKGameState.DILEMMA);
  }, []);

  const handleStartVoting = () => {
    setGameState(MKGameState.TRANSITION);
  };

  const handleReadyForAnswer = () => {
    setGameState(MKGameState.ANSWERING);
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => [...prev, { playerId: players[currentPlayerIndex].id, answer }]);
    
    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex < players.length) {
      setCurrentPlayerIndex(nextIndex);
      setGameState(MKGameState.TRANSITION);
    } else {
      setGameState(MKGameState.RESULTS);
    }
  };

  const handlePlayAgain = () => {
    pickNewDilemma();
    setAnswers([]);
    setCurrentPlayerIndex(0);
    setGameState(MKGameState.DILEMMA);
  };

  const handleEndGame = () => {
    setGameState(MKGameState.SETUP);
  };

  const renderGameState = () => {
    switch (gameState) {
      case MKGameState.SETUP:
        return <MKSetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
      
      case MKGameState.DILEMMA:
        return <MKDilemmaScreen dilemma={dilemma} onStartVoting={handleStartVoting} onNextDilemma={pickNewDilemma} />;
      
      case MKGameState.TRANSITION:
        return <TransitionScreen 
          nextPlayerName={players[currentPlayerIndex].name} 
          onReady={handleReadyForAnswer} 
        />;
      
      case MKGameState.ANSWERING:
        return dilemma && <MKAnswerScreen 
          player={players[currentPlayerIndex]} 
          dilemma={dilemma} 
          onAnswer={handleAnswer} 
        />;
      
      case MKGameState.RESULTS:
        return dilemma && <MKResultsScreen 
          dilemma={dilemma} 
          answers={answers} 
          players={players}
          onPlayAgain={handlePlayAgain}
          onEndGame={handleEndGame}
        />;

      default:
        return <MKSetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
    }
  };

  return <>{renderGameState()}</>;
};

export default MoralischerKompassGame;
