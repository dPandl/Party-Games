import React, { useState, useEffect, useRef } from 'react';
import { MIN_PLAYERS, MAX_PLAYERS, DEFAULT_DISCUSSION_TIME_SECONDS, getDefaultImpostorCount, getMaxImpostors } from '../constants';
import { GameSettings, CustomTheme } from '../types';
import { IMPOSTOR_THEMES } from '../games/impostorPartyData';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';
import InstructionsModal from './InstructionsModal';
import { useSettings } from './SettingsContext';

interface SetupScreenProps {
  onStartGame: (players: string[], impostorCount: number, themes: string[], discussionTime: number, withVoting: boolean, giveImpostorHint: boolean, customThemes: CustomTheme[]) => void;
  onExit: () => void;
  initialSettings?: GameSettings | null;
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

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, onExit, initialSettings }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const { show18PlusContent } = useSettings();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const sessionNames = consentGiven ? getSessionPlayerNames() : null;
  const storageErrorMsg = 'Speichern fehlgeschlagen: Dein Browser-Speicher ist möglicherweise voll oder blockiert.';
  
  const baseNames = initialSettings?.playerNames || sessionNames || [];

  let adjustedPlayerNames = [...baseNames];
  if (adjustedPlayerNames.length > MAX_PLAYERS) {
    adjustedPlayerNames = adjustedPlayerNames.slice(0, MAX_PLAYERS);
  } else if (adjustedPlayerNames.length < MIN_PLAYERS) {
    const minToAdd = MIN_PLAYERS - adjustedPlayerNames.length;
    for (let i = 0; i < minToAdd; i++) {
      adjustedPlayerNames.push(`Spieler ${adjustedPlayerNames.length + 1}`);
    }
  }
  
  if (adjustedPlayerNames.length === 0) {
      adjustedPlayerNames = Array(MIN_PLAYERS).fill('').map((_, i) => `Spieler ${i + 1}`);
  }

  const initialPlayerCount = adjustedPlayerNames.length;
  
  const [playerCount, setPlayerCount] = useState<number>(initialPlayerCount);
  
  const [impostorCount, setImpostorCount] = useState<number>(() => {
    if (initialSettings?.impostorCount && initialSettings.impostorCount <= getMaxImpostors(initialPlayerCount)) {
      return initialSettings.impostorCount;
    }
    return getDefaultImpostorCount(initialPlayerCount);
  });
  
  const [playerNames, setPlayerNames] = useState<string[]>(adjustedPlayerNames);
  const [themes, setThemes] = useState<string[]>(initialSettings?.themes || [IMPOSTOR_THEMES[0].name]);
  const [discussionTime, setDiscussionTime] = useState<number>((initialSettings?.discussionTime || DEFAULT_DISCUSSION_TIME_SECONDS) / 60);
  const [withVoting, setWithVoting] = useState(initialSettings?.withVoting ?? true);
  const [giveImpostorHint, setGiveImpostorHint] = useState(initialSettings?.giveImpostorHint ?? false);
  
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeWords, setNewThemeWords] = useState<string[]>([]);
  const [isAdultTheme, setIsAdultTheme] = useState(false);
  const [currentWordInput, setCurrentWordInput] = useState('');
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const setupContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const availableDefaultThemes = IMPOSTOR_THEMES.filter(theme => show18PlusContent || !theme.isAdult);
  const availableCustomThemes = customThemes.filter(theme => show18PlusContent || !theme.isAdult);

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
            const stored = localStorage.getItem('impostorCustomThemes');
            if (stored) {
                setCustomThemes(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to parse custom themes from localStorage", error);
        }
    } else {
        setCustomThemes([]);
    }
  }, [consentGiven]);

  const updatePlayerCount = (newCount: number) => {
    if (newCount < MIN_PLAYERS || newCount > MAX_PLAYERS) {
      return;
    }

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

    const maxImpostors = getMaxImpostors(newCount);
    if (impostorCount > maxImpostors) {
      setImpostorCount(maxImpostors);
    }
  };
  
    useEffect(() => {
        const maxImpostors = getMaxImpostors(playerCount);
        if (impostorCount > maxImpostors) {
            setImpostorCount(maxImpostors);
        } else if (!initialSettings) { 
            setImpostorCount(getDefaultImpostorCount(playerCount));
        }
    }, [playerCount, initialSettings]);


  const handleDecrement = () => updatePlayerCount(playerCount - 1);
  const handleIncrement = () => updatePlayerCount(playerCount + 1);

  const handleImpostorDecrement = () => setImpostorCount(c => Math.max(1, c - 1));
  const handleImpostorIncrement = () => setImpostorCount(c => Math.min(getMaxImpostors(playerCount), c + 1));

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscussionTime(parseInt(e.target.value, 10));
  };
  
  const handleThemeToggle = (t: string) => {
    setThemes(current => current.includes(t) ? current.filter(theme => theme !== t) : [...current, t]);
  };
  
  const allThemeNames = [...availableDefaultThemes.map(t => t.name), ...availableCustomThemes.map(t => t.name)];

  const handleToggleAllThemes = () => {
    if (themes.length === allThemeNames.length) {
      setThemes([]);
    } else {
      setThemes(allThemeNames);
    }
  };

  const openThemeModal = (themeToEdit: CustomTheme | null = null) => {
    setEditingTheme(themeToEdit);
    setNewThemeName(themeToEdit ? themeToEdit.name : '');
    setNewThemeWords(themeToEdit ? themeToEdit.words : []);
    setIsAdultTheme(themeToEdit ? themeToEdit.isAdult ?? false : false);
    setCurrentWordInput('');
    setIsModalOpen(true);
  };

  const handleAddWord = () => {
    const word = currentWordInput.trim();
    if (word && !newThemeWords.includes(word)) {
        setNewThemeWords([...newThemeWords, word]);
        setCurrentWordInput('');
    }
  };

  const handleRemoveWord = (indexToRemove: number) => {
    setNewThemeWords(newThemeWords.filter((_, index) => index !== indexToRemove));
  };


  const handleSaveCustomTheme = () => {
    const trimmedName = newThemeName.trim();
    if (!trimmedName) { addNotification('Bitte gib einen Namen für das Thema ein.'); return; }
    if (newThemeWords.length < 3) { addNotification('Bitte gib mindestens 3 Begriffe ein.'); return; }
    
    const isNameTaken = customThemes.some(t => t.name.toLowerCase() === trimmedName.toLowerCase() && t.name.toLowerCase() !== editingTheme?.name.toLowerCase());
    if (isNameTaken || IMPOSTOR_THEMES.some(t => t.name.toLowerCase() === trimmedName.toLowerCase())) {
        addNotification('Ein Thema mit diesem Namen existiert bereits.');
        return;
    }

    const newThemeData = { name: trimmedName, words: newThemeWords, isAdult: isAdultTheme };
    let newCustomThemes;
    if (editingTheme) {
        newCustomThemes = customThemes.map(t => t.name === editingTheme.name ? newThemeData : t);
        setThemes(currentThemes => currentThemes.map(t => t === editingTheme.name ? newThemeData.name : t));
    } else {
        newCustomThemes = [...customThemes, newThemeData];
        if (!themes.includes(newThemeData.name)) {
            setThemes(currentThemes => [...currentThemes, newThemeData.name]);
        }
    }

    setCustomThemes(newCustomThemes);
    if (consentGiven) {
        try {
            localStorage.setItem('impostorCustomThemes', JSON.stringify(newCustomThemes));
        } catch (e) {
            console.error(e);
            addNotification(storageErrorMsg, 'error');
        }
    }
    setIsModalOpen(false);
    setEditingTheme(null);
  };
  
  const handleDeleteCustomTheme = (themeNameToDelete: string) => {
    if (themes.length === 1 && themes[0] === themeNameToDelete) {
        addNotification("Du kannst nicht das letzte ausgewählte Thema löschen.", 'info');
        return;
    }
    setThemeToDelete(themeNameToDelete);
  };

  const confirmDeleteTheme = () => {
    if (!themeToDelete) return;
    const newCustomThemes = customThemes.filter(t => t.name !== themeToDelete);
    setCustomThemes(newCustomThemes);
    if (consentGiven) {
        try {
            localStorage.setItem('impostorCustomThemes', JSON.stringify(newCustomThemes));
        } catch (e) {
            console.error(e);
            addNotification(storageErrorMsg, 'error');
        }
    }
    setThemes(currentThemes => currentThemes.filter(t => t !== themeToDelete));
    setThemeToDelete(null); // Close modal
  };

  const handleExportTheme = (theme: CustomTheme) => {
    const jsonString = JSON.stringify(theme, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.replace(/\s/g, '_')}.IPSets`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);

            if (typeof data.name !== 'string' || !Array.isArray(data.words)) {
                let errorMsg = 'Fehler beim Importieren: Die Datei hat ein ungültiges Format für Impostor Party.';
                if (typeof data.name === 'string') {
                    if (Array.isArray(data.locations)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Agenten Undercover" Set.';
                    else if (Array.isArray(data.wahrheit) && Array.isArray(data.pflicht)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Flaschendrehen" Set.';
                    else if (Array.isArray(data.dilemmas)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Moralischer Kompass" Set.';
                    else if (Array.isArray(data.stories)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Krimi Klub" Set.';
                    else if (Array.isArray(data.cards)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Wort-Akrobaten" Set.';
                }
                addNotification(errorMsg, 'error');
                console.error("Invalid theme format:", data);
                return;
            }

            const theme = data as CustomTheme;

            const existingIndex = customThemes.findIndex(t => t.name.toLowerCase() === theme.name.toLowerCase());
            if (existingIndex !== -1) {
                if (window.confirm(`Ein Thema namens "${theme.name}" existiert bereits. Möchtest du es überschreiben?`)) {
                    const newCustomThemes = [...customThemes];
                    newCustomThemes[existingIndex] = theme;
                    setCustomThemes(newCustomThemes);
                    if (consentGiven) {
                       try {
                           localStorage.setItem('impostorCustomThemes', JSON.stringify(newCustomThemes));
                       } catch (err) {
                           console.error(err);
                           addNotification(storageErrorMsg, 'error');
                       }
                    }
                }
            } else {
                const newCustomThemes = [...customThemes, theme];
                setCustomThemes(newCustomThemes);
                if (consentGiven) {
                    try {
                        localStorage.setItem('impostorCustomThemes', JSON.stringify(newCustomThemes));
                    } catch (err) {
                        console.error(err);
                        addNotification(storageErrorMsg, 'error');
                    }
                }
            }
        } catch (error) {
            addNotification('Fehler beim Importieren: Datei ist nicht korrekt formatiert.', 'error');
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
    if (themes.length === 0) {
        addNotification('Bitte wähle mindestens ein Thema aus.');
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
    onStartGame(trimmedNames, impostorCount, themes, discussionTime * 60, withVoting, giveImpostorHint, customThemes);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Impostor Party"
            gradient="bg-gradient-to-br from-teal-400 to-blue-500"
            buttonClass="bg-teal-600 hover:bg-teal-500"
            headingClass="[&_h3]:text-teal-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
            <p>Die Spieler (Crew) müssen den oder die Impostor entlarven, die das geheime Wort nicht kennen. Die Impostor gewinnen, wenn sie unentdeckt bleiben oder die Crew so verwirren, dass sie einen Unschuldigen rauswirft.</p>

            <h3 className="text-xl font-bold pt-4">Ablauf</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>Rollenverteilung:</strong> Jeder Spieler bekommt geheim eine Rolle. Crew-Mitglieder sehen ein geheimes Wort (z.B. "Pizza"). Impostor sehen nur "Impostor". Optional kann dem Impostor die Kategorie als Hinweis angezeigt werden.</li>
                <li><strong>Diskussion:</strong> Reihum beschreibt jeder Spieler das geheime Wort mit nur einem oder wenigen Worten. <strong>Wichtig:</strong> Nenne niemals das Wort selbst! Der Impostor muss clever bluffen und so tun, als würde er das Wort kennen.</li>
                <li><strong>Abstimmung (optional):</strong> Nach der Diskussion stimmt ihr ab, wer verdächtig ist. Der Spieler mit den meisten Stimmen scheidet aus.</li>
                <li><strong>Auflösung:</strong> Die wahren Rollen werden aufgedeckt. Hat die Crew den Impostor erwischt? Oder konnte der Impostor alle täuschen?</li>
            </ol>
        </InstructionsModal>

      {/* Create/Edit Theme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg space-y-4 border border-gray-700">
                <h2 className="text-2xl font-bold text-blue-400">{editingTheme ? 'Thema bearbeiten' : 'Eigenes Thema erstellen'}</h2>
                <input
                    type="text"
                    placeholder="Themenname"
                    value={newThemeName}
                    onChange={e => setNewThemeName(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Begriffe (mind. 3)</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Neuen Begriff hinzufügen..."
                            value={currentWordInput}
                            onChange={(e) => setCurrentWordInput(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddWord(); } }}
                            className="flex-grow w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            onClick={handleAddWord}
                            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-500 transition-colors flex-shrink-0"
                            aria-label="Begriff hinzufügen"
                        >
                            <PlusIcon />
                        </button>
                    </div>

                    <div className="mt-4 bg-gray-900/50 rounded-lg p-3 space-y-2 h-48 overflow-y-auto">
                        {newThemeWords.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Füge den ersten Begriff hinzu.</p>
                        ) : (
                            newThemeWords.map((word, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md animate-fade-in">
                                    <span className="text-white">{word}</span>
                                    <button 
                                        onClick={() => handleRemoveWord(index)} 
                                        className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/20"
                                        aria-label={`Begriff ${word} entfernen`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <input
                        type="checkbox"
                        checked={isAdultTheme}
                        onChange={e => setIsAdultTheme(e.target.checked)}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-600 accent-red-500"
                    />
                    <span className="text-gray-300">Dieses Thema enthält Inhalte für Erwachsene (18+).</span>
                </label>

                <div className="flex justify-between items-center">
                    <div>
                        {editingTheme && (
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => handleExportTheme(editingTheme)} 
                                    className="p-3 rounded-md bg-green-700 text-white hover:bg-green-600 transition-colors flex items-center justify-center"
                                    aria-label="Thema exportieren"
                                >
                                    <ExportIcon />
                                </button>
                                <button 
                                    onClick={() => {
                                        if (editingTheme) {
                                            setIsModalOpen(false);
                                            handleDeleteCustomTheme(editingTheme.name);
                                        }
                                    }} 
                                    className="p-3 rounded-md bg-red-700 text-white hover:bg-red-600 transition-colors flex items-center justify-center"
                                    aria-label="Thema löschen"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-md font-semibold text-gray-300 hover:bg-gray-600 transition-colors">
                          Abbrechen
                        </button>
                        <button onClick={handleSaveCustomTheme} className="px-6 py-2 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                          Speichern
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {themeToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md space-y-4 border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-red-400">Thema löschen?</h2>
            <p className="text-gray-300">
              Möchtest du das Thema <span className="font-bold text-white">"{themeToDelete}"</span> wirklich unwiderruflich löschen?
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <button onClick={() => setThemeToDelete(null)} className="px-8 py-3 rounded-md font-semibold text-gray-300 hover:bg-gray-700 transition-colors">
                Abbrechen
              </button>
              <button onClick={confirmDeleteTheme} className="px-8 py-3 rounded-md font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors">
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={setupContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 relative overflow-y-auto">
        <button 
            onClick={onExit} 
            className="absolute top-5 left-5 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors z-10"
            aria-label="Zurück zum Hauptmenü"
        >
            <BackIcon />
        </button>
        <div className="text-center">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-teal-400 to-blue-500">Impostor Party</h1>
            <p className="text-gray-400 mt-2">Wer ist der Hochstapler?</p>
        </div>

        <div className="space-y-6">
            {/* Player and Impostor Count... */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Anzahl Spieler</label>
                <div className="flex items-center justify-center bg-gray-700 rounded-md">
                    <button onClick={handleDecrement} disabled={playerCount <= MIN_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-l-md transition-colors hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">-</button>
                    <span className="flex-grow text-center text-2xl font-bold text-white tabular-nums">{playerCount}</span>
                    <button onClick={handleIncrement} disabled={playerCount >= MAX_PLAYERS} className="px-6 py-3 text-2xl font-black text-white rounded-r-md transition-colors hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">+</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Anzahl Impostor</label>
                <div className="flex items-center justify-center bg-gray-700 rounded-md">
                    <button onClick={handleImpostorDecrement} disabled={impostorCount <= 1} className="px-6 py-3 text-2xl font-black text-white rounded-l-md transition-colors hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">-</button>
                    <span className="flex-grow text-center text-2xl font-bold text-white tabular-nums">{impostorCount}</span>
                    <button onClick={handleImpostorIncrement} disabled={impostorCount >= getMaxImpostors(playerCount)} className="px-6 py-3 text-2xl font-black text-white rounded-r-md transition-colors hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">+</button>
                </div>
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Spielmodus</label>
                <div className="flex space-x-2 bg-gray-700 rounded-md p-1">
                    <button onClick={() => setWithVoting(true)} className={`w-full p-2 rounded-md font-semibold text-sm transition-colors duration-200 ${withVoting ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-600'}`}>Mit Abstimmung</button>
                    <button onClick={() => setWithVoting(false)} className={`w-full p-2 rounded-md font-semibold text-sm transition-colors duration-200 ${!withVoting ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-600'}`}>Ohne Abstimmung</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Hinweis für Impostor</label>
                <div className="flex space-x-2 bg-gray-700 rounded-md p-1">
                    <button onClick={() => setGiveImpostorHint(false)} className={`w-full p-2 rounded-md font-semibold text-sm transition-colors duration-200 ${!giveImpostorHint ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-600'}`}>Aus</button>
                    <button onClick={() => setGiveImpostorHint(true)} className={`w-full p-2 rounded-md font-semibold text-sm transition-colors duration-200 ${giveImpostorHint ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-600'}`}>An (Zeigt Kategorie)</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Namen der Spieler</label>
                <div className="space-y-3">
                    {playerNames.map((name, index) => (
                        <div key={index} className="flex items-center">
                           <UserIcon />
                           <input type="text" placeholder={`Spieler ${index + 1}`} value={name} onChange={(e) => handlePlayerNameChange(index, e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 pl-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <label htmlFor="discussionTime" className="block text-sm font-bold text-gray-300 mb-2">Diskussionszeit: <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">{discussionTime} Minute{discussionTime > 1 ? 'n' : ''}</span></label>
                <input type="range" id="discussionTime" min="1" max="10" step="1" value={discussionTime} onChange={handleTimeChange} className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Themen wählen</label>
                 {consentGiven && (
                    <div className="flex space-x-2 mb-3">
                        <button onClick={() => openThemeModal(null)} className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-blue-500 transition-colors">Thema erstellen</button>
                        <button onClick={() => importFileRef.current?.click()} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"> <ImportIcon /> Import</button>
                        <input type="file" ref={importFileRef} onChange={handleImportTheme} style={{ display: 'none' }} accept=".IPSets" />
                    </div>
                 )}
                 <button onClick={handleToggleAllThemes} className="w-full bg-gray-700 text-blue-300 font-semibold py-2 rounded-md text-sm hover:bg-gray-600 transition-colors mb-3">
                        {themes.length === allThemeNames.length ? 'Alle abwählen' : 'Alle aktivieren'}
                </button>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableDefaultThemes.map((t) => (
                        <button key={t.name} onClick={() => handleThemeToggle(t.name)} className={`w-full p-3 rounded-md font-semibold text-sm transition-all duration-200 ${themes.includes(t.name) ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                            {t.name}
                             {t.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
                        </button>
                    ))}
                </div>
                {consentGiven && availableCustomThemes.length > 0 && (
                    <>
                        <h3 className="text-sm font-bold text-gray-400 mt-6 mb-2">Eigene Themen</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableCustomThemes.map((ct) => (
                                <div key={ct.name} className="relative group">
                                    <button onClick={() => handleThemeToggle(ct.name)} className={`w-full p-3 rounded-md font-semibold text-sm transition-all duration-200 text-left pr-8 truncate ${themes.includes(ct.name) ? 'bg-indigo-500 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                                        {ct.name}
                                        {ct.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
                                    </button>
                                    <div className="absolute top-1/2 right-1.5 -translate-y-1/2">
                                        <button onClick={() => openThemeModal(ct)} className="p-1 text-gray-300 hover:text-white bg-black/20 hover:bg-blue-500/50 rounded-full" aria-label={`Thema ${ct.name} bearbeiten`}>
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
            <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-4 rounded-lg text-xl transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:scale-105 hover:shadow-blue-400/40">
              Spiel starten
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .accent-red-500 {
          accent-color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default SetupScreen;
