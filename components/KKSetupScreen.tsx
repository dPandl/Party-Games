import React, { useState, useEffect, useRef } from 'react';
import { CustomBlackStorySet, BlackStory } from '../types';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';
import InstructionsModal from './InstructionsModal';
import { KRIMI_KLUB_SETS } from '../games/krimiKlubData';
import { useSettings } from './SettingsContext';

interface KKSetupScreenProps {
  onStartGame: (selectedSets: string[], customStorySets: CustomBlackStorySet[]) => void;
  onExit: () => void;
  initialSettings?: { selectedSets: string[] } | null;
}

// Icons
const BackIcon=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const PlusIcon=()=>(<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const ExportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L6.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>);
const ImportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);


const KKSetupScreen: React.FC<KKSetupScreenProps> = ({ onStartGame, onExit, initialSettings }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const { show18PlusContent } = useSettings();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const [customStorySets, setCustomStorySets] = useState<CustomBlackStorySet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  
  const [editingSet, setEditingSet] = useState<CustomBlackStorySet | null>(null);
  const [newSetName, setNewSetName] = useState('');
  const [newSetStories, setNewSetStories] = useState<BlackStory[]>([]);
  const [isAdultSet, setIsAdultSet] = useState(false);
  const [currentStory, setCurrentStory] = useState({ id: '', title: '', scenario: '', solution: '', details: '' });
  const importFileRef = useRef<HTMLInputElement>(null);
  const setupContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const availableDefaultSets = KRIMI_KLUB_SETS.filter(set => show18PlusContent || !set.isAdult);
  const availableCustomSets = customStorySets.filter(set => show18PlusContent || !set.isAdult);
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
            const stored = localStorage.getItem('krimiKlubCustomSets');
            if (stored) setCustomStorySets(JSON.parse(stored));
        } catch (error) {
            console.error("Failed to parse custom story sets from localStorage", error);
        }
    } else {
        setCustomStorySets([]);
    }
  }, [consentGiven]);
  
  const handleSetToggle = (setName: string) => setSelectedSets(current => current.includes(setName) ? current.filter(s => s !== setName) : [...current, setName]);

  const openSetModal = (setToEdit: CustomBlackStorySet | null = null) => {
    setEditingSet(setToEdit);
    setNewSetName(setToEdit ? setToEdit.name : '');
    setNewSetStories(setToEdit ? setToEdit.stories : []);
    setIsAdultSet(setToEdit ? setToEdit.isAdult ?? false : false);
    setCurrentStory({ id: '', title: '', scenario: '', solution: '', details: '' });
    setIsModalOpen(true);
  };

  const handleAddStory = () => {
    const { title, scenario, solution, details } = currentStory;
    if (!title.trim() || !scenario.trim() || !solution.trim() || !details.trim()) {
        addNotification('Bitte fülle alle Felder für den Fall aus.');
        return;
    }
    setNewSetStories([...newSetStories, { ...currentStory, id: crypto.randomUUID() }]);
    setCurrentStory({ id: '', title: '', scenario: '', solution: '', details: '' });
  };
  
  const handleRemoveStory = (id: string) => setNewSetStories(newSetStories.filter(s => s.id !== id));

  const handleSaveCustomSet = () => {
    const trimmedName = newSetName.trim();
    if (!trimmedName) { addNotification('Bitte gib einen Namen für das Set ein.'); return; }
    if (newSetStories.length < 1) { addNotification('Bitte füge mindestens einen Fall zum Set hinzu.'); return; }

    const isNameTaken = customStorySets.some(s => s.name.toLowerCase() === trimmedName.toLowerCase() && s.name.toLowerCase() !== editingSet?.name.toLowerCase());
    if (isNameTaken || KRIMI_KLUB_SETS.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
        addNotification('Ein Set mit diesem Namen existiert bereits.'); return;
    }

    const newSetData = { name: trimmedName, stories: newSetStories, isAdult: isAdultSet };
    let newCustomSets;
    if (editingSet) {
        newCustomSets = customStorySets.map(s => s.name === editingSet.name ? newSetData : s);
        setSelectedSets(current => current.map(s => s === editingSet.name ? newSetData.name : s));
    } else {
        newCustomSets = [...customStorySets, newSetData];
        if (!selectedSets.includes(newSetData.name)) {
            setSelectedSets(current => [...current, newSetData.name]);
        }
    }
    setCustomStorySets(newCustomSets);
    if (consentGiven) {
        localStorage.setItem('krimiKlubCustomSets', JSON.stringify(newCustomSets));
    }
    setIsModalOpen(false);
    setEditingSet(null);
  };

  const confirmDeleteSet = () => {
    if (!setToDelete) return;
    const newCustomSets = customStorySets.filter(s => s.name !== setToDelete);
    setCustomStorySets(newCustomSets);
    if (consentGiven) {
        localStorage.setItem('krimiKlubCustomSets', JSON.stringify(newCustomSets));
    }
    setSelectedSets(current => current.filter(s => s !== setToDelete));
    setSetToDelete(null);
  };

    const handleExportSet = (set: CustomBlackStorySet) => {
        const jsonString = JSON.stringify(set, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${set.name.replace(/\s/g, '_')}.KKSets`;
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

                if (typeof data.name !== 'string' || !Array.isArray(data.stories)) {
                    let errorMsg = 'Fehler beim Importieren: Ungültiges Format für Krimi Klub.';
                     if (typeof data.name === 'string') {
                        if (Array.isArray(data.words)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Impostor Party" Set.';
                        else if (Array.isArray(data.locations)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Agenten Undercover" Set.';
                        else if (Array.isArray(data.wahrheit) && Array.isArray(data.pflicht)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Flaschendrehen" Set.';
                        else if (Array.isArray(data.dilemmas)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Moralischer Kompass" Set.';
                        else if (Array.isArray(data.cards)) errorMsg = 'Falscher Set-Typ. Dies ist ein "Wort-Akrobaten" Set.';
                    }
                    addNotification(errorMsg, 'error');
                    console.error("Invalid set format:", data);
                    return;
                }

                const set = data as CustomBlackStorySet;

                const existingIndex = customStorySets.findIndex(s => s.name.toLowerCase() === set.name.toLowerCase());
                if (existingIndex !== -1) {
                    if (window.confirm(`Ein Set namens "${set.name}" existiert bereits. Überschreiben?`)) {
                        const newSets = [...customStorySets];
                        newSets[existingIndex] = set;
                        setCustomStorySets(newSets);
                        if (consentGiven) {
                            localStorage.setItem('krimiKlubCustomSets', JSON.stringify(newSets));
                        }
                    }
                } else {
                    const newSets = [...customStorySets, set];
                    setCustomStorySets(newSets);
                    if (consentGiven) {
                        localStorage.setItem('krimiKlubCustomSets', JSON.stringify(newSets));
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
    if (selectedSets.length === 0) { addNotification('Bitte wähle mindestens ein Fall-Set aus.'); return; }
    onStartGame(selectedSets, customStorySets);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
        <InstructionsModal
            isOpen={isInstructionsOpen}
            onClose={() => setIsInstructionsOpen(false)}
            title="Anleitung: Krimi Klub"
            gradient="bg-gradient-to-br from-slate-300 to-slate-500"
            buttonClass="bg-slate-600 hover:bg-slate-500"
            headingClass="[&_h3]:text-slate-300"
        >
            <h3 className="text-xl font-bold">Ziel des Spiels</h3>
            <p>Die Detektive müssen durch geschicktes Fragen ein mysteriöses Rätsel lösen, dessen Lösung nur der Spielleiter kennt.</p>

            <h3 className="text-xl font-bold pt-4">Rollen</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Spielleiter (1 Spieler):</strong> Diese Person kennt die ganze Geschichte (Szenario, Lösung, Details). Der Spielleiter beantwortet die Fragen der Detektive nur mit "Ja", "Nein" oder "Irrelevant".</li>
                <li><strong>Detektive (Rest der Spieler):</strong> Sie kennen nur das kurze Anfangsszenario und müssen den Tathergang rekonstruieren.</li>
            </ul>

            <h3 className="text-xl font-bold pt-4">Ablauf</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li>Bestimmt einen Spielleiter. Nur er sollte das Gerät in der Hand halten.</li>
                <li>Der Spielleiter liest das Szenario laut vor.</li>
                <li>Die Detektive stellen nun abwechselnd Fragen, die mit "Ja" oder "Nein" beantwortet werden können (z.B. "War eine Waffe im Spiel?").</li>
                <li>Der Spielleiter antwortet wahrheitsgemäß. Wenn eine Frage nicht klar mit Ja/Nein beantwortet werden kann oder für den Fall unwichtig ist, sagt er "Irrelevant".</li>
                <li>Wenn die Detektive glauben, die Lösung gefunden zu haben, können sie ihre Theorie vortragen. Der Spielleiter deckt dann die offizielle Lösung auf und vergleicht.</li>
            </ol>
        </InstructionsModal>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl space-y-4 border border-gray-700">
                <h2 className="text-2xl font-bold text-slate-400">{editingSet ? 'Set bearbeiten' : 'Eigenes Fall-Set erstellen'}</h2>
                <input type="text" placeholder="Set-Name" value={newSetName} onChange={e => setNewSetName(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"/>
                
                <div className="space-y-3 bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-300">Neuen Fall hinzufügen (mind. 1)</h3>
                    <input type="text" placeholder="Titel des Falls" value={currentStory.title} onChange={e => setCurrentStory({...currentStory, title: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    <textarea placeholder="Szenario..." value={currentStory.scenario} onChange={e => setCurrentStory({...currentStory, scenario: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md h-20 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    <textarea placeholder="Lösung..." value={currentStory.solution} onChange={e => setCurrentStory({...currentStory, solution: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md h-20 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    <textarea placeholder="Details/Hinweise für Spielleiter..." value={currentStory.details} onChange={e => setCurrentStory({...currentStory, details: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md h-20 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    <button onClick={handleAddStory} className="w-full bg-slate-600 text-white p-2 rounded-md hover:bg-slate-500 flex items-center justify-center"><PlusIcon /></button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 h-32 overflow-y-auto">
                    {newSetStories.length === 0 ? <p className="text-gray-500 text-center py-4">Füge den ersten Fall hinzu.</p> : newSetStories.map((story) => (
                        <div key={story.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md animate-fade-in">
                            <span className="text-white text-sm truncate pr-2">{story.title}</span>
                            <button onClick={() => handleRemoveStory(story.id)} className="p-1 text-gray-400 hover:text-red-400 rounded-full flex-shrink-0"><TrashIcon/></button>
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
                        <button onClick={handleSaveCustomSet} className="px-6 py-2 rounded-md font-semibold bg-slate-600 text-white hover:bg-slate-500">Speichern</button>
                    </div>
                </div>
            </div>
        </div>
      )}
      {/* Delete Modal */}
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
      
      {/* Main Setup Screen */}
      <div
        ref={setupContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 relative overflow-y-auto">
        <button onClick={onExit} className="absolute top-5 left-5 p-2 rounded-full bg-gray-700 hover:bg-gray-600 z-10"><BackIcon /></button>
        <div className="text-center">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-300 to-slate-500">Krimi Klub</h1>
            <p className="text-gray-400 mt-2">Könnt ihr den Fall gemeinsam lösen?</p>
        </div>
        <div className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Fall-Sets wählen</label>
                {consentGiven && (
                    <div className="flex space-x-2 mb-3">
                        <button onClick={() => openSetModal(null)} className="flex-1 bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-slate-500 transition-colors">Set erstellen</button>
                        <button onClick={() => importFileRef.current?.click()} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-gray-500 flex items-center justify-center gap-2"><ImportIcon/> Import</button>
                        <input type="file" ref={importFileRef} onChange={handleImportSet} style={{ display: 'none' }} accept=".KKSets" />
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {availableDefaultSets.map(s => (
                        <button key={s.name} onClick={() => handleSetToggle(s.name)} className={`w-full p-3 rounded-md font-semibold text-sm ${selectedSets.includes(s.name) ? 'bg-slate-500 ring-2 ring-offset-2 ring-offset-gray-800 ring-slate-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                          {s.name}
                          {s.isAdult && <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">18+</span>}
                        </button>
                    ))}
                    {consentGiven && availableCustomSets.map((cs) => (
                        <div key={cs.name} className="relative group">
                            <button onClick={() => handleSetToggle(cs.name)} className={`w-full p-3 rounded-md font-semibold text-sm text-left pr-8 truncate ${selectedSets.includes(cs.name) ? 'bg-indigo-500 ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
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
             <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-500/50 text-sm">
                <h3 className="text-white font-bold mb-2">Spielleiter benötigt!</h3>
                <p className="text-slate-200">
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
            <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-slate-600 to-slate-800 text-white font-bold py-4 rounded-lg text-xl shadow-lg shadow-slate-500/20 transform hover:scale-105">Ermittlung starten</button>
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

export default KKSetupScreen;
