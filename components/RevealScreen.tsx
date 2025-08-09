
import React, { useState } from 'react';
import { Player } from '../types';
import RevealCard from './RevealCard';

interface RevealScreenProps {
  player: Player;
  secretWord: string;
  onContinue: () => void;
  isLastPlayer: boolean;
  impostorHintEnabled: boolean;
  theme: string;
}

const RevealScreen: React.FC<RevealScreenProps> = ({ player, secretWord, onContinue, isLastPlayer, impostorHintEnabled, theme }) => {
  const [hasRevealed, setHasRevealed] = useState(false);
  const isImpostor = player.role === 'Impostor';
  
  return (
    <div className="flex flex-col items-center justify-between h-full bg-gray-900 p-4 text-center">
      <div className="text-2xl font-bold mt-8">
        Du bist dran, <span className="text-blue-400">{player.name}</span>!
      </div>
      
      <RevealCard 
        content={isImpostor ? "Impostor" : secretWord}
        isImpostor={isImpostor}
        onRevealed={() => setHasRevealed(true)}
        impostorHintEnabled={impostorHintEnabled}
        theme={theme}
      />
      
      <div className="h-20 mb-8">
        {hasRevealed && (
          <button
            onClick={onContinue}
            className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl hover:bg-blue-500 transition-colors duration-300 shadow-lg shadow-blue-500/20 animate-fade-in"
          >
            {isLastPlayer ? 'Zur Diskussion' : 'Weitergeben'}
          </button>
        )}
      </div>
    </div>
  );
};

// Add fade-in animation for the button
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default RevealScreen;
