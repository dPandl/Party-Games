import React from 'react';
import { Player, Dilemma } from '../types';
import { Answer } from '../games/MoralischerKompassGame';

interface MKResultsScreenProps {
  dilemma: Dilemma;
  answers: Answer[];
  players: Player[];
  onPlayAgain: () => void;
  onEndGame: () => void;
}

const MKResultsScreen: React.FC<MKResultsScreenProps> = ({ dilemma, answers, players, onPlayAgain, onEndGame }) => {
  const optionAVotes = answers.filter(a => a.answer === dilemma.optionA).length;
  const optionBVotes = answers.filter(a => a.answer === dilemma.optionB).length;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
      <h1 className="text-4xl font-black text-indigo-400 mb-4">Das Ergebnis</h1>
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-2xl mb-8">
        <p className="text-xl text-gray-400">Das Dilemma war:</p>
        <p className="text-2xl font-semibold text-white mt-2 leading-relaxed">{dilemma.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8 my-8 w-full max-w-2xl">
        <div className="text-center bg-gray-700/50 p-4 rounded-lg border-2 border-green-600/50">
            <p className="text-6xl md:text-8xl font-black text-green-400">{optionAVotes}</p>
            <p className="text-lg md:text-xl font-bold text-green-300 mt-2 break-words">{dilemma.optionA}</p>
        </div>
        <div className="text-center bg-gray-700/50 p-4 rounded-lg border-2 border-red-600/50">
            <p className="text-6xl md:text-8xl font-black text-red-400">{optionBVotes}</p>
            <p className="text-lg md:text-xl font-bold text-red-300 mt-2 break-words">{dilemma.optionB}</p>
        </div>
      </div>

      <div className="bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-xl p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white">Diskussion!</h2>
        <p className="text-lg text-gray-300 mt-2">Wer hat für was gestimmt und warum? Findet es heraus!</p>
      </div>

      <div className="flex space-x-4 mt-12">
        <button 
          onClick={onEndGame}
          className="bg-gray-700 text-gray-300 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-600 transition-colors"
        >
          Spiel beenden
        </button>
        <button 
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-indigo-500 to-slate-600 text-white font-bold py-3 px-10 rounded-lg text-lg transition-all duration-300 shadow-lg shadow-indigo-500/30 transform hover:scale-105"
        >
          Nächste Runde
        </button>
      </div>
    </div>
  );
};

export default MKResultsScreen;
