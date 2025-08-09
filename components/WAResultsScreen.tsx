import React from 'react';
import { WAPlayStyle } from '../types';

interface WAResultsScreenProps {
  winner: string;
  playStyle: WAPlayStyle;
  teamAScore: number;
  teamBScore: number;
  playerScores: { [key: string]: number };
  onPlayAgain: () => void;
  onExit: () => void;
}

const WAResultsScreen: React.FC<WAResultsScreenProps> = ({ winner, playStyle, teamAScore, teamBScore, playerScores, onPlayAgain, onExit }) => {
  
  const sortedPlayers = playStyle === 'freeForAll'
    ? Object.entries(playerScores).sort(([, a], [, b]) => b - a)
    : [];
    
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center overflow-y-auto">
      <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-lime-400 to-green-500">
        {winner} {winner.includes('&') || winner === 'Unentschieden' ? 'haben gewonnen!' : 'hat gewonnen!'}
      </h1>
      
      <div className="my-12 w-full max-w-sm text-2xl font-bold text-white bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-3xl font-bold mb-4">Endstand</h2>
        {playStyle === 'teams' ? (
          <div className="space-y-2">
            <p>Team A: <span className="text-lime-300">{teamAScore}</span></p>
            <p>Team B: <span className="text-lime-300">{teamBScore}</span></p>
          </div>
        ) : (
          <ul className="space-y-3 text-left">
            {sortedPlayers.map(([name, score], index) => (
              <li key={name} className="flex justify-between items-center">
                <span>{index + 1}. {name}</span>
                <span className="text-lime-300">{score}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <button
          onClick={onPlayAgain}
          className="w-full bg-gradient-to-r from-lime-500 to-green-600 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg shadow-lime-500/30 transform hover:scale-105"
        >
          Nochmal spielen
        </button>
        <button
          onClick={onExit}
          className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
        >
          Zurück zum Menü
        </button>
      </div>
    </div>
  );
};

export default WAResultsScreen;