import React from 'react';
import { Player, Dilemma } from '../types';

interface MKAnswerScreenProps {
  player: Player;
  dilemma: Dilemma;
  onAnswer: (answer: string) => void;
}

const MKAnswerScreen: React.FC<MKAnswerScreenProps> = ({ player, dilemma, onAnswer }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
      <h1 className="text-2xl font-bold mb-8">
        Deine Entscheidung, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-slate-400">{player.name}</span>
      </h1>
      
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-2xl mb-12">
        <p className="text-2xl text-white leading-relaxed">{dilemma.text}</p>
      </div>

      <p className="text-lg text-gray-400 mb-6">Wie lautet deine Antwort?</p>
      <div className="flex flex-col space-y-4 w-full max-w-md">
        <button
          onClick={() => onAnswer(dilemma.optionA)}
          className="w-full min-h-[6rem] bg-green-600 text-white font-black text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105 p-4 flex items-center justify-center"
        >
          {dilemma.optionA}
        </button>
        <button
          onClick={() => onAnswer(dilemma.optionB)}
          className="w-full min-h-[6rem] bg-red-600 text-white font-black text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105 p-4 flex items-center justify-center"
        >
          {dilemma.optionB}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-12">Niemand sieht deine Antwort.</p>
    </div>
  );
};

export default MKAnswerScreen;
