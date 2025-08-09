import React from 'react';
import { Player } from '../types';
import { GameOutcome } from '../games/AgentenUndercoverGame';

interface AUResultsScreenProps {
  outcome: GameOutcome;
  spy: Player | undefined;
  location: string;
  votes: number[];
  players: Player[];
  onPlayAgain: () => void;
}

const ResultsContent: React.FC<{ title: string; titleColor: string; children: React.ReactNode }> = ({ title, titleColor, children }) => (
    <>
        <h1 className={`text-5xl font-black ${titleColor}`}>{title}</h1>
        {children}
    </>
);

const AUResultsScreen: React.FC<AUResultsScreenProps> = ({ outcome, spy, location, votes, players, onPlayAgain }) => {

    const renderOutcome = () => {
        switch (outcome) {
            case 'spy_won_guess':
                return <ResultsContent title="Spion gewinnt!" titleColor="text-red-400">
                    <p className="text-xl text-gray-300 mt-4">Der Spion hat den Ort richtig erraten!</p>
                </ResultsContent>;
            case 'agents_won_guess_wrong':
                return <ResultsContent title="Agenten gewinnen!" titleColor="text-green-400">
                    <p className="text-xl text-gray-300 mt-4">Der Spion hat falsch geraten und seine Tarnung auffliegen lassen!</p>
                </ResultsContent>;
            case 'agents_won_voted_out':
                return <ResultsContent title="Agenten gewinnen!" titleColor="text-green-400">
                    <p className="text-xl text-gray-300 mt-4">Ihr habt den Spion erfolgreich entlarvt!</p>
                </ResultsContent>;
            case 'spy_won_not_caught':
                return <ResultsContent title="Spion gewinnt!" titleColor="text-red-400">
                    <p className="text-xl text-gray-300 mt-4">Der Spion konnte entkommen und wurde nicht enttarnt!</p>
                </ResultsContent>;
            default:
                return <ResultsContent title="Spiel beendet" titleColor="text-white">{null}</ResultsContent>;
        }
    };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4 text-center">
        <div className="w-full max-w-md mx-auto">
            
            {renderOutcome()}
            
            <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
                <h2 className="text-2xl font-bold text-white">Der geheime Ort war:</h2>
                <p className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-400 tracking-wide">{location}</p>
            </div>

            {spy && (
                <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
                    <h2 className="text-2xl font-bold text-white">Der Spion war:</h2>
                    <p className="text-xl text-red-300 font-bold">{spy.name}</p>
                </div>
            )}
            
            {votes.length > 0 && (
                 <div className="bg-gray-800 rounded-lg p-6 my-8 space-y-4">
                    <h2 className="text-2xl font-bold text-white">Abstimmungsergebnis</h2>
                    {players.map((player, index) => (
                        <div key={player.id} className="flex justify-between items-center text-lg">
                            <span className="text-gray-300">{player.name}</span>
                            <span className="font-bold text-white">{votes[index]} Stimme(n)</span>
                        </div>
                    ))}
                </div>
            )}
            
            <button
                onClick={onPlayAgain}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 rounded-lg text-xl transition-all duration-300 shadow-lg shadow-pink-500/30 transform hover:scale-105 hover:shadow-pink-400/40"
            >
                Neue Mission
            </button>
        </div>
    </div>
  );
};

export default AUResultsScreen;