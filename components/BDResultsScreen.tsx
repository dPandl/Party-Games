import React from 'react';

interface BDResultsScreenProps {
  outcome: 'defused' | 'exploded';
  onPlayAgain: () => void;
}

const BDResultsScreen: React.FC<BDResultsScreenProps> = ({ outcome, onPlayAgain }) => {
  const isDefused = outcome === 'defused';

  const buttonClasses = isDefused
    ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg shadow-blue-500/30'
    : 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-500/30';

  return (
    <div className={`flex flex-col items-center justify-center h-full text-center p-4 ${isDefused ? 'bg-slate-900' : 'bg-black'}`}>
        <div className="transform scale-150 animate-pulse">
            {isDefused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )}
        </div>
        
        <h1 className={`text-6xl font-black mt-8 mb-12 animate-fade-in ${isDefused ? 'text-blue-300' : 'text-red-400'}`}>
            {isDefused ? 'BOMBE ENTSCHÄRFT!' : 'EXPLOSION!'}
        </h1>

        <button 
          onClick={onPlayAgain}
          className={`${buttonClasses} font-bold py-4 px-12 rounded-lg text-2xl transition-transform transform hover:scale-105`}
        >
          Nochmal spielen
        </button>

        <style>{`
            @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default BDResultsScreen;
