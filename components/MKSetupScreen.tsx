import React, { useState, useEffect, useRef } from 'react';
import { MK_MIN_PLAYERS, MK_MAX_PLAYERS } from '../constants';
import { CustomDilemmaSet, Dilemma } from '../types';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';
import InstructionsModal from './InstructionsModal';
import { MORAL_DILEMMAS_SETS } from '../games/moralischerKompassData';
import { useSettings } from './SettingsContext';

interface MKSetupScreenProps {
  onStartGame: (players: string[], selectedSets: string[], customDilemmaSets: CustomDilemmaSet[]) => void;
  onExit: () => void;
  initialSettings?: { playerNames: string[], selectedSets: string[] } | null;
}

// Icons
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

const MKSetupScreen: React.FC<MKSetupScreenProps> = ({ onStartGame, onExit, initialSettings }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const { show18PlusContent } = useSettings();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const sessionNames = consentGiven ? getSessionPlayerNames() : null;
  const storageErrorMsg = 'Speichern fehlgeschlagen: Dein Browser-Speicher ist möglicherweise voll oder blockiert.';

  const baseNames = initialSettings?.playerNames || sessionNames || [];

  let adjustedPlayerNames = [...baseNames];
  if (adjustedPlayerNames.length > MK_MAX_PLAYERS) {
    adjustedPlayerNames = adjustedPlayerNames.slice(0, MK_MAX_PLAYERS);
  } else if (adjustedPlayerNames.length < MK_MIN_PLAYERS) {
    const minToAdd = MK_MIN_PLAYERS - adjustedPlayerNames.length;
    for (let i = 0; i < minToAdd; i++) {
      adjustedPlayerNames.push(`Spieler ${adjustedPlayerNames.length + 1}`);
    }
  }

  if (adjustedPlayerNames.length === 0) {
    adjustedPlayerNames = Array(MK_MIN_PLAYERS).fill('').map((_, i) => `Spieler ${i + 1}`);
  }

  const initialPlayerCount = adjustedPlayerNames.length;
  
  const [playerCount, setPlayerCount] = useState<number>(initialPlayerCount);
  const [playerNames, setPlayerNames] = useState<string[]>(adjustedPlayerNames);

  const [customDilemmaSets, setCustomDilemmaSets] = useState<CustomDilemmaSet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<CustomDilemmaSet | null>(null);
  const [newSetName, setNewSetName] = useState('');
  
  const [newSetDilemmas, setNewSetDilemmas] = useState<Dilemma[]>([]);
  const [isAdultSet, setIsAdultSet] = useState(false);
  const [currentDilemmaText, setCurrentDilemmaText] = useState('');
  const [currentOptionA, setCurrentOptionA] = useState('');
  const [currentOptionB, setCurrentOptionB] = useState('');
  
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const setupContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const availableDefaultSets = MORAL_DILEMMAS_SETS.filter(set => show18PlusContent || !set.isAdult);
  const availableCustomSets = customDilemmaSets.filter(set => show18PlusContent || !set.isAdult);
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
            const stored = localStorage.getItem('moralischerKompassCustomSets');
            if (stored) setCustomDilemmaSets(JSON.parse(stored));
        } catch (error) {
            console.error("Failed to parse custom dilemma sets from localStorage", error);
        }
    } else {
        setCustomDilemmaSets([]);
    }
  }, [consentGiven]);

  const updatePlayerCount = (newCount: number) => {
    if (newCount < MK_MIN_PLAYERS || newCount > MK_MAX_PLAYERS) return;

    const currentCount = playerNames.length;
    let newPlayerNames = [...playerNames];

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        newPlayerNames.push(`Spieler ${i + 1}`);
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

  const openSetModal = (setToEdit: CustomDilemmaSet | null = null) => {
    setEditingSet(setToEdit);
    setNewSetName(setToEdit ? setToEdit.name : '');
    setNewSetDilemmas(setToEdit ? setToEdit.dilemmas : []);
    setIsAdultSet(setToEdit ? setToEdit.isAdult ?? false : false);
    setCurrentDilemmaText('');
    setCurrentOptionA('');
    setCurrentOptionB('');
    setIsModalOpen(true);
  };

  const handleAddDilemma = () => {
    const text = currentDilemmaText.trim();
    const optionA = currentOptionA.trim();
    const optionB = currentOptionB.trim();

    if (text && optionA && optionB) {
      if (newSetDilemmas.some(d => d.text.toLowerCase() === text.toLowerCase())) {
        addNotification('Dieses Dilemma existiert bereits in diesem Set.', 'info');
        return;
      }
      setNewSetDilemmas([...newSetDilemmas, { id: crypto.randomUUID(), text, optionA, optionB }]);
      setCurrentDilemmaText('');
      setCurrentOptionA('');
      setCurrentOptionB('');
    } else {
      addNotification('Bitte fülle alle drei Felder aus: Dilemma, Antwort A und Antwort B.');
    }
  };

  const handleRemoveDilemma = (idToRemove: string) => {
    setNewSetDilemmas(newSetDilemmas.filter(d => d.id !== idToRemove));
  };

  const handleSaveCustomSet = () => {
    const trimmedName = newSetName.trim();
    if (!trimmedName) { addNotification('Bitte gib einen Namen für das Set ein.'); return; }
    if (newSetDilemmas.length < 2) { addNotification('Bitte gib mindestens 2 Dilemmas ein.'); return; }
    
    const isNameTaken = customDilemmaSets.some(s => s.name.toLowerCase() === trimmedName.toLowerCase() && s.name.toLowerCase() !== editingSet?.name.toLowerCase());
    if (isNameTaken || MORAL_DILEMMAS_SETS.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
        addNotification('Ein Set mit diesem Namen existiert bereits.'); return;
    }

    const newSetData = { name: trimmedName, dilemmas: newSetDilemmas, isAdult: isAdultSet };
    let newCustomSets;
    if (editingSet) {
        newCustomSets = customDilemmaSets.map(s => s.name === editingSet.name ? newSetData : s);
        setSelectedSets(current => current.map(s => s === editingSet.name ? newSetData.name : s));
    } else {
        newCustomSets = [...customDilemmaSets, newSetData];
        if (!selectedSets.includes(newSetData.name)) {
            setSelectedSets(current => [...current, newSetData.name]);
        }
    }

    setCustomDilemmaSets(newCustomSets);
    if (consentGiven) {
        try {
            localStorage.setItem('moralischerKompassCustomSets', JSON.stringify(newCustomSets));
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

    const newCustomSets = customDilemmaSets.filter(s => s.name !== setToDelete);
    setCustomDilemmaSets(newCustomSets);
    if (consentGiven) {
        try {
            localStorage.setItem('moralischerKompassCustomSets', JSON.stringify(newCustomSets));
        } catch (e) {
            console.error(e);
            addNotification(storageErrorMsg, 'error');
        }
    }
    setSelectedSets(current => current.filter(s => s !== setToDelete));

    setSetToDelete(null);
  };

    const handleExportSet = (set: CustomDilemmaSet) => {
        const jsonString = JSON.stringify(set, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${set.name.replace(/\s/g, '_')}.MKSets`;
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
                
                if (typeof data.name !== 'string' || !Array.isArray(data.dilemmas)) {
                    let errorMsg = 'Fehler beim Importieren: Ungültiges Format für Moralischer Kompass.';
                    if (typeof data.name === 'string') {
                        if (Array.isArray(data.words)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Impostor Party" Set.';
                        else if (Array.isArray(data.locations)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Agenten Undercover" Set.';
                        else if (Array.isArray(data.wahrheit) && Array.isArray(data.pflicht)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Flaschendrehen" Set.';
                        else if (Array.isArray(data.stories)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Krimi Klub" Set.';
                        else if (Array.isArray(data.cards)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Wort-Akrobaten" Set.';
                    }
                    addNotification(errorMsg, 'error');
                    console.error("Invalid set format:", data);
                    return;
                }

                const set = data as CustomDilemmaSet;

                const existingIndex = customDilemmaSets.findIndex(s => s.name.toLowerCase() === set.name.toLowerCase());
                if (existingIndex !== -1) {
                    if (window.confirm(`Ein Set namens "${set.name}" existiert bereits. Überschreiben?`)) {
                        const newSets = [...customDilemmaSets];
                        newSets[existingIndex] = set;
                        setCustomDilemmaSets(newSets);
                        if (consentGiven) {
                            try {
                                localStorage.setItem('moralischerKompassCustomSets', JSON.stringify(newSets));
                            } catch (err) {
                                console.error(err);
                                addNotification(storageErrorMsg, 'error');
                            }
                        }
                    }
                } else {
                    const newSets = [...customDilemmaSets, set];
                    setCustomDilemmaSets(newSets);
                     if (consentGiven) {
                        try {
                            localStorage.setItem('moralischerKompassCustomSets', JSON.stringify(newSets));
                        } catch (err) {
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
        addNotification('Bitte gib allen Spielern einen Namen.');
        return;
    }
    if (selectedSets.length === 0) {
        addNotification('Bitte wähle mindestens ein Dilemma-Set aus.');
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
    onStartGame(trimmedNames, selectedSets, customDilemmaSets);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Moralischer Kompass"
            gradient="bg-gradient-to-br from-indigo-400 to-slate-400"
            buttonClass="bg-indigo-600 hover:bg-indigo-500"
            headingClass="[&_h3]:text-indigo-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
            <p>Findet heraus, wie eure Freunde bei moralischen Zwickmühlen entscheiden würden und diskutiert eure unterschiedlichen Ansichten.</p>

            <h3 className="text-xl font-bold pt-4">Ablauf</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>Das Dilemma:</strong> Ein moralisches Dilemma mit zwei Antwortmöglichkeiten (A oder B) wird allen angezeigt. Lest es euch gut durch und denkt über eure Wahl nach.</li>
                <li><strong>Geheime Abstimmung:</strong> Das Gerät wird herumgereicht. Jeder Spieler wählt geheim seine Antwort (A oder B). Niemand sieht die Wahl der anderen.</li>
                <li><strong>Das Ergebnis:</strong> Nachdem alle abgestimmt haben, wird das Gesamtergebnis angezeigt (z.B. 3 Stimmen für A, 5 für B).</li>
                <li><strong>Diskussion:</strong> Jetzt wird's interessant! Diskutiert, warum ihr so entschieden habt. Wer hat für was gestimmt? Versucht, die Entscheidungen der anderen zu erraten und eure eigenen zu rechtfertigen.</li>
            </ol>
        </InstructionsModal>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg space-y-4 border border-gray-700">
                <h2 className="text-2xl font-bold text-indigo-400">{editingSet ? 'Set bearbeiten' : 'Eigenes Dilemma-Set erstellen'}</h2>
                <input type="text" placeholder="Set-Name" value={newSetName} onChange={e => setNewSetName(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                
                <div className="space-y-3 bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-300">Neues Dilemma hinzufügen (mind. 2 pro Set)</h3>
                    <textarea placeholder="Dilemma-Text..." value={currentDilemmaText} onChange={(e) => setCurrentDilemmaText(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Antwort A (z.B. Ja)" value={currentOptionA} onChange={(e) => setCurrentOptionA(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <input type="text" placeholder="Antwort B (z.B. Nein)" value={currentOptionB} onChange={(e) => setCurrentOptionB(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <button onClick={handleAddDilemma} className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-500 flex items-center justify-center" aria-label="Dilemma hinzufügen"><PlusIcon /></button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 h-48 overflow-y-auto">
                    {newSetDilemmas.length === 0 ? <p className="text-gray-500 text-center py-4">Füge das erste Dilemma hinzu.</p> : newSetDilemmas.map((dilemma) => (
                        <div key={dilemma.id} className="flex items-start justify-between bg-gray-700 p-2 rounded-md animate-fade-in">
                            <span className="text-white text-sm break-words pr-2">{dilemma.text}</span>
                            <button onClick={() => handleRemoveDilemma(dilemma.id)} className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/20 flex-shrink-0" aria-label={`Dilemma entfernen`}><TrashIcon /></button>
                        </div>
                    ))}
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
                        <button onClick={handleSaveCustomSet} className="px-6 py-2 rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-500">Speichern</button>
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
        <button onClick={onExit} className="absolute top-5 left-5 p-2 rounded-full bg-gray-700 hover:bg-gray-600 z-10" aria-label="Zurück zum Hauptmenü">
            <BackIcon />
        </button>
        <div className="text-center">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-slate-400">Moralischer Kompass</h1>
            <p className="text-gray-400 mt-2">Wie entscheidest du dich?</p>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Anzahl Spieler</label>
                <div className="flex items-center justify-center bg-gray-700 rounded-md">
                    <button onClick={handleDecrement} disabled={playerCount <= MK_MIN_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-l-md hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">-</button>
                    <span className="flex-grow text-center text-2xl font-bold text-white tabular-nums">{playerCount}</span>
                    <button onClick={handleIncrement} disabled={playerCount >= MK_MAX_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-r-md hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">+</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Namen der Spieler</label>
                <div className="space-y-3">
                    {playerNames.map((name, index) => (
                        <div key={index} className="flex items-center">
                           <UserIcon />
                           <input type="text" placeholder={`Spieler ${index + 1}`} value={name} onChange={(e) => handlePlayerNameChange(index, e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 pl-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Dilemma-Sets wählen</label>
                {consentGiven && (
                 <div className="flex space-x-2 mb-3">
                    <button onClick={() => openSetModal(null)} className="flex-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-indigo-500 transition-colors">Set erstellen</button>
                    <button onClick={() => importFileRef.current?.click()} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"><ImportIcon/> Import</button>
                    <input type="file" ref={importFileRef} onChange={handleImportSet} style={{ display: 'none' }} accept=".MKSets" />
                 </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {availableDefaultSets.map((s) => (
                        <button key={s.name} onClick={() => handleSetToggle(s.name)} className={`w-full p-3 rounded-md font-semibold text-sm transition-all duration-200 ${selectedSets.includes(s.name) ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                            {s.name}
                            {s.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
                        </button>
                    ))}
                     {consentGiven && availableCustomSets.map((cs) => (
                        <div key={cs.name} className="relative group">
                            <button onClick={() => handleSetToggle(cs.name)} className={`w-full p-3 rounded-md font-semibold text-sm text-left pr-8 truncate ${selectedSets.includes(cs.name) ? 'bg-purple-500 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-purple-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
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
            </div>
        </div>
        <div className="w-full space-y-3">
            <button
                onClick={() => setIsInstructionsOpen(true)}
                className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
            >
                Anleitung
            </button>
            <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-indigo-500 to-slate-700 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105 hover:shadow-indigo-400/40">
                Spiel starten
            </button>
        </div>
      </div>
       <style>{`
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .accent-red-500 {
          accent-color: #ef4444;
        }
       `}</style>
    </div>
  );
};

export default MKSetupScreen;
