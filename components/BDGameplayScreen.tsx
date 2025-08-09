import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bomb, BombModule, MANUAL_CONTENT, WiresModule, ButtonModule, KeypadModule, WireColor, SimonSaysModule, SimonSaysColor } from '../games/bombenentschaerfungData';

// --- SOUND EFFECTS ---

// Erstellt einen einzigen AudioContext, um die Latenz bei wiederholten Wiedergaben zu reduzieren.
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Could not create AudioContext", e);
            return null;
        }
    }
    return audioContext;
};

const playBuzz = () => {
    const ctx = getAudioContext();
    if (!ctx) {
        console.warn("Web Audio API wird in diesem Browser nicht unterstützt.");
        return;
    }

    // Stellt sicher, dass der Kontext ausgeführt wird (er könnte vom Browser angehalten worden sein)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    // Eine etwas niedrigere Frequenz für einen tieferen Buzz
    oscillator.frequency.setValueAtTime(50, ctx.currentTime); 
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);

    // Dauer für einen kurzen, prägnanten Sound auf 0,5s korrigiert
    const duration = 3;
    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
};

const playBeep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime); // Hoher Ton für einen Piepton
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // Nicht zu laut

    const duration = 0.3; // Kurzer Piepton
    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
};


// --- SUB-COMPONENTS FOR MODULES ---
const Wire: React.FC<{ color: WireColor; onClick: () => void; cut: boolean }> = ({ color, onClick, cut }) => (
    <div className="bomb-wire h-4 rounded-full mx-2 my-10 transition-all duration-300" style={{ 
        backgroundColor: color, 
        boxShadow: `0 0 8px ${color}`,
        transform: cut ? 'scaleX(0.1)' : 'scaleX(1)',
        opacity: cut ? 0.3 : 1,
     }} onClick={onClick} />
);

const WiresModuleComponent: React.FC<{ module: WiresModule; onSolve: () => void; onStrike: () => void; serial: string; }> = ({ module, onSolve, onStrike, serial }) => {
    const [cutWires, setCutWires] = useState<boolean[]>(Array(module.wires.length).fill(false));
    const isOddSerial = parseInt(serial.slice(-1), 10) % 2 !== 0;


    const getCorrectWireToCut = () => {
        const wires = module.wires;
        switch (wires.length) {
            case 3:
                if (!wires.includes('red')) return 1;
                if (wires[2] === 'white') return 2;
                if (wires.filter(w => w === 'blue').length > 1) return wires.lastIndexOf('blue');
                return 2;
            case 4:
                if (wires.filter(w => w === 'red').length > 1 && isOddSerial) return wires.lastIndexOf('red');
                if (wires[3] === 'yellow' && !wires.includes('red')) return 0;
                if (wires.filter(w => w === 'blue').length === 1) return 0;
                if (wires.filter(w => w === 'yellow').length > 1) return 3;
                return 1;
            case 5:
                if (wires[4] === 'black' && isOddSerial) return 3;
                if (wires.filter(w => w === 'red').length === 1 && wires.filter(w => w === 'yellow').length > 1) return 0;
                if (!wires.includes('black')) return 1;
                return 0;
            case 6:
                if (!wires.includes('yellow') && isOddSerial) return 2;
                if (wires.filter(w => w === 'yellow').length === 1 && wires.filter(w => w === 'white').length > 1) return 3;
                if (!wires.includes('red')) return 5;
                return 3;
            default: return -1;
        }
    };

    const handleWireCut = (index: number) => {
        if (module.solved || cutWires[index]) return;
        const correctIndex = getCorrectWireToCut();
        if (index === correctIndex) {
            onSolve();
        } else {
            setCutWires(prev => { const next = [...prev]; next[index] = true; return next; });
            onStrike();
        }
    };
    return <div className="p-2">{module.wires.map((w, i) => <Wire key={i} color={w} onClick={() => handleWireCut(i)} cut={cutWires[i] || module.solved} />)}</div>
};

interface ButtonModuleComponentProps {
  module: ButtonModule;
  onSolve: () => void;
  onStrike: () => void;
  timeLeft: number;
  batteries: number;
}
const ButtonModuleComponent: React.FC<ButtonModuleComponentProps> = ({ module, onSolve, onStrike, timeLeft, batteries }) => {
    const [isHeld, setIsHeld] = useState(false);
    
    const handlePress = () => {
        if (module.solved) return;
        const { color, text } = module;
        
        if (color === 'blue' && text === 'HALT') { setIsHeld(true); return; }
        if (batteries > 1 && text === 'SPRENG') { onSolve(); return; }
        if (color === 'white') { setIsHeld(true); return; }
        if (batteries > 2 && text === 'LOS') { setIsHeld(true); return; }
        if (color === 'yellow') { setIsHeld(true); return; }
        if (color === 'red' && text === 'HALT') { onSolve(); return; }
        
        setIsHeld(true);
    };

    const handleRelease = () => {
        if (!isHeld || module.solved) return;
        setIsHeld(false);
        const releaseDigit = module.color === 'blue' ? 4 : module.color === 'yellow' ? 5 : 1;
        const secondsString = (timeLeft % 60).toString();
        
        if (secondsString.includes(releaseDigit.toString())) {
            onSolve();
        } else {
            onStrike();
        }
    };

    return <div className="flex justify-center items-center p-4">
        <button
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
            disabled={module.solved}
            className={`w-24 h-24 rounded-full font-black text-xl transition-all duration-200 transform
                ${isHeld ? 'scale-90' : 'scale-100'}
                ${module.color === 'red' ? 'bg-red-500 text-white' : ''}
                ${module.color === 'blue' ? 'bg-blue-500 text-white' : ''}
                ${module.color === 'yellow' ? 'bg-yellow-400 text-black' : ''}
                ${module.color === 'white' ? 'bg-white text-black' : ''}
                ${module.solved ? 'bg-gray-700 opacity-50' : ''}`}
        >{module.text}</button>
    </div>;
}

const KeypadModuleComponent: React.FC<{ module: KeypadModule; onSolve: () => void; onStrike: () => void; }> = ({ module, onSolve, onStrike }) => {
    const [pressed, setPressed] = useState<string[]>([]);
    
    const correctOrder = useMemo(() => {
        const correctColumn = MANUAL_CONTENT.keypad.columns.find(col => module.symbols.every(s => col.includes(s)));
        return correctColumn ? correctColumn.filter(s => module.symbols.includes(s)) : [];
    }, [module.symbols]);
    
    const handlePress = (symbol: string) => {
        if (module.solved || pressed.includes(symbol)) return;
        const newPressed = [...pressed, symbol];
        setPressed(newPressed);

        if (newPressed[newPressed.length - 1] !== correctOrder[newPressed.length - 1]) {
            onStrike();
            setPressed([]);
            return;
        }

        if (newPressed.length === 4) {
            onSolve();
        }
    };

    return <div className="grid grid-cols-2 gap-2 p-2">
        {module.symbols.map(s => (
            <button key={s} onClick={() => handlePress(s)} disabled={module.solved || pressed.includes(s)}
             className={`p-2 h-16 rounded-lg text-4xl font-mono transition-colors ${module.solved ? 'bg-gray-700/50' : pressed.includes(s) ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-gray-600 hover:bg-gray-500'}`}>
                {s}
            </button>
        ))}
    </div>;
};

const SimonSaysModuleComponent: React.FC<{ module: SimonSaysModule; onSolve: () => void; onStrike: () => void; serial: string; strikes: number; }> = ({ module, onSolve, onStrike, serial, strikes }) => {
    const [playerInput, setPlayerInput] = useState<SimonSaysColor[]>([]);
    const [flashingColor, setFlashingColor] = useState<SimonSaysColor | null>(null);
    const [isDisplaying, setIsDisplaying] = useState(false);

    const hasVowel = /[AEIOU]/.test(serial);

    const correctSequence = useMemo(() => {
        let sequence = [...module.colors];
        if (hasVowel) {
            if (strikes === 0) { // Swap pairs
                sequence = sequence.map(c => {
                    if (c === 'red') return 'blue';
                    if (c === 'blue') return 'red';
                    if (c === 'green') return 'yellow';
                    if (c === 'yellow') return 'green';
                    return c;
                });
            } else if (strikes >= 2) { // Reverse
                sequence = sequence.reverse();
            }
        } else { // No vowel
            if (strikes === 1) { // Reverse
                sequence = sequence.reverse();
            } else if (strikes >= 2) { // Rotate
                sequence = sequence.map(c => {
                    if (c === 'red') return 'blue';
                    if (c === 'blue') return 'green';
                    if (c === 'green') return 'yellow';
                    if (c === 'yellow') return 'red';
                    return c;
                });
            }
        }
        return sequence;
    }, [module.colors, hasVowel, strikes]);

    const playSequence = useCallback(() => {
        if (isDisplaying || module.solved) return;
        setIsDisplaying(true);
        let i = 0;
        const interval = setInterval(() => {
            setFlashingColor(module.colors[i]);
            setTimeout(() => setFlashingColor(null), 400);
            i++;
            if (i >= module.colors.length) {
                clearInterval(interval);
                setTimeout(() => setIsDisplaying(false), 500);
            }
        }, 800);
    }, [module.colors, isDisplaying, module.solved]);
    
    useEffect(() => {
        playSequence();
    }, []);

    const handlePress = (color: SimonSaysColor) => {
        if (module.solved || isDisplaying) return;
        const newInput = [...playerInput, color];
        setPlayerInput(newInput);
        if (newInput[newInput.length - 1] !== correctSequence[newInput.length - 1]) {
            onStrike();
            setPlayerInput([]);
            return;
        }
        if (newInput.length === correctSequence.length) {
            onSolve();
        }
    };
    
    const colors: SimonSaysColor[] = ['red', 'blue', 'green', 'yellow'];

    return (
        <div className="p-2 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-gray-600 mb-2 transition-colors" style={{ backgroundColor: flashingColor || 'transparent' }}></div>
            <div className="grid grid-cols-2 gap-2 w-full">
                {colors.map(c => (
                     <button 
                        key={c} 
                        onClick={() => handlePress(c)}
                        disabled={module.solved || isDisplaying}
                        className={`h-20 w-full rounded-lg transition-transform transform active:scale-90 disabled:opacity-50`}
                        style={{ backgroundColor: c, boxShadow: `0 0 12px ${c}`}}
                    />
                ))}
            </div>
             <button onClick={playSequence} disabled={isDisplaying || module.solved} className="mt-2 text-xs bg-gray-600 px-2 py-1 rounded">Sequenz wiederholen</button>
        </div>
    );
};


// --- Bomb Info Components ---
const Battery: React.FC = () => (
    <div className="w-6 h-10 bg-gray-600 border-2 border-gray-500 rounded-md relative flex items-center justify-center shadow-inner">
        <div className="absolute -top-1 w-3 h-1.5 bg-gray-500 rounded-t-sm"></div>
        <span className="text-yellow-400 font-bold text-lg">+</span>
    </div>
);

const BombInfo: React.FC<{ serial: string; batteries: number }> = ({ serial, batteries }) => (
    <div className="p-2 border-2 border-gray-600 bg-gray-800/80 rounded-lg flex flex-col items-center gap-2">
        <div className="w-full text-center bg-gray-900 p-2 rounded">
            <p className="text-xs text-gray-400">SERIENNUMMER</p>
            <p className="text-lg font-bold tracking-widest text-white">{serial}</p>
        </div>
        {batteries > 0 && (
            <div className="w-full text-center bg-gray-900 p-2 rounded">
                 <p className="text-xs text-gray-400">BATTERIEN</p>
                 <div className="flex justify-center items-center gap-2 mt-1">
                    {Array(batteries).fill(0).map((_, i) => <Battery key={i} />)}
                </div>
            </div>
        )}
    </div>
);

// --- MAIN GAMEPLAY SCREEN ---
interface BDGameplayScreenProps {
  bomb: Bomb;
  onEndGame: (result: 'defused' | 'exploded') => void;
}

const BDGameplayScreen: React.FC<BDGameplayScreenProps> = ({ bomb, onEndGame }) => {
    const [showConfirmExit, setShowConfirmExit] = useState(false);
    const [timeLeft, setTimeLeft] = useState(bomb.timer);
    const [strikes, setStrikes] = useState(0);
    const [modules, setModules] = useState<BombModule[]>(bomb.modules);
    const [strikeFlash, setStrikeFlash] = useState(false);

    const timerSpeed = useMemo(() => 1 + strikes * 0.25, [strikes]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(t => {
                const newTime = Math.max(0, t - 1);
                if (newTime <= 10 && newTime > 0) {
                    playBeep();
                }
                return newTime;
            });
        }, 1000 / timerSpeed);
        return () => clearInterval(interval);
    }, [timerSpeed]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onEndGame('exploded');
        }
    }, [timeLeft, onEndGame]);
    
    useEffect(() => {
        if (strikes >= bomb.maxStrikes) {
            onEndGame('exploded');
        }
    }, [strikes, bomb.maxStrikes, onEndGame]);

    useEffect(() => {
        if (modules.every(m => m.solved)) {
            onEndGame('defused');
        }
    }, [modules, onEndGame]);

    const handleStrike = useCallback(() => {
        playBuzz();
        setStrikes(s => s + 1);
        setStrikeFlash(true);
        setTimeout(() => setStrikeFlash(false), 200);
    }, []);

    const handleSolve = useCallback((moduleId: string) => {
        setModules(mods => mods.map(m => m.id === moduleId ? { ...m, solved: true } : m));
    }, []);

    const renderModule = (module: BombModule) => {
        switch (module.type) {
            case 'wires': return <WiresModuleComponent module={module} onSolve={() => handleSolve(module.id)} onStrike={handleStrike} serial={bomb.serialNumber} />;
            case 'button': return <ButtonModuleComponent module={module} onSolve={() => handleSolve(module.id)} onStrike={handleStrike} timeLeft={timeLeft} batteries={bomb.batteries} />;
            case 'keypad': return <KeypadModuleComponent module={module} onSolve={() => handleSolve(module.id)} onStrike={handleStrike} />;
            case 'simonSays': return <SimonSaysModuleComponent module={module} onSolve={() => handleSolve(module.id)} onStrike={handleStrike} serial={bomb.serialNumber} strikes={strikes} />;
            default: return null;
        }
    };
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`flex flex-col h-full bg-gray-900 text-white font-mono transition-colors ${strikeFlash ? 'bg-red-900' : ''}`}>
             {showConfirmExit && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-4 border border-gray-700">
                        <h2 className="text-2xl font-bold text-red-400">Spiel beenden?</h2>
                        <p className="text-gray-300">
                           Möchtest du wirklich aufgeben? Die Bombe wird explodieren und das Spiel wird beendet.
                        </p>
                        <div className="flex justify-center space-x-4 pt-4">
                            <button onClick={() => setShowConfirmExit(false)} className="px-8 py-3 rounded-md font-semibold text-gray-300 hover:bg-gray-700 transition-colors">
                                Weiterspielen
                            </button>
                            <button onClick={() => onEndGame('exploded')} className="px-8 py-3 rounded-md font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors">
                                Aufgeben & Beenden
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex justify-between items-center p-3 bg-black/30 border-b-2 border-yellow-500/50">
                <div className="flex items-center space-x-4">
                    <span className="text-3xl font-black text-red-500 animate-pulse">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                    <div>
                        <span className="text-sm text-gray-400">STRIKES</span>
                        <div className="flex space-x-2 mt-1">
                            {Array(bomb.maxStrikes).fill(0).map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full ${i < strikes ? 'bg-red-600 shadow-red-500' : 'bg-gray-600'}`}/>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowConfirmExit(true)} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded-md font-bold text-white text-sm">
                    Beenden
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-grow overflow-y-auto p-2" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '1rem 1rem'}}>
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                        <BombInfo serial={bomb.serialNumber} batteries={bomb.batteries} />
                    </div>
                    {modules.map(module => (
                        <div key={module.id} className={`p-2 rounded-lg border-2 ${module.solved ? 'border-gray-500/50 bg-gray-900/50' : 'border-gray-600 bg-gray-800/80'}`}>
                            {renderModule(module)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BDGameplayScreen;