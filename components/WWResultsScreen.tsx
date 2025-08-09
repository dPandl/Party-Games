import React from 'react';
import { WWPlayer } from '../types';

interface WWResultsScreenProps {
  winner: string;
  players: WWPlayer[];
  onPlayAgain: () => void;
  onExit: () => void;
}

const getWinnerText = (winner: string) => {
    switch (winner) {
        case 'Werwölfe': return 'Die Werwölfe gewinnen!';
        case 'Dorfbewohner': return 'Die Dorfbewohner gewinnen!';
        case 'Liebende': return 'Das Liebespaar gewinnt!';
        default: return 'Spiel beendet!';
    }
}

const getWinnerColor = (winner: string) => {
    switch (winner) {
        case 'Werwölfe': return 'text-red-400';
        case 'Dorfbewohner': return 'text-blue-400';
        case 'Liebende': return 'text-pink-400';
        default: return 'text-white';
    }
}

const getRoleColor = (role: string) => {
    switch (role) {
        case 'Werwolf': return 'text-red-400';
        case 'Seherin': return 'text-purple-400';
        case 'Hexe': return 'text-green-400';
        case 'Amor': return 'text-pink-400';
        case 'Jäger': return 'text-orange-400';
        default: return 'text-blue-400';
    }
};

const WWResultsScreen: React.FC<WWResultsScreenProps> = ({ winner, players, onPlayAgain, onExit }) => {
    
  return (
    <div className="flex flex-col items-center h-full bg-gray-900 p-4 sm:p-8 text-center overflow-y-auto">
      <div className="my-auto flex flex-col items-center justify-center">
        <h1 className={`text-4xl md:text-5xl font-black ${getWinnerColor(winner)}`}>
          {getWinnerText(winner)}
        </h1>
        
        <div className="my-8 w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Rollen-Übersicht</h2>
          <ul className="space-y-3 text-left">
            {players.map(player => (
              <li key={player.id} className="flex justify-between items-center text-lg">
                <span className="text-gray-300 flex items-center">
                  {player.name}
                  {player.isLover && <span className="ml-2 text-pink-400">♥</span>}
                </span>
                <span className={`font-bold ${getRoleColor(player.role)}`}>{player.role}</span>
              </li>
            ))}
          </ul>
        </div>
  
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-indigo-600 to-red-700 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105"
          >
            Nochmal spielen
          </button>
          <button
            onClick={onExit}
            className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600"
          >
            Zurück zum Hauptmenü
          </button>
        </div>
      </div>
    </div>
  );
};

export default WWResultsScreen;