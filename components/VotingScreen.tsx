
import React, { useState } from 'react';
import { Player } from '../types';

interface VotingScreenProps {
  players: Player[];
  onFinishVoting: (votes: number[]) => void;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ players, onFinishVoting }) => {
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
        <h1 className="text-4xl font-black text-red-400">Wer ist der Impostor?</h1>
        
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
                  : 'bg-gray-800 text-white hover:bg-red-500 hover:scale-105'
              }`}
            >
              {player.name}
              {votes[index] > 0 && <span className="ml-2 text-red-300">({votes[index]})</span>}
            </button>
          ))}
        </div>
        
        {allVotesIn && (
            <button
                onClick={() => onFinishVoting(votes)}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-lg text-xl hover:bg-red-500 transition-colors duration-300 shadow-lg shadow-red-500/20"
            >
                Ergebnisse anzeigen
            </button>
        )}
      </div>
    </div>
  );
};

export default VotingScreen;
