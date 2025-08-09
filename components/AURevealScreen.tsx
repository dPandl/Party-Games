import React, { useState } from 'react';
import { Player } from '../types';
import AURevealCard from './AURevealCard';

interface AURevealScreenProps {
  player: Player;
  location: string;
  onContinue: () => void;
  isLastPlayer: boolean;
}

const AURevealScreen: React.FC<AURevealScreenProps> = ({ player, location, onContinue, isLastPlayer }) => {
  const [hasRevealed, setHasRevealed] = useState(false);
  const isSpy = player.role === 'Impostor';
  
  return (
    <div className="flex flex-col items-center justify-between h-full bg-gray-900 p-4 text-center">
      <div className="text-2xl font-bold mt-8">
        Du bist dran, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">{player.name}</span>!
      </div>
      
      <AURevealCard 
        content={isSpy ? "Du bist der Spion!" : location}
        isSpy={isSpy}
        onRevealed={() => setHasRevealed(true)}
      />
      
      <div className="h-20 mb-8">
        {hasRevealed && (
          <button
            onClick={onContinue}
            className="bg-purple-600 text-white font-bold py-4 px-8 rounded-lg text-xl hover:bg-purple-500 transition-colors duration-300 shadow-lg shadow-purple-500/20 animate-fade-in"
          >
            {isLastPlayer ? 'Zur Besprechung' : 'Weitergeben'}
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

export default AURevealScreen;
