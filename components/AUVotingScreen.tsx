import React, { useState } from 'react';
import { Player } from '../types';

interface AUVotingScreenProps {
  players: Player[];
  onFinishVoting: (votes: number[]) => void;
}

const AUVotingScreen: React.FC<AUVotingScreenProps> = ({ players, onFinishVoting }) => {
  const [votes, setVotes] = useState<number[]>(Array(players.length).fill(0));
  const [voterIndex, setVoterIndex] = useState(0);

  const handleVote = (playerIndex: number) => {
    const newVotes = [...votes];
    newVotes[playerIndex]++;
    setVotes(newVotes);
    setVoterIndex(voterIndex + 1);
  };

  const allVotesIn = voterIndex >= players.length;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Wer ist der Spion?</h1>
        
        {!allVotesIn ? (
            <p className="text-xl text-gray-300 mt-4">
                <span className="font-bold text-white">{players[voterIndex]?.name}</span>, gib deine Stimme ab!
            </p>
        ) : (
            <p className="text-xl text-gray-300 mt-4">Alle Stimmen sind abgegeben!</p>
        )}

        <div className="grid grid-cols-2 gap-4 my-8">
          {players.map((player, index) => (
            <button
              key={player.id}
              onClick={() => handleVote(index)}
              disabled={allVotesIn}
              className={`p-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                allVotesIn 
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gray-800 text-white hover:bg-purple-500 hover:scale-105'
              }`}
            >
              {player.name}
              {votes[index] > 0 && <span className="ml-2 text-pink-300">({votes[index]})</span>}
            </button>
          ))}
        </div>
        
        {allVotesIn && (
            <button
                onClick={() => onFinishVoting(votes)}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-lg text-xl hover:bg-purple-500 transition-colors duration-300 shadow-lg shadow-purple-500/20"
            >
                Ergebnisse anzeigen
            </button>
        )}
      </div>
    </div>
  );
};

export default AUVotingScreen;
