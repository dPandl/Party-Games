import React, { useState, useEffect, useRef } from 'react';
import { AU_MIN_PLAYERS, AU_MAX_PLAYERS } from '../constants';
import { CustomLocationSet } from '../types';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';
import InstructionsModal from './InstructionsModal';
import { AGENTEN_LOCATION_SETS } from '../games/agentenUndercoverData';
import { useSettings } from './SettingsContext';

interface AUSetupScreenProps {
  onStartGame: (players: string[], selectedSets: string[], customLocationSets: CustomLocationSet[]) => void;
  onExit: () => void;
  initialSettings?: { playerNames: string[]; selectedSets: string[] } | null;
}

// --- Icons ---
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>);
const BackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const ExportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L6.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>);
const ImportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);

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

const AUSetupScreen: React.FC<AUSetupScreenProps> = ({ onStartGame, onExit, initialSettings }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const { show18PlusContent } = useSettings();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const sessionNames = consentGiven ? getSessionPlayerNames() : null;
  const storageErrorMsg = 'Speichern fehlgeschlagen: Dein Browser-Speicher ist möglicherweise voll oder blockiert.';

  const baseNames = initialSettings?.playerNames || sessionNames || [];

  let adjustedPlayerNames = [...baseNames];
  if (adjustedPlayerNames.length > AU_MAX_PLAYERS) {
    adjustedPlayerNames = adjustedPlayerNames.slice(0, AU_MAX_PLAYERS);
  } else if (adjustedPlayerNames.length < AU_MIN_PLAYERS) {
    const minToAdd = AU_MIN_PLAYERS - adjustedPlayerNames.length;
    for (let i = 0; i < minToAdd; i++) {
      adjustedPlayerNames.push(`Agent ${adjustedPlayerNames.length + 1}`);
    }
  }

  if (adjustedPlayerNames.length === 0) {
    adjustedPlayerNames = Array(AU_MIN_PLAYERS).fill('').map((_, i) => `Agent ${i + 1}`);
  }

  const initialPlayerCount = adjustedPlayerNames.length;
  
  const [playerCount, setPlayerCount] = useState<number>(initialPlayerCount);
  const [playerNames, setPlayerNames] = useState<string[]>(adjustedPlayerNames);
  
  const [customLocationSets, setCustomLocationSets] = useState<CustomLocationSet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<CustomLocationSet | null>(null);
  const [newSetName, setNewSetName] = useState('');
  const [newSetLocations, setNewSetLocations] = useState<string[]>([]);
  const [isAdultSet, setIsAdultSet] = useState(false);
  const [currentLocationInput, setCurrentLocationInput] = useState('');
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const setupContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const availableDefaultSets = AGENTEN_LOCATION_SETS.filter(set => show18PlusContent || !set.isAdult);
  const availableCustomSets = customLocationSets.filter(set => show18PlusContent || !set.isAdult);
  const [selectedSets, setSelectedSets] = useState<string[]>(initialSettings?.selectedSets || availableDefaultSets.map(s => s.name));

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

  useEffect(() => {
    if (consentGiven) {
        try {
            const stored = localStorage.getItem('agentenCustomLocationSets');
            if (stored) setCustomLocationSets(JSON.parse(stored));
        } catch (error) {
            console.error("Failed to parse custom location sets from localStorage", error);
        }
    } else {
        setCustomLocationSets([]);
    }
  }, [consentGiven]);

  const updatePlayerCount = (newCount: number) => {
    if (newCount < AU_MIN_PLAYERS || newCount > AU_MAX_PLAYERS) return;

    const currentCount = playerNames.length;
    let newPlayerNames = [...playerNames];

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        newPlayerNames.push(`Agent ${i + 1}`);
      }
    } else {
      newPlayerNames = newPlayerNames.slice(0, newCount);
    }
    
    setPlayerCount(newCount);
    setPlayerNames(newPlayerNames);
  };

  const handleDecrement = () => updatePlayerCount(playerCount - 1);
  const handleIncrement = () => updatePlayerCount(playerCount + 1);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const handleSetToggle = (setName: string) => {
    setSelectedSets(current => current.includes(setName) ? current.filter(s => s !== setName) : [...current, setName]);
  };
  
  const openSetModal = (setToEdit: CustomLocationSet | null = null) => {
    setEditingSet(setToEdit);
    setNewSetName(setToEdit ? setToEdit.name : '');
    setNewSetLocations(setToEdit ? setToEdit.locations : []);
    setIsAdultSet(setToEdit ? setToEdit.isAdult ?? false : false);
    setCurrentLocationInput('');
    setIsModalOpen(true);
  };

  const handleAddLocation = () => {
    const location = currentLocationInput.trim();
    if (location && !newSetLocations.includes(location)) {
        setNewSetLocations([...newSetLocations, location]);
        setCurrentLocationInput('');
    }
  };

  const handleRemoveLocation = (indexToRemove: number) => {
    setNewSetLocations(newSetLocations.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveCustomSet = () => {
    const trimmedName = newSetName.trim();
    if (!trimmedName) { addNotification('Bitte gib einen Namen für das Set ein.'); return; }
    if (newSetLocations.length < 3) { addNotification('Bitte gib mindestens 3 Orte ein.'); return; }

    const isNameTaken = customLocationSets.some(s => s.name.toLowerCase() === trimmedName.toLowerCase() && s.name.toLowerCase() !== editingSet?.name.toLowerCase());
    if (isNameTaken || AGENTEN_LOCATION_SETS.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
        addNotification('Ein Set mit diesem Namen existiert bereits.');
        return;
    }

    const newSetData = { name: trimmedName, locations: newSetLocations, isAdult: isAdultSet };
    let newCustomSets;
    if (editingSet) {
        newCustomSets = customLocationSets.map(s => s.name === editingSet.name ? newSetData : s);
        setSelectedSets(current => current.map(s => s === editingSet.name ? newSetData.name : s));
    } else {
        newCustomSets = [...customLocationSets, newSetData];
        if (!selectedSets.includes(newSetData.name)) {
            setSelectedSets(current => [...current, newSetData.name]);
        }
    }

    setCustomLocationSets(newCustomSets);
    if (consentGiven) {
        try {
            localStorage.setItem('agentenCustomLocationSets', JSON.stringify(newCustomSets));
        } catch (e) {
            console.error(e);
            addNotification(storageErrorMsg, 'error');
        }
    }
    setIsModalOpen(false);
    setEditingSet(null);
  };
  
  const handleDeleteCustomSet = (setNameToDelete: string) => {
    if (selectedSets.length === 1 && selectedSets[0] === setNameToDelete) {
        addNotification("Du kannst nicht das letzte ausgewählte Set löschen.", 'info');
        return;
    }
    setSetToDelete(setNameToDelete);
  };

  const confirmDeleteSet = () => {
    if (!setToDelete) return;
    const newCustomSets = customLocationSets.filter(s => s.name !== setToDelete);
    setCustomLocationSets(newCustomSets);
    if (consentGiven) {
        try {
            localStorage.setItem('agentenCustomLocationSets', JSON.stringify(newCustomSets));
        } catch (e) {
            console.error(e);
            addNotification(storageErrorMsg, 'error');
        }
    }
    setSelectedSets(current => current.filter(s => s !== setToDelete));
    setSetToDelete(null);
  };

  const handleExportSet = (set: CustomLocationSet) => {
    const jsonString = JSON.stringify(set, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set.name.replace(/\s/g, '_')}.AUSets`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);

            if (typeof data.name !== 'string' || !Array.isArray(data.locations)) {
                let errorMsg = 'Fehler beim Importieren: Die Datei hat ein ungültiges Format für Agenten Undercover.';
                if (typeof data.name === 'string') {
                    if (Array.isArray(data.words)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Impostor Party" Set.';
                    else if (Array.isArray(data.wahrheit) && Array.isArray(data.pflicht)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Flaschendrehen" Set.';
                    else if (Array.isArray(data.dilemmas)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Moralischer Kompass" Set.';
                    else if (Array.isArray(data.stories)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Krimi Klub" Set.';
                    else if (Array.isArray(data.cards)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Wort-Akrobaten" Set.';
                }
                addNotification(errorMsg, 'error');
                console.error("Invalid set format for Agenten Undercover:", data);
                return;
            }

            const set = data as CustomLocationSet;

            const existingIndex = customLocationSets.findIndex(s => s.name.toLowerCase() === set.name.toLowerCase());
            if (existingIndex !== -1) {
                if (window.confirm(`Ein Set namens "${set.name}" existiert bereits. Möchtest du es überschreiben?`)) {
                    const newCustomSets = [...customLocationSets];
                    newCustomSets[existingIndex] = set;
                    setCustomLocationSets(newCustomSets);
                    if (consentGiven) {
                        try {
                           localStorage.setItem('agentenCustomLocationSets', JSON.stringify(newCustomSets));
                        } catch(err) {
                           console.error(err);
                           addNotification(storageErrorMsg, 'error');
                        }
                    }
                }
            } else {
                const newCustomSets = [...customLocationSets, set];
                setCustomLocationSets(newCustomSets);
                if (consentGiven) {
                    try {
                        localStorage.setItem('agentenCustomLocationSets', JSON.stringify(newCustomSets));
                    } catch(err) {
                       console.error(err);
                       addNotification(storageErrorMsg, 'error');
                    }
                }
            }
        } catch (error) {
            addNotification('Fehler beim Importieren des Sets: Datei ist nicht korrekt formatiert.', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };


  const handleStartGame = () => {
    const trimmedNames = playerNames.map(name => name.trim()).filter(name => name);
    if (trimmedNames.length !== playerCount) {
        addNotification('Bitte gib allen Agenten einen Namen.');
        return;
    }
    if (selectedSets.length === 0) {
        addNotification('Bitte wähle mindestens ein Orte-Set aus.');
        return;
    }
    if (consentGiven) {
        try {
            sessionStorage.setItem('globalPlayerNames', JSON.stringify(trimmedNames));
        } catch (e) {
            console.error("Failed to save player names to session storage", e);
            addNotification('Spielernamen konnten nicht für die Sitzung gespeichert werden.', 'info');
        }
    }
    onStartGame(trimmedNames, selectedSets, customLocationSets);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Agenten Undercover"
            gradient="bg-gradient-to-br from-purple-400 to-pink-500"
            buttonClass="bg-purple-600 hover:bg-purple-500"
            headingClass="[&_h3]:text-purple-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
            <p>Die Agenten müssen den gegnerischen Spion in ihren Reihen entlarven. Der Spion muss währenddessen herausfinden, an welchem geheimen Ort sich die Gruppe befindet.</p>

            <h3 className="text-xl font-bold pt-4">Ablauf</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>Rollenverteilung:</strong> Jeder Spieler sieht geheim seine Rolle. Die Agenten sehen den geheimen Ort (z.B. "Raumstation"). Der Spion sieht nur "Du bist der Spion!".</li>
                <li><strong>Fragerunde:</strong> Der Startspieler stellt einem Mitspieler eine Frage, die sich auf den Ort bezieht (z.B. "Ist es hier laut?"). Die Antworten sollten vage genug sein, um den Ort nicht direkt zu verraten, aber eindeutig genug, um andere Agenten zu überzeugen.</li>
                <li><strong>Spion in Aktion:</strong> Der Spion muss geschickt antworten, um nicht aufzufallen, und aus den Fragen und Antworten der anderen den Ort erraten.</li>
                <li><strong>Anklage & Abstimmung:</strong> Sobald ein Spieler glaubt, den Spion zu kennen, kann er die Runde stoppen und eine Anklage erheben. Alle stimmen dann ab.</li>
                <li><strong>Spielende:</strong>
                    <ul className="list-circle list-inside pl-4 mt-2">
                        <li>Wird der Spion enttarnt, haben die Agenten gewonnen.</li>
                        <li>Wird ein Agent fälschlicherweise beschuldigt, gewinnt der Spion.</li>
                        <li>Der Spion kann jederzeit versuchen, den Ort zu erraten. Liegt er richtig, gewinnt er sofort. Liegt er falsch, verliert er sofort.</li>
                    </ul>
                </li>
            </ol>
        </InstructionsModal>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg space-y-4 border border-gray-700">
                <h2 className="text-2xl font-bold text-purple-400">{editingSet ? 'Set bearbeiten' : 'Eigenes Orte-Set erstellen'}</h2>
                <input type="text" placeholder="Set-Name" value={newSetName} onChange={e => setNewSetName(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Orte (mind. 3)</label>
                    <div className="flex space-x-2">
                        <input type="text" placeholder="Neuen Ort hinzufügen..." value={currentLocationInput} onChange={(e) => setCurrentLocationInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLocation(); } }} className="flex-grow w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <button onClick={handleAddLocation} className="bg-purple-600 text-white p-3 rounded-md hover:bg-purple-500" aria-label="Ort hinzufügen"><PlusIcon /></button>
                    </div>
                    <div className="mt-4 bg-gray-900/50 rounded-lg p-3 space-y-2 h-48 overflow-y-auto">
                        {newSetLocations.length === 0 ? <p className="text-gray-500 text-center py-4">Füge den ersten Ort hinzu.</p> : newSetLocations.map((loc, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-700 p-2 rounded-md animate-fade-in">
                                <span className="text-white">{loc}</span>
                                <button onClick={() => handleRemoveLocation(i)} className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/20" aria-label={`Ort ${loc} entfernen`}><TrashIcon /></button>
                            </div>
                        ))}
                    </div>
                </div>
                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <input
                        type="checkbox"
                        checked={isAdultSet}
                        onChange={e => setIsAdultSet(e.target.checked)}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-600 accent-red-500"
                    />
                    <span className="text-gray-300">Dieses Set enthält Inhalte für Erwachsene (18+).</span>
                </label>
                <div className="flex justify-between items-center pt-2">
                    <div>
                        {editingSet && (
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => handleExportSet(editingSet)} 
                                    className="p-3 rounded-md bg-green-700 text-white hover:bg-green-600 transition-colors flex items-center justify-center"
                                    aria-label="Set exportieren"
                                >
                                    <ExportIcon />
                                </button>
                                <button 
                                    onClick={() => {
                                        if (editingSet) {
                                            setIsModalOpen(false);
                                            handleDeleteCustomSet(editingSet.name);
                                        }
                                    }} 
                                    className="p-3 rounded-md bg-red-700 text-white hover:bg-red-600 transition-colors flex items-center justify-center"
                                    aria-label="Set löschen"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-md font-semibold text-gray-300 hover:bg-gray-600">Abbrechen</button>
                        <button onClick={handleSaveCustomSet} className="px-6 py-2 rounded-md font-semibold bg-purple-600 text-white hover:bg-purple-500">Speichern</button>
                    </div>
                </div>
            </div>
        </div>
      )}
      {setToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-4 border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-red-400">Set löschen?</h2>
            <p className="text-gray-300">Möchtest du das Set <span className="font-bold text-white">"{setToDelete}"</span> wirklich löschen?</p>
            <div className="flex justify-center space-x-4 pt-4">
              <button onClick={() => setSetToDelete(null)} className="px-8 py-3 rounded-md font-semibold text-gray-300 hover:bg-gray-700">Abbrechen</button>
              <button onClick={confirmDeleteSet} className="px-8 py-3 rounded-md font-semibold bg-red-600 text-white hover:bg-red-500">Löschen</button>
            </div>
          </div>
        </div>
      )}
      <div
        ref={setupContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 relative overflow-y-auto">
        <button onClick={onExit} className="absolute top-5 left-5 p-2 rounded-full bg-gray-700 hover:bg-gray-600 z-10" aria-label="Zurück zum Hauptmenü"><BackIcon /></button>
        <div className="text-center">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-pink-500">Agenten Undercover</h1>
            <p className="text-gray-400 mt-2">Wer ist der Spion?</p>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Anzahl Agenten</label>
                <div className="flex items-center justify-center bg-gray-700 rounded-md">
                    <button onClick={handleDecrement} disabled={playerCount <= AU_MIN_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-l-md hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">-</button>
                    <span className="flex-grow text-center text-2xl font-bold text-white tabular-nums">{playerCount}</span>
                    <button onClick={handleIncrement} disabled={playerCount >= AU_MAX_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-r-md hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">+</button>
                </div>
                 <p className="text-xs text-gray-500 mt-2 text-center">Einer von euch wird der Spion sein.</p>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Namen der Agenten</label>
                <div className="space-y-3">
                    {playerNames.map((name, index) => (
                        <div key={index} className="flex items-center">
                           <UserIcon />
                           <input type="text" placeholder={`Agent ${index + 1}`} value={name} onChange={(e) => handlePlayerNameChange(index, e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 pl-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Orte-Sets wählen</label>
                {consentGiven && (
                 <div className="flex space-x-2 mb-3">
                    <button onClick={() => openSetModal(null)} className="flex-1 bg-purple-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-purple-500 transition-colors">Set erstellen</button>
                    <button onClick={() => importFileRef.current?.click()} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"><ImportIcon /> Import</button>
                    <input type="file" ref={importFileRef} onChange={handleImportSet} style={{ display: 'none' }} accept=".AUSets" />
                 </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableDefaultSets.map((s) => (
                        <button key={s.name} onClick={() => handleSetToggle(s.name)} className={`w-full p-3 rounded-md font-semibold text-sm transition-all duration-200 ${selectedSets.includes(s.name) ? 'bg-purple-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-purple-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                            {s.name}
                            {s.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
                        </button>
                    ))}
                </div>
                {consentGiven && availableCustomSets.length > 0 && (
                    <>
                        <h3 className="text-sm font-bold text-gray-400 mt-6 mb-2">Eigene Sets</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableCustomSets.map((cs) => (
                                <div key={cs.name} className="relative group">
                                    <button onClick={() => handleSetToggle(cs.name)} className={`w-full p-3 rounded-md font-semibold text-sm text-left pr-8 truncate ${selectedSets.includes(cs.name) ? 'bg-indigo-500 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                                        {cs.name}
                                        {cs.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
                                    </button>
                                    <div className="absolute top-1/2 right-1.5 -translate-y-1/2">
                                        <button onClick={() => openSetModal(cs)} className="p-1 text-gray-300 hover:text-white bg-black/20 hover:bg-blue-500/50 rounded-full" aria-label={`Set ${cs.name} bearbeiten`}>
                                            <EditIcon/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
        <div className="w-full space-y-3">
            <button
                onClick={() => setIsInstructionsOpen(true)}
                className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
            >
                Anleitung
            </button>
            <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg shadow-pink-500/30 transform hover:scale-105 hover:shadow-pink-400/40">Mission starten</button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .accent-red-500 {
          accent-color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default AUSetupScreen;
