
import React from 'react';
import { Player } from '../types';

interface ResultsScreenProps {
  players: Player[];
  votes: number[];
  onPlayAgain: () => void;
  withVoting: boolean;
  secretWord: string;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ players, votes, onPlayAgain, withVoting, secretWord }) => {
  const impostors = players.filter(p => p.role === 'Impostor');

  // Wenn ohne Abstimmung gespielt wurde, nur die Impostor anzeigen.
  if (!withVoting) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4 text-center">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-5xl font-black text-blue-400">Spiel beendet</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">Der geheime Begriff war:</h2>
            <p className="text-4xl font-black text-blue-300 tracking-wide">{secretWord}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">Die Impostor waren:</h2>
            {impostors.length > 0 ? (
                impostors.map(impostor => (
                    <p key={impostor.id} className="text-xl text-red-300 font-bold">{impostor.name}</p>
                ))
            ) : (
                <p className="text-xl text-gray-400">Es gab keine Impostor in dieser Runde.</p>
            )}
          </div>
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-4 rounded-lg text-xl transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:scale-105 hover:shadow-blue-400/40"
          >
            Neues Spiel
          </button>
        </div>
      </div>
    );
  }

  // Original-Logik für den Modus mit Abstimmung
  const maxVotes = Math.max(...votes);
  const mostVotedPlayers = players.filter((_, index) => votes[index] === maxVotes && maxVotes > 0);

  const impostorsWereCaught = mostVotedPlayers.some(votedPlayer => impostors.some(impostor => impostor.id === votedPlayer.id));
  const crewWon = impostors.length > 0 && impostorsWereCaught;
  const impostorsWon = !crewWon;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4 text-center">
        <div className="w-full max-w-md mx-auto">
            {crewWon ? (
                <h1 className="text-5xl font-black text-green-400">Crew Gewinnt!</h1>
            ) : (
                <h1 className="text-5xl font-black text-red-400">Impostor Gewinnen!</h1>
            )}
            
            <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
                <h2 className="text-2xl font-bold text-white">Der geheime Begriff war:</h2>
                <p className="text-4xl font-black text-blue-300 tracking-wide">{secretWord}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
                <h2 className="text-2xl font-bold text-white">Die Impostor waren:</h2>
                {impostors.map(impostor => (
                    <p key={impostor.id} className="text-xl text-red-300 font-bold">{impostor.name}</p>
                ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
                <h2 className="text-2xl font-bold text-white">Abstimmungsergebnis</h2>
                {players.map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center text-lg">
                        <span className="text-gray-300">{player.name}</span>
                        <span className="font-bold text-white">{votes[index]} Stimme(n)</span>
                    </div>
                ))}
            </div>
            
            <button
                onClick={onPlayAgain}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-4 rounded-lg text-xl transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:scale-105 hover:shadow-blue-400/40"
            >
                Neues Spiel
            </button>
        </div>
    </div>
  );
};

export default ResultsScreen;
