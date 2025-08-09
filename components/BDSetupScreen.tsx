import React, { useState, useRef } from 'react';
import { Difficulty, BDGameSettings } from '../games/BombenentschaerfungGame';
import InstructionsModal from './InstructionsModal';
import { AVAILABLE_MODULES, BombModuleType } from '../games/bombenentschaerfungData';

interface BDSetupScreenProps {
  onStartGame: (settings: BDGameSettings) => void;
  onExit: () => void;
  lastSettings: BDGameSettings;
  onShowManual: () => void;
}

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const BDSetupScreen: React.FC<BDSetupScreenProps> = ({ onStartGame, onExit, lastSettings, onShowManual }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(lastSettings.difficulty);
  const [customModules, setCustomModules] = useState(lastSettings.customModules);
  const [customTime, setCustomTime] = useState(lastSettings.customTime / 60); // in minutes
  const [customStrikes, setCustomStrikes] = useState(lastSettings.customStrikes);
  const [musicEnabled, setMusicEnabled] = useState(lastSettings.musicEnabled);
  const [customModuleSelection, setCustomModuleSelection] = useState<BombModuleType[]>(lastSettings.customModuleSelection);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const setupContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (setupContainerRef.current?.scrollTop === 0) {
        touchStartY.current = e.targetTouches[0].clientY;
    } else {
        touchStartY.current = 0; // Not at the top, don't track for swipe-to-exit
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartY.current === 0) return;

      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchEndY - touchStartY.current;

      if (swipeDistance > 100) { // Swipe down threshold
          onExit();
      }
      touchStartY.current = 0; // Reset
  };
  
  const handleModuleToggle = (moduleType: BombModuleType) => {
    setCustomModuleSelection(prev => {
        const isCurrentlySelected = prev.includes(moduleType);
        if (isCurrentlySelected && prev.length === 1) {
            // Prevent unselecting the last module
            return prev;
        }
        return isCurrentlySelected
            ? prev.filter(m => m !== moduleType)
            : [...prev, moduleType];
    });
  };

  const handleStart = () => {
    onStartGame({
        difficulty,
        customModules,
        customTime: customTime * 60, // convert back to seconds
        customStrikes,
        musicEnabled,
        customModuleSelection,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Bombenkommando"
            gradient="bg-gradient-to-br from-red-500 to-red-300"
            buttonClass="bg-red-600 hover:bg-red-500"
            headingClass="[&_h3]:text-red-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
            <p>Entschärft als Team die Bombe, bevor die Zeit abläuft. Kommunikation ist der Schlüssel zum Erfolg!</p>

            <h3 className="text-xl font-bold pt-4">Rollen</h3>
             <ul className="list-disc list-inside space-y-2">
                <li><strong>Techniker (1 Spieler):</strong> Nur diese Person darf auf das Gerät schauen und die Bombe sehen. Der Techniker beschreibt den Experten, was er sieht, und führt ihre Anweisungen aus.</li>
                <li><strong>Experten (Rest der Spieler):</strong> Nur diese Personen dürfen das Handbuch (die Anleitung mit den Lösungs-Codes) lesen. Sie dürfen die Bombe nicht sehen. Sie hören dem Techniker zu und geben ihm die richtigen Anweisungen.</li>
            </ul>

            <h3 className="text-xl font-bold pt-4">Ablauf</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li>Startet das Spiel und bestimmt, wer der Techniker ist. Alle anderen sind Experten.</li>
                <li>Die Experten öffnen das Handbuch (über den Button im Setup-Menü).</li>
                <li>Der Techniker beschreibt ein Modul auf der Bombe (z.B. "Ich sehe vier Drähte: Rot, Rot, Blau, Gelb").</li>
                <li>Die Experten suchen im Handbuch die passenden Anweisungen für dieses Modul und sagen dem Techniker, was zu tun ist (z.B. "Okay, bei vier Drähten und mehr als einem roten Draht, schneide den letzten roten Draht durch.").</li>
                <li>Ein Fehler (Strike) lässt den Timer schneller laufen. Zu viele Fehler, und die Bombe explodiert!</li>
                <li>Löst alle Module, um das Spiel zu gewinnen.</li>
            </ol>
        </InstructionsModal>

      <div
        ref={setupContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 relative overflow-y-auto">
        <button onClick={onExit} className="absolute top-5 left-5 p-2 rounded-full bg-gray-700 hover:bg-gray-600 z-10" aria-label="Zurück zum Hauptmenü">
            <BackIcon />
        </button>
        <div className="text-center">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-red-500 to-red-300">Bombenkommando</h1>
            <p className="text-gray-400 mt-2">Kommunikation ist alles. Nicht in die Luft fliegen.</p>
        </div>
        
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Schwierigkeit</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-700 rounded-md p-1">
                    {(['Einfach', 'Mittel', 'Schwer', 'Individuell'] as Difficulty[]).map(d => (
                         <button 
                            key={d}
                            onClick={() => setDifficulty(d)} 
                            className={`w-full p-2 rounded font-semibold text-sm transition-colors duration-200 ${difficulty === d ? 'bg-red-600 text-white' : 'text-white hover:bg-gray-600'}`}
                         >
                            {d}
                        </button>
                    ))}
                </div>
                <div className="text-center mt-4 text-gray-400 text-sm h-10">
                    {difficulty === 'Einfach' && <p>2 Module, 5:00 Minuten, 3 Fehler</p>}
                    {difficulty === 'Mittel' && <p>3 Module, 4:00 Minuten, 3 Fehler</p>}
                    {difficulty === 'Schwer' && <p>4 Module, 3:00 Minuten, 2 Fehler</p>}
                </div>

                {difficulty === 'Individuell' && (
                    <div className="space-y-4 pt-4 border-t border-gray-700 animate-fade-in">
                        <div>
                            <label htmlFor="custom-modules" className="block text-sm font-bold text-gray-300 mb-2">Module: <span className="font-black text-red-400">{customModules}</span></label>
                            <input type="range" id="custom-modules" min="1" max="6" step="1" value={customModules} onChange={(e) => setCustomModules(Number(e.target.value))} className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500" />
                        </div>
                        <div>
                            <label htmlFor="custom-time" className="block text-sm font-bold text-gray-300 mb-2">Zeit: <span className="font-black text-red-400">{customTime} Minute{customTime > 1 ? 'n' : ''}</span></label>
                            <input type="range" id="custom-time" min="1" max="10" step="1" value={customTime} onChange={(e) => setCustomTime(Number(e.target.value))} className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500" />
                        </div>
                         <div>
                            <label htmlFor="custom-strikes" className="block text-sm font-bold text-gray-300 mb-2">Fehler erlaubt: <span className="font-black text-red-400">{customStrikes}</span></label>
                            <input type="range" id="custom-strikes" min="1" max="5" step="1" value={customStrikes} onChange={(e) => setCustomStrikes(Number(e.target.value))} className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Enthaltene Module</label>
                            <div className="grid grid-cols-2 gap-2">
                                {AVAILABLE_MODULES.map(module => (
                                    <button
                                        key={module.type}
                                        onClick={() => handleModuleToggle(module.type)}
                                        className={`p-2 rounded font-semibold text-sm transition-colors duration-200 ${customModuleSelection.includes(module.type) ? 'bg-red-600 text-white' : 'text-white bg-gray-600/50 hover:bg-gray-600'}`}
                                    >
                                        {module.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Musik</label>
                <div className="flex space-x-2 bg-gray-700 rounded-md p-1">
                    <button onClick={() => setMusicEnabled(true)} className={`w-full p-2 rounded-md font-semibold text-sm transition-colors duration-200 ${musicEnabled ? 'bg-red-600 text-white' : 'text-white hover:bg-gray-600'}`}>An</button>
                    <button onClick={() => setMusicEnabled(false)} className={`w-full p-2 rounded-md font-semibold text-sm transition-colors duration-200 ${!musicEnabled ? 'bg-red-600 text-white' : 'text-white hover:bg-gray-600'}`}>Aus</button>
                </div>
            </div>
        </div>
        
        <div className="w-full space-y-3">
             <button
                onClick={() => setIsInstructionsOpen(true)}
                className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
            >
                Anleitung
            </button>
             <button
                onClick={onShowManual}
                className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
            >
                Handbuch für Experten öffnen
            </button>
            <button 
                onClick={handleStart} 
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg shadow-red-500/30 transform hover:scale-105 hover:shadow-red-400/40"
            >
              Start
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BDSetupScreen;
