import React, { useState, useEffect, useRef } from 'react';
import { CustomTruthOrDareSet } from '../types';

interface FlaschendrehenSpinScreenProps {
  players: string[];
  taskData: CustomTruthOrDareSet[];
  onEndGame: () => void;
}

const BottleIcon: React.FC = () => (
    // Der neue Pfad hat ein natives Seitenverhältnis von ca. 3:10. Wir passen die viewBox an
    // das Anzeige-Seitenverhältnis von 60:180 (also 1:3 oder 3.33:10) an, um Verzerrungen zu vermeiden.
    <svg width="60" height="180" viewBox="1.83 0 3.34 10" className="drop-shadow-lg">
        <defs>
            <linearGradient id="bottleGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#facc15" /> {/* yellow-400 */}
                <stop offset="50%" stopColor="#f97316" /> {/* orange-500 */}
                <stop offset="100%" stopColor="#ea580c" /> {/* orange-600 */}
            </linearGradient>
            <filter id="bottleGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.1" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
                <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        
        <g filter="url(#bottleGlow)">
            <path
                // Vom Benutzer bereitgestellter Pfad, mit V8Z geschlossen, um eine vollständige Form zu bilden.
                d="M2 8c0 1 0 2 1 2H4c1 0 1-1 1-2V4C5 2 4 3 4 1V0C4 -0.3 3 -0.3 3 0V1C3 3 2 2 2 4V8Z"
                fill="url(#bottleGlass)"
            />
        </g>
    </svg>
);


const FlaschendrehenSpinScreen: React.FC<FlaschendrehenSpinScreenProps> = ({ players, taskData, onEndGame }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<'Wahrheit' | 'Pflicht' | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const bottleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bottle = bottleRef.current;
    if (!bottle) return;
    
    const handleTransitionEnd = () => {
      setIsSpinning(false);
      
      const actualRotation = rotation % 360;
      const playerAngle = 360 / players.length;
      let selectedIndex = Math.floor(((360 - actualRotation + playerAngle / 2) % 360) / playerAngle);
      selectedIndex = (players.length - selectedIndex) % players.length;

      setSelectedPlayer(players[selectedIndex]);
      setIsModalOpen(true);
    };

    bottle.addEventListener('transitionend', handleTransitionEnd);
    return () => bottle.removeEventListener('transitionend', handleTransitionEnd);
  }, [rotation, players]);
  
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setTask(null);
    setTaskType(null);
    setSelectedPlayer(null);
    
    const randomSpins = Math.floor(Math.random() * 4) + 3; // 3 to 6 full spins
    const randomAngle = Math.random() * 360;
    setRotation(rotation + (randomSpins * 360) + randomAngle);
  };

  const handleSelectTaskType = (type: 'Wahrheit' | 'Pflicht') => {
    setTaskType(type);
    
    if (taskData.length === 0) {
        setTask("Keine Aufgaben gefunden. Denkt euch selbst etwas aus!");
        return;
    }

    const randomCategory = taskData[Math.floor(Math.random() * taskData.length)];
    const taskTypeKey = type === 'Wahrheit' ? 'wahrheit' : 'pflicht';
    const tasks = randomCategory?.[taskTypeKey] ?? [];

    let fetchedTask = `Hoppla, in der Kategorie "${randomCategory.name}" gibt es keine ${type}-Aufgaben. Wähle die andere Option oder denkt euch selbst etwas aus!`;
    if (tasks.length > 0) {
      fetchedTask = tasks[Math.floor(Math.random() * tasks.length)];
    }
    
    setTask(fetchedTask);
  };
  
  const handleNextRound = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4 text-center overflow-hidden">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">Flaschendrehen</h1>
        
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center my-8">
            {players.map((player, index) => {
                const angle = (index / players.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 150; // Radius in pixels for sm screens
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                    <div key={index} className="absolute" style={{ transform: `translate(${x}px, ${y}px)` }}>
                       <span className={`px-4 py-2 rounded-full font-bold text-lg transition-all duration-300 ${selectedPlayer === player ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-700 text-gray-200'}`}>{player}</span>
                    </div>
                );
            })}

            <div 
                ref={bottleRef}
                style={{ transform: `rotate(${rotation}deg)` }} 
                className="absolute transition-transform duration-[5000ms] ease-out-quint"
            >
                <BottleIcon />
            </div>
        </div>

        <div className="flex space-x-4 mt-4">
             <button
                onClick={handleSpin}
                disabled={isSpinning || isModalOpen}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-4 px-12 rounded-lg text-2xl transition-all duration-300 shadow-lg shadow-orange-500/30 transform hover:scale-105 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
            >
                {isSpinning ? '...' : 'Drehen!'}
            </button>
            <button
                onClick={onEndGame}
                className="bg-gray-700 text-gray-300 font-bold py-4 px-8 rounded-lg text-xl hover:bg-gray-600 transition-colors"
            >
                Beenden
            </button>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" aria-modal="true" role="dialog">
              <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-6 border border-gray-700 text-center transform animate-scale-in">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{selectedPlayer}, du bist dran!</h2>
                  
                  {task ? (
                      <div className="space-y-4">
                          <p className="text-sm font-bold uppercase text-yellow-400">{taskType}</p>
                          <p className="text-2xl text-white bg-gray-900/50 p-4 rounded-lg min-h-[100px] flex items-center justify-center">{task}</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                        <p className="text-xl text-gray-300">Wähle deine Herausforderung:</p>
                        <div className="flex justify-center space-x-4 pt-2">
                            <button onClick={() => handleSelectTaskType('Wahrheit')} className="px-8 py-3 rounded-md text-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-transform hover:scale-105">
                                Wahrheit
                            </button>
                            <button onClick={() => handleSelectTaskType('Pflicht')} className="px-8 py-3 rounded-md text-lg font-semibold bg-red-600 text-white hover:bg-red-500 transition-transform hover:scale-105">
                                Pflicht
                            </button>
                        </div>
                      </div>
                  )}
                  
                  {task && (
                      <button onClick={handleNextRound} className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-3 rounded-lg text-xl transition-all duration-300 shadow-lg shadow-orange-500/30 transform hover:scale-105">
                          Nächste Runde
                      </button>
                  )}
              </div>
            </div>
        )}
        <style>{`
          .ease-out-quint { transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default FlaschendrehenSpinScreen;