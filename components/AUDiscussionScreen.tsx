import React, { useState, useEffect } from 'react';
import { Player } from '../types';

interface AUDiscussionScreenProps {
  discussionTime: number;
  onEndDiscussion: () => void;
  onSpyGuessResult: (wasCorrect: boolean) => void;
  players: Player[];
}

const AUDiscussionScreen: React.FC<AUDiscussionScreenProps> = ({ discussionTime, onEndDiscussion, onSpyGuessResult, players }) => {
  const [timeLeft, setTimeLeft] = useState(discussionTime);
  const [isConfirmGuessModalOpen, setIsConfirmGuessModalOpen] = useState(false);
  const [isSpyRevealed, setIsSpyRevealed] = useState(false);

  const spy = players.find(p => p.role === 'Impostor');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const timerIsRunning = timeLeft > 0;

  const handleConfirmGuess = (wasCorrect: boolean) => {
    onSpyGuessResult(wasCorrect);
    setIsConfirmGuessModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Geheime Besprechung</h1>
        <p className="text-xl text-gray-300 mt-4 max-w-md">Stellt euch abwechselnd Fragen zum Ort. Agenten: Entlarvt den Spion! Spion: Errate den Ort!</p>
        
        <div className="my-12 text-8xl font-black text-white tabular-nums">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        
        <div className="space-y-4 w-full max-w-sm">
            <button
                onClick={onEndDiscussion}
                disabled={!timerIsRunning}
                className="w-full bg-purple-600 text-white font-bold py-4 px-10 rounded-lg text-2xl hover:bg-purple-500 transition-colors duration-300 shadow-lg shadow-purple-500/20 transform hover:scale-105 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
            >
                {timerIsRunning ? 'Zur Abstimmung' : 'Zeit abgelaufen!'}
            </button>
            
            {!isSpyRevealed ? (
                <button onClick={() => setIsSpyRevealed(true)} className="w-full bg-gray-700 text-gray-300 font-bold py-2 rounded-lg text-sm hover:bg-gray-600">
                    Bist du der Spion? Klicke hier.
                </button>
            ) : (
                <button onClick={() => setIsConfirmGuessModalOpen(true)} className="w-full bg-red-600 text-white font-bold py-3 px-10 rounded-lg text-xl hover:bg-red-500 transition-colors duration-300 shadow-lg shadow-red-500/20 transform hover:scale-105 animate-pulse">
                    Ort erraten
                </button>
            )}
        </div>

        {isConfirmGuessModalOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-4 border border-gray-700 text-center">
                    <h2 className="text-2xl font-bold text-red-400">Hat der Spion den Ort erraten?</h2>
                    <p className="text-gray-300">
                        Der Spion <span className="font-bold text-white">{spy?.name}</span> hat seine Vermutung laut ausgesprochen. War sie korrekt?
                    </p>
                    <div className="flex justify-center space-x-4 pt-4">
                        <button onClick={() => handleConfirmGuess(false)} className="px-8 py-3 rounded-md font-semibold bg-gray-600 text-white hover:bg-gray-500 transition-colors">
                            Nein, falsch
                        </button>
                        <button onClick={() => handleConfirmGuess(true)} className="px-8 py-3 rounded-md font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors">
                            Ja, richtig!
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AUDiscussionScreen;