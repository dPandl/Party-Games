import React from 'react';

interface TransitionScreenProps {
  nextPlayerName: string;
  onReady: () => void;
  headerGradient?: string;
  buttonGradient?: string;
  buttonShadow?: string;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ 
  nextPlayerName, 
  onReady,
  headerGradient = 'bg-gradient-to-r from-teal-400 to-blue-500',
  buttonGradient = 'bg-gradient-to-r from-teal-500 to-blue-600',
  buttonShadow = 'shadow-blue-500/30'
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
        <div className="space-y-4">
            <p className="text-2xl text-gray-400">Gib das Handy weiter an</p>
            <h1 className={`text-6xl font-black bg-clip-text text-transparent ${headerGradient}`}>{nextPlayerName}</h1>
        </div>
        <button 
            onClick={onReady}
            className={`mt-12 text-white font-bold py-4 px-10 rounded-lg text-2xl transition-all duration-300 shadow-lg transform hover:scale-105 ${buttonGradient} ${buttonShadow}`}
        >
            Ich bin bereit!
        </button>
    </div>
  );
};

export default TransitionScreen;