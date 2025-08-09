import React, { useState, useEffect, useCallback } from 'react';
import { WACard, WAGameState, WASettings } from '../types';

interface WAGameplayScreenProps {
    settings: Omit<WASettings, 'playerNames' | 'selectedSets' | 'customWACards'>;
    gameState: WAGameState;
    explainer: string;
    players: string[];
    cards: WACard[];
    onTurnEnd: (pointsScored: number, guesser?: string) => void;
    onShuffleCards: () => void;
    onExit: () => void;
}

type RoundPhase = 'READY' | 'PLAYING' | 'TIMES_UP';

// --- Improved Audio Handling ---
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioContext || audioContext.state === 'closed') {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            return null;
        }
    }
    return audioContext;
};

const playBuzzer = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if it's suspended (for autoplay policies)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.02, ctx.currentTime); // Lautstärke weiter reduziert
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
};
// --- End Improved Audio Handling ---

const GuesserSelectionModal: React.FC<{
    players: string[],
    explainer: string,
    onSelect: (guesserName: string) => void
}> = ({ players, explainer, onSelect }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-lime-400 mb-6">Wer hat's erraten?</h2>
                <div className="grid grid-cols-2 gap-4">
                    {players.filter(p => p !== explainer).map(player => (
                        <button key={player} onClick={() => onSelect(player)} className="p-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-lime-600 transition-colors">
                            {player}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
};

const ExitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const WAGameplayScreen: React.FC<WAGameplayScreenProps> = ({ settings, gameState, explainer, players, cards, onTurnEnd, onShuffleCards, onExit }) => {
    const [phase, setPhase] = useState<RoundPhase>('READY');
    const [timeLeft, setTimeLeft] = useState(settings.roundTime);
    const [cardIndex, setCardIndex] = useState(0);
    const [pointsThisRound, setPointsThisRound] = useState(0);
    const [showGuesserModal, setShowGuesserModal] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // FIX: Reset component state for each new turn.
    // A new turn is identified by a change in `gameState.turnsTaken`.
    useEffect(() => {
        setPhase('READY');
        setTimeLeft(settings.roundTime);
        setPointsThisRound(0);
        setShowGuesserModal(false);
    }, [gameState.turnsTaken, settings.roundTime]);

    useEffect(() => {
        if (phase !== 'PLAYING' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setPhase('TIMES_UP');
                    playBuzzer(); // Sound when time is up
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    const nextCard = useCallback(() => {
        if (cardIndex + 1 >= cards.length) {
            onShuffleCards();
            setCardIndex(0);
        } else {
            setCardIndex(prev => prev + 1);
        }
    }, [cardIndex, cards.length, onShuffleCards]);

    const handleCorrect = () => {
        setPointsThisRound(prev => prev + 1);
        nextCard(); // Always advance the card on a correct guess
        if (settings.turnStyle === 'singleWord') {
            setPhase('TIMES_UP');
            playBuzzer();
        }
    };

    const handleSkip = () => {
        nextCard();
    };

    const handleFoul = () => {
        playBuzzer();
        nextCard();
    };

    const handleStartRound = () => {
        // Ensure cards are available before starting
        if(cards.length === 0) {
            alert("Keine Karten zum Spielen vorhanden. Bitte gehe zurück zum Setup und wähle Sets aus.");
            return;
        }
        // Ensure we don't start at an invalid card index
        if(cardIndex >= cards.length) {
            onShuffleCards();
            setCardIndex(0);
        }
        setPhase('PLAYING');
    };

    const handleNextTurn = () => {
        // For free for all, we need to ask who guessed to determine the next player
        if (settings.playStyle === 'freeForAll' && pointsThisRound > 0) {
            setShowGuesserModal(true);
        } else {
            onTurnEnd(pointsThisRound);
        }
    };

    const handleGuesserSelected = (guesserName: string) => {
        setShowGuesserModal(false);
        onTurnEnd(pointsThisRound, guesserName);
    };

    const ConfirmationModal = showExitConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-400">Spiel beenden?</h2>
                <p className="text-gray-300">
                    Möchtest du das Spiel wirklich beenden? Der aktuelle Spielstand geht verloren.
                </p>
                <div className="flex justify-center space-x-4 pt-4">
                    <button onClick={() => setShowExitConfirm(false)} className="px-8 py-3 rounded-md font-semibold text-gray-300 hover:bg-gray-700 transition-colors">
                        Weiterspielen
                    </button>
                    <button onClick={onExit} className="px-8 py-3 rounded-md font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors">
                        Beenden
                    </button>
                </div>
            </div>
        </div>
    );

    if (showGuesserModal) {
        return <GuesserSelectionModal players={players} explainer={explainer} onSelect={handleGuesserSelected} />;
    }

    if (phase === 'READY') {
        return (
            <>
                {ConfirmationModal}
                <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
                    <p className="text-2xl text-gray-400">
                        {settings.playStyle === 'teams' ? `Team ${gameState.currentTeam}` : `Runde ${gameState.currentRound}`} ist an der Reihe
                    </p>
                    <h1 className="text-5xl font-black my-4 bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-500">{explainer}</h1>
                    <p className="text-2xl text-gray-400 mb-12">ist dran!</p>
                    <button onClick={handleStartRound} className="bg-gradient-to-r from-lime-500 to-green-600 text-white font-bold py-4 px-12 rounded-lg text-2xl shadow-lg shadow-lime-500/30 transform hover:scale-105">
                        Runde starten
                    </button>
                    <button onClick={() => setShowExitConfirm(true)} className="mt-6 bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                        Spiel beenden
                    </button>
                </div>
            </>
        );
    }
    
    if (phase === 'TIMES_UP') {
         return (
            <>
                {ConfirmationModal}
                <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-8 text-center">
                    <h1 className="text-6xl font-black text-red-500">Zeit um!</h1>
                    <p className="text-3xl text-white mt-8">Ihr habt <span className="text-lime-400 font-bold">{pointsThisRound}</span> Punkt(e) geholt!</p>
                    {settings.playStyle === 'teams' && (
                      <p className="text-xl text-gray-400 mt-4">Team A: {gameState.teamAScore + (gameState.currentTeam === 'A' ? pointsThisRound : 0)} | Team B: {gameState.teamBScore + (gameState.currentTeam === 'B' ? pointsThisRound : 0)}</p>
                    )}
                    <button onClick={handleNextTurn} className="mt-12 bg-gradient-to-r from-lime-500 to-green-600 text-white font-bold py-4 px-12 rounded-lg text-2xl shadow-lg shadow-lime-500/30 transform hover:scale-105">
                        Nächster Zug
                    </button>
                    <button onClick={() => setShowExitConfirm(true)} className="mt-6 bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                        Spiel beenden
                    </button>
                </div>
            </>
        );
    }

    const currentCard = cards[cardIndex];
    if (!currentCard) {
        return <div className="flex items-center justify-center h-full">Lade Karten...</div>
    }

    return (
        <>
            {ConfirmationModal}
            <div className="flex flex-col h-full bg-gray-800 p-4">
                {/* Header */}
                <div className="flex justify-between items-center text-white p-2 rounded-lg bg-gray-900 mb-4">
                    {settings.playStyle === 'teams' ? (
                        <>
                            <div className="text-lg font-bold">Team A: <span className="text-lime-400">{gameState.teamAScore}</span></div>
                            <div className="text-3xl font-black text-yellow-400 tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                            <div className="text-lg font-bold">Team B: <span className="text-lime-400">{gameState.teamBScore}</span></div>
                        </>
                    ) : (
                        <>
                            <div className="text-lg font-bold">Punkte: <span className="text-lime-400">{pointsThisRound}</span></div>
                            <div className="text-3xl font-black text-yellow-400 tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                            <div className="text-lg font-bold">Runde: <span className="text-lime-400">{gameState.currentRound}</span></div>
                        </>
                    )}
                </div>

                {/* Card */}
                <div className="relative flex-grow flex flex-col justify-center items-center bg-gray-200 text-gray-900 rounded-2xl p-6 text-center shadow-2xl">
                    <button onClick={() => setShowExitConfirm(true)} className="wa-exit-button absolute top-4 right-4 z-10 p-2 text-gray-500 bg-gray-300/50 rounded-full hover:bg-red-500 hover:text-white transition-colors" aria-label="Spiel beenden">
                        <ExitIcon />
                    </button>
                    <p className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-4">
                        {currentCard.type === 'pantomime' ? 'Pantomime' : 'Erklären'}
                    </p>
                    <h2 className="text-5xl font-black uppercase tracking-tight">{currentCard.word}</h2>
                    
                    {currentCard.type === 'explain' && currentCard.taboos && (
                        <>
                            <div className="w-2/3 border-b-2 border-gray-400 my-4"></div>
                            <ul className="space-y-1">
                                {currentCard.taboos.map(taboo => <li key={taboo} className="text-2xl font-semibold text-red-600">{taboo}</li>)}
                            </ul>
                        </>
                    )}
                </div>
                
                {/* Controls */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                    <button onClick={handleFoul} className="bg-red-600 text-white font-bold py-4 rounded-lg text-xl hover:bg-red-500 transition-transform transform active:scale-95">FOUL</button>
                    <button onClick={handleSkip} className="bg-yellow-500 text-white font-bold py-4 rounded-lg text-xl hover:bg-yellow-400 transition-transform transform active:scale-95">SKIP</button>
                    <button onClick={handleCorrect} className="bg-green-600 text-white font-bold py-4 rounded-lg text-xl hover:bg-green-500 transition-transform transform active:scale-95">KORREKT</button>
                </div>
            </div>
        </>
    );
};

export default WAGameplayScreen;