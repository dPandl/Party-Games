import React, { useState, useRef, useEffect, useMemo } from 'react';
import { IoMdSettings } from "react-icons/io";
import { FaShop } from "react-icons/fa6";
import { GAMES } from '../games/games';
import { Game, AnimationState } from '../types';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';
import { ALL_GAME_SET_STORAGE_KEYS } from '../constants';
import { CURRENT_VERSION } from '../releaseNotes';

interface GameSelectionScreenProps {
  onSelectGame: (game: Game, element: HTMLElement | null) => void;
  hiddenCardId?: string | null;
  appAnimationState?: AnimationState;
  onShowPrivacyModal: () => void;
  onShowImpressumModal: () => void;
  onShowReleaseNotes: () => void;
  onShowFeedbackModal: () => void;
  onShowSettingsModal: () => void;
}

// Icons for global actions
const ImportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const ExportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L6.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>);


const GameSelectionScreen: React.FC<GameSelectionScreenProps> = ({ onSelectGame, hiddenCardId, appAnimationState, onShowImpressumModal, onShowPrivacyModal, onShowReleaseNotes, onShowFeedbackModal, onShowSettingsModal }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragInfo, setDragInfo] = useState({ x: 0, isDragging: false });
  const [animationState, setAnimationState] = useState<{
    outgoingIndex: number;
    direction: 'left' | 'right' | '';
  }>({ outgoingIndex: -1, direction: '' });
  
  const cardMoved = useRef(false);
  const startX = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const importFileRef = useRef<HTMLInputElement>(null);

  const sortedGames = useMemo(() => 
    [...GAMES].sort((a, b) => a.title.localeCompare(b.title)), 
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (animationState.outgoingIndex !== -1) return;
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    cardMoved.current = false;
    startX.current = e.clientX;
    setDragInfo({ x: 0, isDragging: true });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.isDragging) return;
    const x = e.clientX - startX.current;
    if (Math.abs(x) > 5) {
      cardMoved.current = true;
    }
    setDragInfo(d => ({ ...d, x }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.isDragging) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    
    const isComingSoon = sortedGames[currentIndex].id.startsWith('coming-soon');
    if (!cardMoved.current && !isComingSoon) {
      const cardElement = cardRefs.current[currentIndex];
      onSelectGame(sortedGames[currentIndex], cardElement);
      setDragInfo({ x: 0, isDragging: false });
      return; 
    }

    const SWIPE_THRESHOLD = 100;
    
    if (Math.abs(dragInfo.x) > SWIPE_THRESHOLD) { // Swiped left or right
      setAnimationState({ 
          outgoingIndex: currentIndex, 
          direction: dragInfo.x > 0 ? 'right' : 'left' 
      });
    } else {
      // Snap back if dragged but not enough to swipe
      setDragInfo({ x: 0, isDragging: false });
    }
  };
  
  useEffect(() => {
    if (animationState.outgoingIndex === -1) return;
    
    // Animate the card out
    const timer = setTimeout(() => {
      // After animation, always update to the next card regardless of swipe/key direction.
      setCurrentIndex(i => (i + 1) % sortedGames.length);
      
      // Reset state for the next interaction
      setDragInfo({x: 0, isDragging: false});
      setAnimationState({ outgoingIndex: -1, direction: '' });
    }, 300); // Must match CSS exit transition duration

    return () => clearTimeout(timer);
  }, [animationState, sortedGames.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if a game is open/animating or a modal is open.
      if (appAnimationState !== 'idle' || dragInfo.isDragging || animationState.outgoingIndex !== -1) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          setAnimationState({ 
            outgoingIndex: currentIndex, 
            direction: 'left'
          });
          break;
        case 'ArrowRight':
           setAnimationState({ 
            outgoingIndex: currentIndex, 
            direction: 'right'
          });
          break;
        case 'Enter':
        case ' ': // Space
          e.preventDefault(); // Prevent page scroll on space
          const cardElement = cardRefs.current[currentIndex];
          const isComingSoon = sortedGames[currentIndex].id.startsWith('coming-soon');
          if (!isComingSoon && cardElement) {
            onSelectGame(sortedGames[currentIndex], cardElement);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appAnimationState, dragInfo.isDragging, animationState.outgoingIndex, currentIndex, onSelectGame, sortedGames]);


  const handleExportAllSets = () => {
    try {
        const allData: { [key: string]: any } = {};
        let dataFound = false;
        ALL_GAME_SET_STORAGE_KEYS.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                allData[key] = JSON.parse(data);
                dataFound = true;
            }
        });

        if (!dataFound) {
            addNotification("Keine benutzerdefinierten Sets zum Exportieren gefunden.", "info");
            return;
        }

        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Alle_Sets.PartyGamesSets';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Fehler beim Exportieren der Sets:", error);
        addNotification("Ein Fehler ist beim Exportieren aufgetreten.", "error");
    }
  };

  const handleImportAllSets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        let setsImported = false;
        let storageError = false;
        try {
            const json = JSON.parse(e.target?.result as string);
            for (const key of ALL_GAME_SET_STORAGE_KEYS) {
                if (json[key] && Array.isArray(json[key])) {
                    const existingData: any[] = JSON.parse(localStorage.getItem(key) || '[]');
                    const importedData: any[] = json[key];
                    
                    const combinedDataMap = new Map();
                    existingData.forEach(item => item.name && combinedDataMap.set(item.name, item));
                    importedData.forEach(item => item.name && combinedDataMap.set(item.name, item));

                    const finalData = Array.from(combinedDataMap.values());
                    
                    try {
                        localStorage.setItem(key, JSON.stringify(finalData));
                        setsImported = true;
                    } catch (storageErr) {
                        console.error("Fehler beim Speichern der importierten Sets:", storageErr);
                        storageError = true;
                        break; // Stop importing if storage fails
                    }
                }
            }

            if (storageError) {
                addNotification('Import fehlgeschlagen: Dein Browser-Speicher ist voll oder blockiert.', 'error');
            } else if (setsImported) {
                addNotification('Alle Sets erfolgreich importiert! Die App wird neu geladen.', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                addNotification('Die Datei scheint keine gültigen Sets für diese App zu enthalten.', 'error');
            }

        } catch (error) {
            console.error("Fehler beim Importieren der Sets:", error);
            addNotification('Fehler beim Lesen der Datei. Stellen Sie sicher, dass es eine gültige JSON-Datei ist.', 'error');
        }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = ''; // Reset file input
  };


  const getCardStyle = (index: number): React.CSSProperties => {
    const isTopCard = index === currentIndex;
    const isAnimatingOut = animationState.outgoingIndex === index;
    const distance = (index - currentIndex + sortedGames.length) % sortedGames.length;
    
    // Default transition for smooth movement between states
    let transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease-out';

    // State 1: A card is animating off-screen after a swipe
    if (isAnimatingOut) {
        const exitX = animationState.direction === 'right' ? window.innerWidth : -window.innerWidth;
        const exitRotation = animationState.direction === 'right' ? 20 : -20;
        return {
            transform: `translateX(${exitX}px) rotate(${exitRotation}deg)`,
            opacity: 0,
            transition: 'transform 0.3s ease-in, opacity 0.2s linear',
            zIndex: sortedGames.length,
            pointerEvents: 'none',
        };
    }

    // State 2: The top card is being actively dragged by the user
    if (isTopCard && dragInfo.isDragging) {
        const rotation = dragInfo.x / 20;
        return {
            transform: `translateX(${dragInfo.x}px) rotate(${rotation}deg)`,
            zIndex: sortedGames.length + 1,
            transition: 'none', // No transition during drag for direct feedback
            pointerEvents: 'auto',
            touchAction: 'none',
        };
    }

    // State 3: Cards are in the default stacked position
    
    // When returning from a game, the static card in the deck should appear instantly to avoid flickering.
    if (isTopCard && appAnimationState === 'out') {
      transition = 'none';
    }

    // Calculate position for cards in the deck
    const scale = 1 - distance * 0.03;
    const translateY = distance * 10;
    const zIndex = sortedGames.length - distance;

    return {
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: 1,
        zIndex,
        transition,
        pointerEvents: isTopCard ? 'auto' : 'none',
        touchAction: isTopCard ? 'pan-y' : 'none',
    };
  };
  
  const foreignObjectDivProps: any = {
      xmlns: "http://www.w3.org/1999/xhtml",
      className: "w-full h-full p-6 flex flex-col justify-between text-left",
  };


  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-gray-900 p-4 text-center overflow-hidden">
      <div className="w-full text-center pt-8">
        <h1 className="text-5xl font-black text-white">Wähle ein Spiel</h1>
        <p className="text-gray-400 mt-2">Wische oder tippe, um zu starten.</p>
      </div>
      

      <div className="relative w-full h-96 flex items-center justify-center">
        {sortedGames.map((game, index) => {
          const isCurrent = index === currentIndex;
          const isComingSoon = game.id.startsWith('coming-soon');
          const handlers = isCurrent ? { onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onPointerCancel: handlePointerUp } : {};

          const cardStyle = getCardStyle(index);
          
          if (game.id === hiddenCardId) {
            cardStyle.opacity = 0;
            cardStyle.pointerEvents = 'none'; // Ensure hidden card is not interactive
          }

          return (
            <div
              key={game.id}
              ref={el => { cardRefs.current[index] = el; }}
              className={`absolute w-72 h-96 rounded-2xl shadow-2xl bg-gradient-to-br ${game.colorGradient} ${isCurrent && !isComingSoon ? 'cursor-pointer' : 'cursor-default'} tap-highlight-transparent overflow-hidden`}
              style={cardStyle}
              {...handlers}
            >
              <svg width="100%" height="100%" viewBox="0 0 288 384" preserveAspectRatio="xMidYMid meet">
                  <foreignObject x="0" y="0" width="288" height="384">
                      <div {...foreignObjectDivProps}>
                          <div>
                              <p className="font-bold text-gray-900/50 uppercase tracking-wider text-sm high-contrast-text-black">{game.tagline}</p>
                              <h2 className="text-3xl font-black text-white high-contrast-text-black leading-tight">{game.title}</h2>
                          </div>
                          <div>
                            <p className="text-white/80 high-contrast-text-black text-lg">{game.description}</p>
                            <div className="flex items-center justify-between gap-2 mt-4 text-white/90 high-contrast-text-black">
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                  </svg>
                                  <p className="font-semibold text-base">{game.minPlayers} - {game.maxPlayers} Spieler</p>
                                </div>
                            </div>
                          </div>
                      </div>
                  </foreignObject>
              </svg>
            </div>
          );
        })}
      </div>
      
      <div className="w-full max-w-lg mx-auto px-4 pb-2 space-y-4">
        <div className="flex justify-center items-center gap-4">
            <input type="file" ref={importFileRef} onChange={handleImportAllSets} style={{ display: 'none' }} accept=".PartyGamesSets" />
            {consentGiven ? (
              <button onClick={() => importFileRef.current?.click()} className="flex items-center justify-center w-12 h-12 bg-blue-600/80 text-white rounded-full hover:bg-blue-500 transition-colors" title="Alle Sets importieren">
                  <ImportIcon />
              </button>
            ) : (
                <div className="w-12 h-12" />
            )}

            <button onClick={onShowSettingsModal} className="flex items-center justify-center w-14 h-14 bg-gray-600/80 text-white rounded-full hover:bg-gray-500 transition-colors transform hover:scale-110" title="Einstellungen">
                <IoMdSettings className="h-8 w-8" />
            </button>
            
            {consentGiven ? (
              <a href="https://party-games-store.by-dp.de/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 bg-gray-600/80 text-white rounded-full hover:bg-gray-500 transition-colors transform hover:scale-110" title="Set Shop">
                  <FaShop className="h-7 w-7" />
              </a>
            ) : (
                <div className="w-14 h-14" />
            )}

            {consentGiven ? (
                <button onClick={handleExportAllSets} className="flex items-center justify-center w-12 h-12 bg-green-600/80 text-white rounded-full hover:bg-green-500 transition-colors" title="Alle Sets exportieren">
                    <ExportIcon />
                </button>
            ) : (
                <div className="w-12 h-12" />
            )}
        </div>
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onShowReleaseNotes} 
                className="text-xs text-gray-500 hover:text-gray-300 hover:underline transition-colors"
              >
                v{CURRENT_VERSION}
              </button>
              <button
                onClick={onShowFeedbackModal}
                className="text-xs text-gray-500 hover:text-gray-300 hover:underline transition-colors"
              >
                Feedback
              </button>
            </div>
            <div className="flex space-x-6">
                <button 
                  onClick={onShowImpressumModal} 
                  className="text-xs text-gray-500 hover:text-gray-300 hover:underline transition-colors"
                >
                  Impressum
                </button>
                <button 
                  onClick={onShowPrivacyModal} 
                  className="text-xs text-gray-500 hover:text-gray-300 hover:underline transition-colors"
                >
                  Datenschutz
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelectionScreen;