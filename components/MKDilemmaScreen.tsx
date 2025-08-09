import React from 'react';
import { Dilemma } from '../types';

interface MKDilemmaScreenProps {
  dilemma: Dilemma | null;
  onStartVoting: () => void;
  onNextDilemma: () => void;
}

const MKDilemmaScreen: React.FC<MKDilemmaScreenProps> = ({ dilemma, onStartVoting, onNextDilemma }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-400 mb-4">Das Dilemma der Runde</h1>
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-2xl border border-indigo-500/30 min-h-[15rem] flex items-center justify-center">
        <p className="text-3xl font-semibold text-white leading-relaxed">{dilemma?.text || '...'}</p>
      </div>
      <div className="flex items-center space-x-4 mt-12">
        <button
          onClick={onNextDilemma}
          className="bg-gray-700 text-gray-300 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-600 transition-colors"
        >
          Nächstes Dilemma
        </button>
        <button 
          onClick={onStartVoting}
          className="bg-gradient-to-r from-indigo-500 to-slate-600 text-white font-bold py-4 px-10 rounded-lg text-2xl transition-all duration-300 shadow-lg shadow-indigo-500/30 transform hover:scale-105"
        >
          Antworten starten
        </button>
      </div>
    </div>
  );
};

export default MKDilemmaScreen;
