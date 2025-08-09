import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FD_MIN_PLAYERS, FD_MAX_PLAYERS } from '../constants';
import { CustomTruthOrDareSet } from '../types';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';
import InstructionsModal from './InstructionsModal';
import { TRUTH_OR_DARE_SETS } from '../games/flaschendrehenData';
import { useSettings } from './SettingsContext';

interface FlaschendrehenSetupScreenProps {
  onStartGame: (players: string[], categories: string[], customSets: CustomTruthOrDareSet[]) => void;
  onExit: () => void;
  initialSettings?: { playerNames: string[], categories: string[] } | null;
}

// Icons
const UserIcon=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>);
const BackIcon=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const PlusIcon=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>);
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

const FlaschendrehenSetupScreen: React.FC<FlaschendrehenSetupScreenProps> = ({ onStartGame, onExit, initialSettings }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const { show18PlusContent } = useSettings();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const sessionNames = consentGiven ? getSessionPlayerNames() : null;
  const storageErrorMsg = 'Speichern fehlgeschlagen: Dein Browser-Speicher ist möglicherweise voll oder blockiert.';
  
  const baseNames = initialSettings?.playerNames || sessionNames || [];

  let adjustedPlayerNames = [...baseNames];
  if (adjustedPlayerNames.length > FD_MAX_PLAYERS) {
    adjustedPlayerNames = adjustedPlayerNames.slice(0, FD_MAX_PLAYERS);
  } else if (adjustedPlayerNames.length < FD_MIN_PLAYERS) {
    const minToAdd = FD_MIN_PLAYERS - adjustedPlayerNames.length;
    for (let i = 0; i < minToAdd; i++) {
      adjustedPlayerNames.push(`Spieler ${adjustedPlayerNames.length + 1}`);
    }
  }
  
  if (adjustedPlayerNames.length === 0) {
      adjustedPlayerNames = Array(FD_MIN_PLAYERS).fill('').map((_, i) => `Spieler ${i + 1}`);
  }

  const initialPlayerCount = adjustedPlayerNames.length;

  const [playerCount, setPlayerCount] = useState<number>(initialPlayerCount);
  const [playerNames, setPlayerNames] = useState<string[]>(adjustedPlayerNames);
  const [customTaskSets, setCustomTaskSets] = useState<CustomTruthOrDareSet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<CustomTruthOrDareSet | null>(null);
  const [newSetName, setNewSetName] = useState('');
  const [newTruths, setNewTruths] = useState<string[]>([]);
  const [newDares, setNewDares] = useState<string[]>([]);
  const [isAdultSet, setIsAdultSet] = useState(false);
  const [currentTruthInput, setCurrentTruthInput] = useState('');
  const [currentDareInput, setCurrentDareInput] = useState('');
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const setupContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const availableDefaultSets = useMemo(() => {
    return TRUTH_OR_DARE_SETS.filter(set => show18PlusContent || !set.isAdult);
  }, [show18PlusContent]);

  const [categories, setCategories] = useState<string[]>(initialSettings?.categories || [availableDefaultSets[1].name]);
  const availableCustomSets = customTaskSets.filter(set => show18PlusContent || !set.isAdult);

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
          const stored = localStorage.getItem('flaschendrehenCustomTaskSets');
          if (stored) setCustomTaskSets(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse custom task sets from localStorage", error);
        }
    } else {
        setCustomTaskSets([]);
    }
  }, [consentGiven]);

  const updatePlayerCount = (newCount: number) => {
    if (newCount < FD_MIN_PLAYERS || newCount > FD_MAX_PLAYERS) return;
    const currentCount = playerNames.length;
    let newPlayerNames = [...playerNames];
    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) newPlayerNames.push(`Spieler ${i + 1}`);
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
  const handleCategoryToggle = (cat: string) => {
    setCategories(current => current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat]);
  };
  
  const openSetModal = (setToEdit: CustomTruthOrDareSet | null = null) => {
    setEditingSet(setToEdit);
    setNewSetName(setToEdit ? setToEdit.name : '');
    setNewTruths(setToEdit ? setToEdit.wahrheit : []);
    setNewDares(setToEdit ? setToEdit.pflicht : []);
    setIsAdultSet(setToEdit ? setToEdit.isAdult ?? false : false);
    setCurrentTruthInput('');
    setCurrentDareInput('');
    setIsModalOpen(true);
  };

  const handleAddTask = (type: 'wahrheit' | 'pflicht') => {
    if (type === 'wahrheit') {
      const task = currentTruthInput.trim();
      if (task && !newTruths.includes(task)) {
        setNewTruths([...newTruths, task]);
        setCurrentTruthInput('');
      }
    } else {
      const task = currentDareInput.trim();
      if (task && !newDares.includes(task)) {
        setNewDares([...newDares, task]);
        setCurrentDareInput('');
      }
    }
  };
  const handleRemoveTask = (type: 'wahrheit' | 'pflicht', index: number) => {
    if (type === 'wahrheit') {
      setNewTruths(newTruths.filter((_, i) => i !== index));
    } else {
      setNewDares(newDares.filter((_, i) => i !== index));
    }
  };

  const handleSaveCustomSet = () => {
    const trimmedName = newSetName.trim();
    if (!trimmedName) { addNotification('Bitte gib einen Namen für das Set ein.'); return; }
    if (newTruths.length < 1 || newDares.length < 1) { addNotification('Bitte gib mindestens 1 Wahrheitsfrage und 1 Pflichtaufgabe ein.'); return; }
    
    const isNameTaken = customTaskSets.some(s => s.name.toLowerCase() === trimmedName.toLowerCase() && s.name.toLowerCase() !== editingSet?.name.toLowerCase());
    if (isNameTaken || TRUTH_OR_DARE_SETS.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
        addNotification('Ein Set mit diesem Namen existiert bereits.'); return;
    }
    
    const newSetData = { name: trimmedName, wahrheit: newTruths, pflicht: newDares, isAdult: isAdultSet };
    let newCustomSets;
    if (editingSet) {
        newCustomSets = customTaskSets.map(s => s.name === editingSet.name ? newSetData : s);
        setCategories(current => current.map(c => c === editingSet.name ? newSetData.name : c));
    } else {
        newCustomSets = [...customTaskSets, newSetData];
        if (!categories.includes(newSetData.name)) {
            setCategories(current => [...current, newSetData.name]);
        }
    }

    setCustomTaskSets(newCustomSets);
    if (consentGiven) {
        try {
            localStorage.setItem('flaschendrehenCustomTaskSets', JSON.stringify(newCustomSets));
        } catch (e) {
            console.error(e);
            addNotification(storageErrorMsg, 'error');
        }
    }
    setIsModalOpen(false);
    setEditingSet(null);
  };

  const handleDeleteCustomSet = (setName: string) => {
    if (categories.length === 1 && categories[0] === setName) { addNotification("Du kannst nicht das letzte ausgewählte Set löschen.", 'info'); return; }
    setSetToDelete(setName);
  };
  const confirmDeleteSet = () => {
    if (!setToDelete) return;
    const newCustomSets = customTaskSets.filter(s => s.name !== setToDelete);
    setCustomTaskSets(newCustomSets);
    if (consentGiven) {
        try {
            localStorage.setItem('flaschendrehenCustomTaskSets', JSON.stringify(newCustomSets));
        } catch (e) {
            console.error(e);
            addNotification(storageErrorMsg, 'error');
        }
    }
    setCategories(current => current.filter(s => s !== setToDelete));
    setSetToDelete(null);
  };
  
    const handleExportSet = (set: CustomTruthOrDareSet) => {
        const jsonString = JSON.stringify(set, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${set.name.replace(/\s/g, '_')}.FDSets`;
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

                if (typeof data.name !== 'string' || !Array.isArray(data.wahrheit) || !Array.isArray(data.pflicht)) {
                    let errorMsg = 'Fehler beim Importieren: Ungültiges Format für Flaschendrehen.';
                    if (typeof data.name === 'string') {
                        if (Array.isArray(data.words)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Impostor Party" Set.';
                        else if (Array.isArray(data.locations)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Agenten Undercover" Set.';
                        else if (Array.isArray(data.dilemmas)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Moralischer Kompass" Set.';
                        else if (Array.isArray(data.stories)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Krimi Klub" Set.';
                        else if (Array.isArray(data.cards)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Wort-Akrobaten" Set.';
                    }
                    addNotification(errorMsg, 'error');
                    console.error("Invalid set format:", data);
                    return;
                }

                const set = data as CustomTruthOrDareSet;

                const existingIndex = customTaskSets.findIndex(s => s.name.toLowerCase() === set.name.toLowerCase());
                if (existingIndex !== -1) {
                    if (window.confirm(`Ein Set namens "${set.name}" existiert bereits. Überschreiben?`)) {
                        const newSets = [...customTaskSets];
                        newSets[existingIndex] = set;
                        setCustomTaskSets(newSets);
                        if (consentGiven) {
                            try {
                                localStorage.setItem('flaschendrehenCustomTaskSets', JSON.stringify(newSets));
                            } catch(err) {
                                console.error(err);
                                addNotification(storageErrorMsg, 'error');
                            }
                        }
                    }
                } else {
                    const newSets = [...customTaskSets, set];
                    setCustomTaskSets(newSets);
                    if (consentGiven) {
                        try {
                            localStorage.setItem('flaschendrehenCustomTaskSets', JSON.stringify(newSets));
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
    if (trimmedNames.length !== playerCount) { addNotification('Bitte gib allen Spielern einen Namen.'); return; }
    if (categories.length === 0) { addNotification('Bitte wähle mindestens eine Kategorie aus.'); return; }
    
    setIsConsentModalOpen(true);
  };

  const confirmAndStartGame = () => {
    setIsConsentModalOpen(false);
    const trimmedNames = playerNames.map(name => name.trim()).filter(name => name);
    if (consentGiven) {
        try {
            sessionStorage.setItem('globalPlayerNames', JSON.stringify(trimmedNames));
        } catch (e) {
            console.error("Failed to save player names to session storage", e);
            addNotification('Spielernamen konnten nicht für die Sitzung gespeichert werden.', 'info');
        }
    }
    onStartGame(trimmedNames, categories, customTaskSets);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Flaschendrehen"
            gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
            buttonClass="bg-orange-600 hover:bg-orange-500"
            headingClass="[&_h3]:text-orange-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
            <p>Habt Spaß und lernt euch besser kennen! Der klassische Party-Hit neu aufgelegt.</p>

            <h3 className="text-xl font-bold pt-4">Ablauf</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>Flasche drehen:</strong> Ein Spieler tippt auf "Drehen!", um die virtuelle Flasche in Bewegung zu setzen.</li>
                <li><strong>Auswahl:</strong> Die Person, auf die die Flasche zeigt, ist an der Reihe und muss zwischen "Wahrheit" und "Pflicht" wählen.</li>
                <li><strong>Aufgabe:</strong> Der Spieler erhält eine zufällige Frage oder Aufgabe aus den zuvor ausgewählten Kategorien und muss sie vor der Gruppe erfüllen.</li>
                <li><strong>Nächste Runde:</strong> Sobald die Aufgabe erledigt ist, kann die nächste Runde beginnen und die Flasche wird erneut gedreht.</li>
            </ol>
            <h3 className="text-xl font-bold pt-4">Wichtiger Hinweis: Respekt & Wohlbefinden</h3>
            <div className="bg-orange-900/30 border border-orange-500/50 p-3 rounded-lg mt-2 text-orange-100">
              <p>
                <strong>Niemand darf zu etwas gezwungen werden!</strong> Wenn sich ein Spieler mit einer Frage oder Aufgabe unwohl fühlt, hat er oder sie das Recht, abzulehnen. Dies muss von allen respektiert werden. Der Spaß und das Wohlbefinden aller stehen an erster Stelle.
              </p>
            </div>
        </InstructionsModal>

        {isConsentModalOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md space-y-4 border border-orange-500/50 text-center">
                    <h2 className="text-2xl font-bold text-orange-400">Wichtiger Hinweis</h2>
                    <div className="text-orange-100 text-left">
                        <p className="font-bold text-lg">Respekt & Wohlbefinden</p>
                        <p className="mt-2">
                            <strong>Niemand darf zu etwas gezwungen werden!</strong> Wenn sich ein Spieler mit einer Frage oder Aufgabe unwohl fühlt, hat er oder sie das Recht, abzulehnen. Dies muss von allen respektiert werden. Der Spaß und das Wohlbefinden aller stehen an erster Stelle.
                        </p>
                    </div>
                    <div className="flex justify-center pt-4">
                        <button onClick={confirmAndStartGame} className="px-8 py-3 rounded-md font-semibold bg-orange-600 text-white hover:bg-orange-500 transition-colors">
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl space-y-4 border border-gray-700">
                <h2 className="text-2xl font-bold text-orange-400">{editingSet ? 'Set bearbeiten' : 'Eigenes Aufgaben-Set erstellen'}</h2>
                <input type="text" placeholder="Set-Name" value={newSetName} onChange={e => setNewSetName(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Wahrheitsfragen */}
                    <div>
                        <h3 className="text-lg font-bold text-blue-400 mb-2">Wahrheit (min. 1)</h3>
                        <div className="flex space-x-2">
                            <input type="text" placeholder="Neue Frage..." value={currentTruthInput} onChange={e => setCurrentTruthInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask('wahrheit'); } }} className="flex-grow bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={() => handleAddTask('wahrheit')} className="bg-blue-600 p-3 rounded-md hover:bg-blue-500"><PlusIcon /></button>
                        </div>
                        <div className="mt-2 bg-gray-900/50 rounded-lg p-3 space-y-2 h-48 overflow-y-auto">
                            {newTruths.map((task, i) => (
                                <div key={i} className="flex items-start justify-between bg-gray-700 p-2 rounded-md animate-fade-in">
                                    <span className="text-white text-sm break-words pr-2">{task}</span>
                                    <button onClick={() => handleRemoveTask('wahrheit', i)} className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/20 flex-shrink-0"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Pflichtaufgaben */}
                    <div>
                        <h3 className="text-lg font-bold text-red-400 mb-2">Pflicht (min. 1)</h3>
                        <div className="flex space-x-2">
                            <input type="text" placeholder="Neue Aufgabe..." value={currentDareInput} onChange={e => setCurrentDareInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask('pflicht'); } }} className="flex-grow bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
                            <button onClick={() => handleAddTask('pflicht')} className="bg-red-600 p-3 rounded-md hover:bg-red-500"><PlusIcon /></button>
                        </div>
                        <div className="mt-2 bg-gray-900/50 rounded-lg p-3 space-y-2 h-48 overflow-y-auto">
                            {newDares.map((task, i) => (
                                <div key={i} className="flex items-start justify-between bg-gray-700 p-2 rounded-md animate-fade-in">
                                    <span className="text-white text-sm break-words pr-2">{task}</span>
                                    <button onClick={() => handleRemoveTask('pflicht', i)} className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/20 flex-shrink-0"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
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
                        <button onClick={handleSaveCustomSet} className="px-6 py-2 rounded-md font-semibold bg-orange-600 text-white hover:bg-orange-500">Speichern</button>
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
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-yellow-400 to-orange-500">Flaschendrehen</h1>
            <p className="text-gray-400 mt-2">Wahrheit oder Pflicht?</p>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Anzahl Spieler</label>
                <div className="flex items-center justify-center bg-gray-700 rounded-md">
                    <button onClick={handleDecrement} disabled={playerCount <= FD_MIN_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-l-md hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">-</button>
                    <span className="flex-grow text-center text-2xl font-bold text-white tabular-nums">{playerCount}</span>
                    <button onClick={handleIncrement} disabled={playerCount >= FD_MAX_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-r-md hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">+</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Namen der Spieler</label>
                <div className="space-y-3">
                    {playerNames.map((name, index) => (
                        <div key={index} className="flex items-center">
                           <UserIcon />
                           <input type="text" placeholder={`Spieler ${index + 1}`} value={name} onChange={(e) => handlePlayerNameChange(index, e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 pl-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Aufgaben-Kategorien</label>
                {consentGiven && (
                    <div className="flex space-x-2 mb-3">
                        <button onClick={() => openSetModal(null)} className="flex-1 bg-orange-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-orange-500 transition-colors">Set erstellen</button>
                        <button onClick={() => importFileRef.current?.click()} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"><ImportIcon /> Import</button>
                        <input type="file" ref={importFileRef} onChange={handleImportSet} style={{ display: 'none' }} accept=".FDSets" />
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {availableDefaultSets.map((set) => (
                        <button key={set.name} onClick={() => handleCategoryToggle(set.name)} className={`w-full p-3 rounded-md font-semibold text-sm transition-all ${categories.includes(set.name) ? 'bg-orange-500 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-orange-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                            {set.name}
                            {set.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
                        </button>
                    ))}
                    {consentGiven && availableCustomSets.map((cs) => (
                        <div key={cs.name} className="relative group col-span-1">
                            <button onClick={() => handleCategoryToggle(cs.name)} className={`w-full p-3 rounded-md font-semibold text-sm text-left pr-8 truncate ${categories.includes(cs.name) ? 'bg-indigo-500 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
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
            <button onClick={() => setIsInstructionsOpen(true)} className="w-full bg-gray-700 text-gray-300 font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors">
                Anleitung
            </button>
            <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg shadow-orange-500/30 transform hover:scale-105 hover:shadow-orange-400/40">
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
export default FlaschendrehenSetupScreen;
