

import React, { useState, useEffect, useRef } from 'react';
import { WW_MIN_PLAYERS, WW_MAX_PLAYERS } from '../constants';
import { WerwolfRole } from '../types';
import { useNotification } from './Notification';
import InstructionsModal from './InstructionsModal';

export interface WWRoleSelection {
  seer: boolean;
  witch: boolean;
  hunter: boolean;
  cupid: boolean;
}

interface WWSetupScreenProps {
  onStartGame: (playerNames: string[], roles: WWRoleSelection) => void;
  onExit: () => void;
  lastSettings?: { playerNames: string[], roles: WWRoleSelection } | null;
}

// Icons
const UserIcon=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>);
const BackIcon=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);

const getSessionPlayerNames = (): string[] | null => {
  try {
    const stored = sessionStorage.getItem('globalPlayerNames');
    if (stored) {
      const names = JSON.parse(stored);
      if (Array.isArray(names) && names.length > 0) return names;
    }
  } catch (e) { console.error("Failed to parse player names from session storage", e); }
  return null;
};

const WWSetupScreen: React.FC<WWSetupScreenProps> = ({ onStartGame, onExit, lastSettings }) => {
  const { addNotification } = useNotification();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const sessionNames = getSessionPlayerNames();
  
  const baseNames = lastSettings?.playerNames || sessionNames || [];

  let adjustedPlayerNames = [...baseNames];
  if (adjustedPlayerNames.length > WW_MAX_PLAYERS) {
    adjustedPlayerNames = adjustedPlayerNames.slice(0, WW_MAX_PLAYERS);
  } else if (adjustedPlayerNames.length < WW_MIN_PLAYERS) {
    const minToAdd = WW_MIN_PLAYERS - adjustedPlayerNames.length;
    for (let i = 0; i < minToAdd; i++) {
      adjustedPlayerNames.push(`Spieler ${adjustedPlayerNames.length + 1}`);
    }
  }

  const [playerNames, setPlayerNames] = useState<string[]>(adjustedPlayerNames);
  const [roles, setRoles] = useState<WWRoleSelection>(lastSettings?.roles || {
    seer: true,
    witch: true,
    hunter: false,
    cupid: false,
  });
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

  const updatePlayerCount = (newCount: number) => {
    if (newCount < WW_MIN_PLAYERS || newCount > WW_MAX_PLAYERS) return;
    let newPlayerNames = [...playerNames];
    if (newCount > playerNames.length) {
      for (let i = playerNames.length; i < newCount; i++) newPlayerNames.push(`Spieler ${i + 1}`);
    } else {
      newPlayerNames = newPlayerNames.slice(0, newCount);
    }
    setPlayerNames(newPlayerNames);
  };
  
  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };
  
  const handleRoleToggle = (role: keyof WWRoleSelection) => {
    setRoles(prev => ({...prev, [role]: !prev[role]}));
  };

  const handleStart = () => {
    const trimmedNames = playerNames.map(name => name.trim()).filter(name => name);
    if (trimmedNames.length !== playerNames.length) {
      addNotification('Bitte gib allen Spielern einen Namen.');
      return;
    }
    sessionStorage.setItem('globalPlayerNames', JSON.stringify(trimmedNames));
    onStartGame(trimmedNames, roles);
  };

  const werewolfCount = Math.max(1, Math.floor(playerNames.length / 4));

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Werwölfe"
            gradient="bg-gradient-to-br from-indigo-400 to-red-500"
            buttonClass="bg-indigo-600 hover:bg-indigo-500"
            headingClass="[&_h3]:text-indigo-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
             <ul className="list-disc list-inside space-y-2">
                <li><strong>Dorfbewohner:</strong> Findet und eliminiert alle Werwölfe.</li>
                <li><strong>Werwölfe:</strong> Tötet nachts Dorfbewohner, bis ihr in der Überzahl seid.</li>
            </ul>

            <h3 className="text-xl font-bold pt-4">Rollen</h3>
            <p>Es gibt Werwölfe, Dorfbewohner und verschiedene Sonderrollen (Seherin, Hexe etc.) mit speziellen Fähigkeiten, die ihr im Setup auswählen könnt.</p>
            
            <h3 className="text-xl font-bold pt-4">Ablauf</h3>
            <p>Das Spiel wird von einem Spielleiter moderiert, der die App bedient und durch die Phasen führt. Es wechselt zwischen zwei Phasen:</p>
            <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>
                    <strong>Nacht:</strong> Alle Spieler schließen die Augen. Der Spielleiter folgt den Anweisungen der App und ruft nacheinander die verschiedenen Rollen auf, die geheim ihre Aktionen ausführen (z.B. die Werwölfe wählen ein Opfer, die Seherin überprüft einen Spieler). Der Spielleiter tippt die entsprechenden Spieler in der App an.
                </li>
                <li>
                    <strong>Tag:</strong> Alle öffnen die Augen. Der Spielleiter verkündet, was in der Nacht passiert ist. Danach diskutiert das ganze Dorf und stimmt darüber ab, wer ein Werwolf sein könnte. Der Spieler mit den meisten Stimmen wird aus dem Spiel eliminiert und seine Rolle wird aufgedeckt.
                </li>
            </ol>
             <p className="mt-2">Der Zyklus von Nacht und Tag wiederholt sich, bis eine Fraktion die Siegbedingung erfüllt.</p>
        </InstructionsModal>

      <div
        ref={setupContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 relative overflow-y-auto">
        <button onClick={onExit} className="absolute top-5 left-5 p-2 rounded-full bg-gray-700 hover:bg-gray-600 z-10" aria-label="Zurück zum Hauptmenü"><BackIcon /></button>
        <div className="text-center">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-red-500">Werwölfe</h1>
            <p className="text-gray-400 mt-2">Die Nacht bricht herein...</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Anzahl Spieler</label>
            <div className="flex items-center justify-center bg-gray-700 rounded-md">
              <button onClick={() => updatePlayerCount(playerNames.length-1)} disabled={playerNames.length <= WW_MIN_PLAYERS} className="px-6 py-3 text-2xl font-black rounded-l-md hover:bg-gray-600 disabled:text-gray-500">-</button>
              <span className="flex-grow text-center text-2xl font-bold tabular-nums">{playerNames.length}</span>
              <button onClick={() => updatePlayerCount(playerNames.length+1)} disabled={playerNames.length >= WW_MAX_PLAYERS} className="px-6 py-3 text-2xl font-black rounded-r-md hover:bg-gray-600 disabled:text-gray-500">+</button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Namen der Dorfbewohner</label>
            <div className="space-y-3">
              {playerNames.map((name, i) => (
                <div key={i} className="flex items-center">
                  <UserIcon />
                  <input type="text" placeholder={`Spieler ${i+1}`} value={name} onChange={e => handlePlayerNameChange(i, e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 pl-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Sonderrollen im Spiel</label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(roles) as Array<keyof WWRoleSelection>).map(roleKey => (
                 <button key={roleKey} onClick={() => handleRoleToggle(roleKey)} className={`w-full p-3 rounded-md font-semibold text-sm capitalize transition-colors ${roles[roleKey] ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                   {roleKey === 'seer' && 'Seherin'}
                   {roleKey === 'witch' && 'Hexe'}
                   {roleKey === 'hunter' && 'Jäger'}
                   {roleKey === 'cupid' && 'Amor'}
                 </button>
              ))}
            </div>
          </div>

           <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-center">
                <h3 className="text-white font-bold mb-1">Spiel-Zusammensetzung</h3>
                <p className="text-gray-400 text-sm">
                    {werewolfCount} Werwolf, {Object.values(roles).filter(Boolean).length} Sonderrolle(n), der Rest sind Dorfbewohner.
                </p>
            </div>
            
            <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/50 text-sm">
                <h3 className="text-white font-bold mb-2">Spielleiter benötigt!</h3>
                <p className="text-indigo-100">
                    Bestimmt eine Person als <strong>Spielleiter</strong>. Diese Person moderiert das Spiel mit der App und darf nicht aktiv mitspielen. Keiner der Spieler darf während des aktiven Spiels den Bildschirm sehen.
                </p>
            </div>

        </div>
        
        <div className="w-full space-y-3">
             <button
                onClick={() => setIsInstructionsOpen(true)}
                className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
            >
                Anleitung
            </button>
            <button onClick={handleStart} className="w-full bg-gradient-to-r from-indigo-600 to-red-700 text-white font-bold py-4 rounded-lg text-xl shadow-lg shadow-indigo-500/30 transform hover:scale-105">
                Dorf gründen & Rollen verteilen
            </button>
        </div>
      </div>
    </div>
  );
};

export default WWSetupScreen;