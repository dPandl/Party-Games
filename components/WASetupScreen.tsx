import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WA_MAX_PLAYERS } from '../constants';
import { WASettings, WACardMode, WAPlayStyle, WAWinCondition, WATurnStyle, CustomWASet, WACard, WACardType } from '../types';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';
import InstructionsModal from './InstructionsModal';
import { WA_SETS } from '../games/wortakrobatenData';
import { useSettings } from './SettingsContext';

interface WASetupScreenProps {
  onStartGame: (settings: WASettings) => void;
  onExit: () => void;
  initialSettings?: Omit<WASettings, 'customWACards'> | null;
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
    if(stored){const names=JSON.parse(stored);if(Array.isArray(names)&&names.length>0)return names;}
  } catch (e) { console.error("Failed to parse player names from session storage", e); }
  return null;
};

const formatTime = (minutes: number) => {
    if (minutes < 1) return `${minutes * 60} Sekunden`;
    if (minutes === 1) return "1 Minute";
    return `${minutes} Minuten`;
};

const WASetupScreen: React.FC<WASetupScreenProps> = ({ onStartGame, onExit, initialSettings }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const { show18PlusContent } = useSettings();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [playStyle, setPlayStyle] = useState<WAPlayStyle>(initialSettings?.playStyle || 'teams');
  const minPlayers = playStyle === 'teams' ? 4 : 2;

  const getInitialPlayerNames = (pStyle: WAPlayStyle) => {
    const min = pStyle === 'teams' ? 4 : 2;
    const sessionNames = consentGiven ? getSessionPlayerNames() : null;
    const baseNames = initialSettings?.playerNames || sessionNames || [];
    let adjusted = [...baseNames];

    if (adjusted.length > WA_MAX_PLAYERS) {
        adjusted = adjusted.slice(0, WA_MAX_PLAYERS);
    } else if (adjusted.length < min) {
        adjusted.push(...Array(min - adjusted.length).fill('').map((_, i) => `Spieler ${adjusted.length + i + 1}`));
    }
    return adjusted;
  };

  const [playerNames, setPlayerNames] = useState<string[]>(getInitialPlayerNames(initialSettings?.playStyle || 'teams'));
  const [roundTime, setRoundTime] = useState(initialSettings?.roundTime ? initialSettings.roundTime / 60 : 1.5); // minutes
  const [winScore, setWinScore] = useState(initialSettings?.winScore || 20);
  const [roundCount, setRoundCount] = useState(initialSettings?.roundCount || 5);
  const [gameMode, setGameMode] = useState<WACardMode>(initialSettings?.gameMode || 'mixed');
  const [winCondition, setWinCondition] = useState<WAWinCondition>(initialSettings?.winCondition || 'score');
  const [turnStyle, setTurnStyle] = useState<WATurnStyle>(initialSettings?.turnStyle || 'classic');
  
  const [customWASets, setCustomWASets] = useState<CustomWASet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);

  // Modal State
  const [editingSet, setEditingSet] = useState<CustomWASet | null>(null);
  const [newSetName, setNewSetName] = useState('');
  const [newSetCards, setNewSetCards] = useState<WACard[]>([]);
  const [isAdultSet, setIsAdultSet] = useState(false);
  const [currentCardType, setCurrentCardType] = useState<WACardType>('explain');
  const [currentWord, setCurrentWord] = useState('');
  const [currentTaboos, setCurrentTaboos] = useState<string[]>([]);
  const [currentTabooInput, setCurrentTabooInput] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);
  const setupContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const availableDefaultSets = useMemo(() => WA_SETS.filter(set => show18PlusContent || !set.isAdult), [show18PlusContent]);
  const availableCustomSets = useMemo(() => customWASets.filter(set => show18PlusContent || !set.isAdult), [customWASets, show18PlusContent]);
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
          const stored = localStorage.getItem('wortakrobatenCustomSets');
          if (stored) setCustomWASets(JSON.parse(stored));
        } catch (e) { console.error(e); }
    } else {
        setCustomWASets([]);
    }
  }, [consentGiven]);

  useEffect(() => {
    if (playerNames.length < minPlayers) {
        const newPlayerNames = [...playerNames];
        for (let i = playerNames.length; i < minPlayers; i++) {
            newPlayerNames.push(`Spieler ${i + 1}`);
        }
        setPlayerNames(newPlayerNames);
    }
  }, [playStyle, minPlayers, playerNames]);
  
  const { 
    defaultExplainSets, 
    defaultPantomimeSets, 
    defaultMixedSets,
    customExplainSets, 
    customPantomimeSets, 
    customMixedSets 
  } = useMemo(() => {
    const categorize = (sets: CustomWASet[]) => {
        const explain: CustomWASet[] = [];
        const pantomime: CustomWASet[] = [];
        const mixed: CustomWASet[] = [];
        sets.forEach(set => {
            if (!set.cards || set.cards.length === 0) return;
            const hasExplain = set.cards.some(c => c.type === 'explain');
            const hasPantomime = set.cards.some(c => c.type === 'pantomime');
            if (hasExplain && !hasPantomime) explain.push(set);
            else if (!hasExplain && hasPantomime) pantomime.push(set);
            else mixed.push(set);
        });
        return { explain, pantomime, mixed };
    };

    const defaultCategorized = categorize(availableDefaultSets);
    const customCategorized = categorize(availableCustomSets);
    
    return {
        defaultExplainSets: defaultCategorized.explain,
        defaultPantomimeSets: defaultCategorized.pantomime,
        defaultMixedSets: defaultCategorized.mixed,
        customExplainSets: customCategorized.explain,
        customPantomimeSets: customCategorized.pantomime,
        customMixedSets: customCategorized.mixed,
    };
  }, [availableDefaultSets, availableCustomSets]);

  const updatePlayerCount = (newCount: number) => {
    if (newCount < minPlayers || newCount > WA_MAX_PLAYERS) return;
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

  const handleSetToggle = (setName: string) => {
    setSelectedSets(current => current.includes(setName) ? current.filter(s => s !== setName) : [...current, setName]);
  };
  
  const openSetModal = (setToEdit: CustomWASet | null = null) => {
    setEditingSet(setToEdit);
    setNewSetName(setToEdit ? setToEdit.name : '');
    setNewSetCards(setToEdit ? setToEdit.cards : []);
    setIsAdultSet(setToEdit ? setToEdit.isAdult ?? false : false);
    setCurrentWord(''); setCurrentTaboos([]); setCurrentTabooInput('');
    setIsModalOpen(true);
  };

  const handleAddTaboo = () => {
    const taboo = currentTabooInput.trim();
    if (taboo && !currentTaboos.includes(taboo)) {
        setCurrentTaboos([...currentTaboos, taboo]);
        setCurrentTabooInput('');
    }
  };
  
  const handleRemoveTaboo = (index: number) => setCurrentTaboos(currentTaboos.filter((_, i) => i !== index));

  const handleAddCard = () => {
    const word = currentWord.trim();
    if (!word) { addNotification('Bitte gib einen Begriff ein.'); return; }
    if (currentCardType === 'explain' && currentTaboos.length < 3) {
      addNotification('Bitte gib mindestens 3 Tabu-Wörter ein.'); return;
    }
    
    const newCard: WACard = {
      id: crypto.randomUUID(),
      type: currentCardType,
      word,
      ...(currentCardType === 'explain' && { taboos: currentTaboos })
    };
    setNewSetCards([...newSetCards, newCard]);
    setCurrentWord(''); setCurrentTaboos([]); setCurrentTabooInput('');
  };
  
  const handleRemoveCard = (id: string) => setNewSetCards(newSetCards.filter(c => c.id !== id));

  const handleSaveCustomSet = () => {
    const name = newSetName.trim();
    if (!name) { addNotification('Bitte gib einen Namen für das Set ein.'); return; }
    if (newSetCards.length < 5) { addNotification('Bitte erstelle mindestens 5 Karten für das Set.'); return; }
    
    const isNameTaken = customWASets.some(s => s.name.toLowerCase() === name.toLowerCase() && s.name.toLowerCase() !== editingSet?.name.toLowerCase());
    if (isNameTaken || WA_SETS.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        addNotification('Ein Set mit diesem Namen existiert bereits.'); return;
    }

    const newSetData = { name, cards: newSetCards, isAdult: isAdultSet };
    let newCustomSets;
    if (editingSet) {
        newCustomSets = customWASets.map(s => s.name === editingSet.name ? newSetData : s);
        setSelectedSets(current => current.map(s => s === editingSet.name ? newSetData.name : s));
    } else {
        newCustomSets = [...customWASets, newSetData];
        if (!selectedSets.includes(newSetData.name)) {
            setSelectedSets(current => [...current, newSetData.name]);
        }
    }
    setCustomWASets(newCustomSets);
    if (consentGiven) {
        localStorage.setItem('wortakrobatenCustomSets', JSON.stringify(newCustomSets));
    }
    setIsModalOpen(false);
    setEditingSet(null);
  };

  const confirmDeleteSet = () => {
    if (!setToDelete) return;
    const newCustomSets = customWASets.filter(s => s.name !== setToDelete);
    setCustomWASets(newCustomSets);
    if (consentGiven) {
        localStorage.setItem('wortakrobatenCustomSets', JSON.stringify(newCustomSets));
    }
    setSelectedSets(current => current.filter(s => s !== setToDelete));
    setSetToDelete(null);
  };

    const handleExportSet = (set: CustomWASet) => {
        const jsonString = JSON.stringify(set, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${set.name.replace(/\s/g, '_')}.WASets`;
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

                if (typeof data.name !== 'string' || !Array.isArray(data.cards)) {
                    let errorMsg = 'Fehler beim Importieren: Ungültiges Format für Wort-Akrobaten.';
                    if (typeof data.name === 'string') {
                        if (Array.isArray(data.words)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Impostor Party" Set.';
                        else if (Array.isArray(data.locations)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Agenten Undercover" Set.';
                        else if (Array.isArray(data.wahrheit) && Array.isArray(data.pflicht)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Flaschendrehen" Set.';
                        else if (Array.isArray(data.dilemmas)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Moralischer Kompass" Set.';
                        else if (Array.isArray(data.stories)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Krimi Klub" Set.';
                    }
                    addNotification(errorMsg, 'error');
                    console.error("Invalid set format:", data);
                    return;
                }

                const set = data as CustomWASet;

                const existingIndex = customWASets.findIndex(s => s.name.toLowerCase() === set.name.toLowerCase());
                if (existingIndex !== -1) {
                    if (window.confirm(`Ein Set namens "${set.name}" existiert bereits. Überschreiben?`)) {
                        const newSets = [...customWASets];
                        newSets[existingIndex] = set;
                        setCustomWASets(newSets);
                        if (consentGiven) {
                            localStorage.setItem('wortakrobatenCustomSets', JSON.stringify(newSets));
                        }
                    }
                } else {
                    const newSets = [...customWASets, set];
                    setCustomWASets(newSets);
                    if (consentGiven) {
                        localStorage.setItem('wortakrobatenCustomSets', JSON.stringify(newSets));
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

  const handleStart = () => {
    const trimmedNames = playerNames.map(name => name.trim()).filter(name => name);
    if (trimmedNames.length !== playerNames.length || trimmedNames.length < minPlayers) {
        addNotification(`Bitte gib allen Spielern einen Namen. Mindestens ${minPlayers} Spieler benötigt.`, 'error');
        return;
    }
    if (selectedSets.length === 0) { addNotification('Bitte wähle mindestens ein Karten-Set aus.'); return; }
    
    if (consentGiven) {
        sessionStorage.setItem('globalPlayerNames', JSON.stringify(trimmedNames));
    }
    onStartGame({
        playerNames: trimmedNames,
        roundTime: roundTime * 60,
        winScore,
        roundCount,
        playStyle,
        winCondition,
        turnStyle,
        gameMode,
        selectedSets,
        customWACards: customWASets
    });
  };

  const renderCustomSetButtons = (setArray: CustomWASet[]) => {
    return setArray.map(cs => (
        <div key={cs.name} className="relative group">
            <button onClick={()=>handleSetToggle(cs.name)} className={`w-full text-left p-3 rounded-md font-semibold text-sm truncate pr-8 ${selectedSets.includes(cs.name)?'bg-green-500 ring-2 ring-offset-gray-800 ring-green-400':'bg-gray-700 hover:bg-gray-600'}`}>
                {cs.name}
                {cs.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
            </button>
            <div className="absolute top-1/2 right-1.5 -translate-y-1/2">
                <button onClick={() => openSetModal(cs)} className="p-1 text-gray-300 hover:text-white bg-black/20 hover:bg-blue-500/50 rounded-full" aria-label={`Set ${cs.name} bearbeiten`}>
                    <EditIcon/>
                </button>
            </div>
        </div>
    ));
};

  const renderSetButtons = (setArray: CustomWASet[]) => {
      return setArray.map(s => (
          <button key={s.name} onClick={() => handleSetToggle(s.name)} className={`p-3 rounded-md font-semibold text-sm ${selectedSets.includes(s.name) ? 'bg-lime-600 ring-2 ring-offset-gray-800 ring-lime-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
              {s.name}
              {s.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
          </button>
      ));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Wort-Akrobaten"
            gradient="bg-gradient-to-br from-lime-400 to-green-500"
            buttonClass="bg-lime-600 hover:bg-lime-500"
            headingClass="[&_h3]:text-lime-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
            <p>Sammelt als Team (oder einzeln) die meisten Punkte, indem ihr Begriffe erratet, die ein Mitspieler erklärt oder pantomimisch darstellt.</p>

            <h3 className="text-xl font-bold pt-4">Spielmodi</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Erklären:</strong> Ein Spieler erklärt seinem Team einen Begriff, ohne die fünf darunter stehenden "Tabu-Wörter" zu verwenden. Auch Wortstämme oder Übersetzungen der Tabu-Wörter sind verboten!</li>
                <li><strong>Pantomime:</strong> Ein Spieler stellt einen Begriff nur mit Gestik und Mimik dar. Geräusche oder das Deuten auf Gegenstände sind verboten!</li>
            </ul>

            <h3 className="text-xl font-bold pt-4">Ablauf (Team-Modus)</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li>Ein Spieler aus Team A ist an der Reihe (der "Erklärer"). Die Zeit läuft.</li>
                <li>Er versucht, so viele Begriffe wie möglich darzustellen, bevor die Zeit um ist.</li>
                <li>Sein Team rät. Für jeden erratenen Begriff gibt es einen Punkt (Button "Korrekt").</li>
                <li>Bei einem Regelverstoß (z.B. Tabu-Wort genannt) drückt ein Spieler des gegnerischen Teams auf "Foul".</li>
                <li>Ist eine Karte zu schwer, kann der Erklärer sie mit "Skip" überspringen.</li>
                <li>Nach Ablauf der Zeit ist Team B dran. Das Spiel geht weiter, bis die Siegbedingung (Punkte-Ziel oder Runden-Anzahl) erreicht ist.</li>
            </ol>
        </InstructionsModal>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl space-y-4 border border-gray-700">
            <h2 className="text-2xl font-bold text-lime-400">{editingSet ? 'Set bearbeiten' : 'Eigenes Set erstellen'}</h2>
            <input type="text" placeholder="Set-Name" value={newSetName} onChange={e => setNewSetName(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-lime-500" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-gray-300">Neue Karte hinzufügen</h3>
                <div className="flex space-x-2 bg-gray-900/50 rounded-md p-1">
                    <button onClick={() => setCurrentCardType('explain')} className={`w-full p-2 rounded-md font-semibold text-sm ${currentCardType === 'explain' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Erklären</button>
                    <button onClick={() => setCurrentCardType('pantomime')} className={`w-full p-2 rounded-md font-semibold text-sm ${currentCardType === 'pantomime' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Pantomime</button>
                </div>
                <input type="text" placeholder="Begriff zum Erraten" value={currentWord} onChange={e => setCurrentWord(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                {currentCardType === 'explain' && (
                  <div className="animate-fade-in">
                    <div className="flex space-x-2">
                        <input type="text" placeholder="Neues Tabu-Wort..." value={currentTabooInput} onChange={e => setCurrentTabooInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTaboo(); } }} className="flex-grow bg-gray-700 p-2 rounded-md" />
                        <button onClick={handleAddTaboo} className="bg-lime-600 p-2 rounded-md hover:bg-lime-500"><PlusIcon /></button>
                    </div>
                    <div className="mt-1 bg-gray-900/50 rounded-lg p-2 space-y-1 h-20 overflow-y-auto">
                        {currentTaboos.map((taboo, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-700 p-1 rounded-md text-sm">
                                <span>{taboo}</span>
                                <button onClick={() => handleRemoveTaboo(i)} className="p-0.5 text-gray-400 hover:text-red-400 rounded-full"><TrashIcon/></button>
                            </div>
                        ))}
                    </div>
                  </div>
                )}
                <button onClick={handleAddCard} className="w-full bg-lime-600 text-white p-2 rounded-md hover:bg-lime-500 flex items-center justify-center mt-2"><PlusIcon /> Karte hinzufügen</button>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 h-[28rem] overflow-y-auto">
                 {newSetCards.length === 0 ? <p className="text-gray-500 text-center py-4">Füge die erste Karte hinzu.</p> : newSetCards.map((card) => (
                    <div key={card.id} className="bg-gray-700 p-2 rounded-md animate-fade-in">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`font-bold text-sm ${card.type === 'explain' ? 'text-lime-300' : 'text-cyan-300'}`}>{card.word}</p>
                                {card.type === 'explain' && card.taboos && <p className="text-xs text-gray-400 italic">Tabus: {card.taboos.join(', ')}</p>}
                            </div>
                            <button onClick={() => handleRemoveCard(card.id)} className="p-1 text-gray-400 hover:text-red-400 rounded-full flex-shrink-0"><TrashIcon/></button>
                        </div>
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
                                        setSetToDelete(editingSet.name);
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
                    <button onClick={handleSaveCustomSet} className="px-6 py-2 rounded-md font-semibold bg-lime-600 text-white hover:bg-lime-500">Speichern</button>
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
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-lime-400 to-green-500">Wort-Akrobaten</h1>
            <p className="text-gray-400 mt-2">Erklären, erraten, gewinnen!</p>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Spielstil</label>
                <div className="flex space-x-2 bg-gray-700 rounded-md p-1">
                    <button onClick={() => setPlayStyle('teams')} className={`w-full p-2 rounded-md font-semibold text-sm ${playStyle === 'teams' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Teams</button>
                    <button onClick={() => setPlayStyle('freeForAll')} className={`w-full p-2 rounded-md font-semibold text-sm ${playStyle === 'freeForAll' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Jeder gegen Jeden</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Spieler ({minPlayers} - {WA_MAX_PLAYERS})</label>
                <div className="flex items-center justify-center bg-gray-700 rounded-md">
                    <button onClick={() => updatePlayerCount(playerNames.length-1)} disabled={playerNames.length <= minPlayers} className="px-6 py-3 text-2xl font-black rounded-l-md hover:bg-gray-600 disabled:text-gray-500">-</button>
                    <span className="flex-grow text-center text-2xl font-bold tabular-nums">{playerNames.length}</span>
                    <button onClick={() => updatePlayerCount(playerNames.length+1)} disabled={playerNames.length >= WA_MAX_PLAYERS} className="px-6 py-3 text-2xl font-black rounded-r-md hover:bg-gray-600 disabled:text-gray-500">+</button>
                </div>
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Namen der Spieler</label>
                <div className="space-y-3">
                    {playerNames.map((name, i) => (
                        <div key={i} className="flex items-center">
                            <UserIcon />
                            <input type="text" placeholder={`Spieler ${i+1}`} value={name} onChange={e => handlePlayerNameChange(i, e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 pl-2 focus:outline-none focus:ring-2 focus:ring-lime-500" />
                        </div>
                    ))}
                </div>
                {playStyle === 'teams' && (
                    <div className="mt-2 grid grid-cols-2 gap-x-4 text-xs">
                        <div className="text-center text-gray-400"><b>Team A:</b> {playerNames.filter((_,i)=>i%2===0).join(', ')}</div>
                        <div className="text-center text-gray-400"><b>Team B:</b> {playerNames.filter((_,i)=>i%2!==0).join(', ')}</div>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Spielmodus</label>
                <div className="grid grid-cols-3 gap-2 bg-gray-700 rounded-md p-1">
                    <button onClick={() => setGameMode('explain')} className={`p-2 rounded font-semibold text-sm ${gameMode === 'explain' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Nur Erklären</button>
                    <button onClick={() => setGameMode('pantomime')} className={`p-2 rounded font-semibold text-sm ${gameMode === 'pantomime' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Nur Pantomime</button>
                    <button onClick={() => setGameMode('mixed')} className={`p-2 rounded font-semibold text-sm ${gameMode === 'mixed' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Gemischt</button>
                </div>
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-300 mb-2">Rundenzeit: <span className="font-black text-lime-400">{formatTime(roundTime)}</span></label>
                 <input type="range" min="0.5" max="3" step="0.25" value={roundTime} onChange={e => setRoundTime(Number(e.target.value))} className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-500" />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Siegbedingung</label>
                <div className="flex space-x-2 bg-gray-700 rounded-md p-1">
                    <button onClick={() => setWinCondition('score')} className={`w-full p-2 rounded-md font-semibold text-sm ${winCondition === 'score' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Punkte-Ziel</button>
                    <button onClick={() => setWinCondition('rounds')} className={`w-full p-2 rounded-md font-semibold text-sm ${winCondition === 'rounds' ? 'bg-lime-600' : 'hover:bg-gray-600'}`}>Runden-Anzahl</button>
                </div>
            </div>

            {winCondition === 'score' ? (
                <div>
                     <label className="block text-sm font-bold text-gray-300 mb-2">Siegpunkte: <span className="font-black text-lime-400">{winScore}</span></label>
                     <input type="range" min="10" max="50" step="5" value={winScore} onChange={e => setWinScore(Number(e.target.value))} className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-500" />
                </div>
            ) : (
                <div>
                     <label className="block text-sm font-bold text-gray-300 mb-2">Runden: <span className="font-black text-lime-400">{roundCount}</span></label>
                     <input type="range" min="3" max="10" step="1" value={roundCount} onChange={e => setRoundCount(Number(e.target.value))} className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-500" />
                </div>
            )}
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Karten-Sets</label>
                {consentGiven && (
                <div className="flex space-x-2 mb-3">
                    <button onClick={() => openSetModal(null)} className="flex-1 bg-lime-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-lime-500 transition-colors">Set erstellen</button>
                    <button onClick={() => importFileRef.current?.click()} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-gray-500 flex items-center justify-center gap-2"><ImportIcon/> Import</button>
                    <input type="file" ref={importFileRef} onChange={handleImportSet} style={{ display: 'none' }} accept=".WASets" />
                </div>
                )}
                 {(gameMode === 'explain' || gameMode === 'mixed') && defaultExplainSets.length > 0 && (
                    <><h3 className="text-sm font-bold text-gray-400 mt-4 mb-2">Nur Erklären</h3><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{renderSetButtons(defaultExplainSets)}</div></>
                )}
                 {(gameMode === 'pantomime' || gameMode === 'mixed') && defaultPantomimeSets.length > 0 && (
                    <><h3 className="text-sm font-bold text-gray-400 mt-4 mb-2">Nur Pantomime</h3><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{renderSetButtons(defaultPantomimeSets)}</div></>
                 )}
                 {(gameMode === 'mixed') && defaultMixedSets.length > 0 && (
                    <><h3 className="text-sm font-bold text-gray-400 mt-4 mb-2">Gemischt</h3><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{renderSetButtons(defaultMixedSets)}</div></>
                 )}
                 {consentGiven && availableCustomSets.length > 0 && (
                    <>
                        <h3 className="text-sm font-bold text-gray-400 mt-6 mb-2">Eigene Sets</h3>
                         {(gameMode === 'explain' || gameMode === 'mixed') && customExplainSets.length > 0 && (
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{renderCustomSetButtons(customExplainSets)}</div>
                         )}
                         {(gameMode === 'pantomime' || gameMode === 'mixed') && customPantomimeSets.length > 0 && (
                           <><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">{renderCustomSetButtons(customPantomimeSets)}</div></>
                         )}
                         {(gameMode === 'mixed') && customMixedSets.length > 0 && (
                           <><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">{renderCustomSetButtons(customMixedSets)}</div></>
                         )}
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
            <button onClick={handleStart} className="w-full bg-gradient-to-r from-lime-500 to-green-600 text-white font-bold py-4 rounded-lg text-xl shadow-lg shadow-lime-500/30 transform hover:scale-105">Spiel starten</button>
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

export default WASetupScreen;
