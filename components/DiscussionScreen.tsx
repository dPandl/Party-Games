
import React, { useState, useEffect } from 'react';

interface DiscussionScreenProps {
  discussionTime: number;
  onEndDiscussion: () => void;
  withVoting: boolean;
}

/**
 * Spielt einen kurzen "Gong"-Sound mit der Web Audio API ab.
 * Wird aufgerufen, wenn die Diskussionszeit abläuft.
 */
const playChime = () => {
    // Sicherstellen, dass der Code nur im Browser ausgeführt wird
    if (typeof window === 'undefined') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) {
        console.warn("Web Audio API wird in diesem Browser nicht unterstützt.");
        return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A6-Note
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Etwas leiser
    
    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
};

const DiscussionScreen: React.FC<DiscussionScreenProps> = ({ discussionTime, onEndDiscussion, withVoting }) => {
  const [timeLeft, setTimeLeft] = useState(discussionTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      return; // Timer anhalten
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          if (newTime === 0) {
              playChime(); // Sound abspielen, wenn die Zeit abgelaufen ist
          }
          return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const timerIsRunning = timeLeft > 0;
  const buttonText = timerIsRunning ? 'Diskussion beenden' : (withVoting ? 'Zur Abstimmung' : 'Impostor aufdecken');

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
        <h1 className="text-4xl font-black text-blue-400">Diskussionsrunde</h1>
        <p className="text-xl text-gray-300 mt-4 max-w-md">Beschreibt abwechselnd euren Begriff. Die Impostor müssen so tun, als wüssten sie, worum es geht. Findet sie!</p>
        
        <div className="my-16 text-8xl font-black text-white tabular-nums">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        
        <button
            onClick={onEndDiscussion}
            className="bg-blue-600 text-white font-bold py-4 px-10 rounded-lg text-2xl hover:bg-blue-500 transition-colors duration-300 shadow-lg shadow-blue-500/20 transform hover:scale-105"
        >
            {buttonText}
        </button>
    </div>
  );
};

export default DiscussionScreen;
