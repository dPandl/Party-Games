import React, { useState, useCallback } from 'react';
import { KRIMI_KLUB_SETS } from './krimiKlubData';
import KKSetupScreen from '../components/KKSetupScreen';
import KKGameplayScreen from '../components/KKGameplayScreen';
import { BlackStory, CustomBlackStorySet } from '../types';

enum KKGamePhase {
  SETUP,
  GAMEPLAY,
}

// Hilfsfunktion zum Mischen eines Arrays
const shuffleArray = <T,>(array: T[]): T[] => {
    return array.map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
};

interface KrimiKlubGameProps {
    onExit: () => void;
}

interface KKSettings {
  selectedSets: string[];
}

const KrimiKlubGame: React.FC<KrimiKlubGameProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<KKGamePhase>(KKGamePhase.SETUP);
  const [stories, setStories] = useState<BlackStory[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [lastGameSettings, setLastGameSettings] = useState<KKSettings | null>(null);


  const handleStartGame = useCallback((
    selectedSets: string[],
    customStorySets: CustomBlackStorySet[]
  ) => {
    setLastGameSettings({ selectedSets });

    let storiesForGame: BlackStory[] = [];
    const allAvailableSets = [...KRIMI_KLUB_SETS, ...customStorySets];

    selectedSets.forEach(setName => {
        const set = allAvailableSets.find(s => s.name === setName);
        if (set) {
            storiesForGame.push(...set.stories);
        }
    });

    if (storiesForGame.length === 0) {
        storiesForGame.push(...KRIMI_KLUB_SETS[0].stories);
    }

    setStories(shuffleArray(storiesForGame));
    setCurrentStoryIndex(0);
    setPhase(KKGamePhase.GAMEPLAY);
  }, []);

  const handleNextStory = useCallback(() => {
    setCurrentStoryIndex(prev => {
        if (prev + 1 >= stories.length) {
            setStories(shuffleArray(stories)); // Re-shuffle when list is exhausted
            return 0;
        }
        return prev + 1;
    });
  }, [stories]);

  const handleEndGame = () => {
    setPhase(KKGamePhase.SETUP);
  };
  
  const currentStory = stories[currentStoryIndex];

  switch (phase) {
    case KKGamePhase.SETUP:
      return <KKSetupScreen onStartGame={handleStartGame} onExit={onExit} initialSettings={lastGameSettings} />;
    case KKGamePhase.GAMEPLAY:
      return currentStory ? (
        <KKGameplayScreen 
            story={currentStory} 
            onNextStory={handleNextStory} 
            onEndGame={handleEndGame} 
        />
      ) : (
        <div className="flex items-center justify-center h-full text-center text-gray-400 p-4">
            <p>Keine Fälle gefunden. Bitte gehe zurück zum Setup und wähle mindestens ein Set aus.</p>
        </div>
      );
    default:
        return <KKSetupScreen onStartGame={() => {}} onExit={onExit} />;
  }
};

export default KrimiKlubGame;
