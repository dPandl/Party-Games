import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { WWPlayer } from '../types';
import { useNotification } from './Notification';

enum NightPhase {
    START,
    AMOR,
    WEREWOLVES,
    SEER,
    WITCH,
    DAY_TRANSITION,
    DAY_VOTING,
}

interface WWGameplayScreenProps {
  initialPlayers: WWPlayer[];
  onEndGame: (winningFaction: string) => void;
  onExit: () => void;
}

const getRoleColor = (role: string) => {
    switch (role) {
        case 'Werwolf': return 'text-red-400';
        case 'Seherin': return 'text-purple-400';
        case 'Hexe': return 'text-green-400';
        case 'Amor': return 'text-pink-400';
        case 'Jäger': return 'text-orange-400';
        default: return 'text-blue-400';
    }
};

const WWGameplayScreen: React.FC<WWGameplayScreenProps> = ({ initialPlayers, onEndGame, onExit }) => {
    const { addNotification } = useNotification();
    const [players, setPlayers] = useState<WWPlayer[]>(initialPlayers);
    const [phase, setPhase] = useState<NightPhase>(NightPhase.START);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
    const [announcement, setAnnouncement] = useState<string[]>([]);
    
    // Game State
    const [isInitialNight, setIsInitialNight] = useState(true);
    const [witchPotions, setWitchPotions] = useState({ heal: initialPlayers.some(p=>p.role==='Hexe'), poison: initialPlayers.some(p=>p.role==='Hexe') });
    const [wolfVictimId, setWolfVictimId] = useState<number | null>(null);
    const [witchAction, setWitchAction] = useState<'none' | 'healing' | 'poisoning'>('none');
    const [healTargetId, setHealTargetId] = useState<number | null>(null);
    const [poisonTargetId, setPoisonTargetId] = useState<number | null>(null);

    // New state for witch self-heal
    const [showWitchSelfHeal, setShowWitchSelfHeal] = useState(false);
    const [lynchTargetId, setLynchTargetId] = useState<number | null>(null);

    const nightPhaseOrder = useMemo(() => {
        const alivePlayers = players.filter(p => p.isAlive);
        const aliveRoles = new Set(alivePlayers.map(p => p.role));

        const order = [NightPhase.START];
        if (isInitialNight && aliveRoles.has('Amor')) order.push(NightPhase.AMOR);

        if (aliveRoles.has('Werwolf')) order.push(NightPhase.WEREWOLVES);
        
        if (aliveRoles.has('Seherin')) order.push(NightPhase.SEER);
        
        if (aliveRoles.has('Hexe') && (witchPotions.heal || witchPotions.poison)) {
            order.push(NightPhase.WITCH);
        }

        order.push(NightPhase.DAY_TRANSITION, NightPhase.DAY_VOTING);
        return order;
    }, [isInitialNight, players, witchPotions.heal, witchPotions.poison]);

    const advancePhase = useCallback(() => {
        const currentIndex = nightPhaseOrder.indexOf(phase);
        const nextPhase = nightPhaseOrder[(currentIndex + 1) % nightPhaseOrder.length];
        
        setSelectedPlayerIds([]);
        setHealTargetId(null);
        setPoisonTargetId(null);
        setWitchAction('none');

        if (nextPhase === NightPhase.START) {
            setIsInitialNight(false);
            setAnnouncement([]);
        }
        
        setPhase(nextPhase);
    }, [phase, nightPhaseOrder]);

    useEffect(() => {
        const alivePlayers = players.filter(p => p.isAlive);
        const aliveWerewolves = alivePlayers.filter(p => p.role === 'Werwolf');
        const aliveVillagers = alivePlayers.filter(p => p.role !== 'Werwolf');
        const aliveLovers = alivePlayers.filter(p => p.isLover);

        if (alivePlayers.length > 0) {
            if (aliveWerewolves.length === 0) {
                // Check for lovers win condition first
                if (aliveLovers.length === 2 && alivePlayers.length === 2) {
                    onEndGame("Liebende");
                } else {
                    onEndGame("Dorfbewohner");
                }
            } else if (aliveWerewolves.length >= aliveVillagers.length) {
                // Check for lovers win condition first
                if (aliveLovers.length === 2 && alivePlayers.length === 2) {
                    onEndGame("Liebende");
                } else {
                     onEndGame("Werwölfe");
                }
            }
        }
    }, [players, onEndGame]);

    const handleWitchSelfHealDecision = (usePotion: boolean) => {
        if (lynchTargetId === null) return;

        if (usePotion) {
            setWitchPotions(prev => ({ ...prev, heal: false }));
            setAnnouncement(["Die Hexe hat sich mit ihrem letzten Heiltrank selbst gerettet!"]);
        } else {
            setPlayers(currentPlayers => {
                 let deaths = [currentPlayers.find(p => p.id === lynchTargetId)!];
                 if (deaths[0].isLover) {
                    const otherLover = currentPlayers.find(p => p.isLover && p.id !== lynchTargetId);
                    if(otherLover) deaths.push(otherLover);
                 }
                setAnnouncement(deaths.map(p => `Das Dorf hat ${p.name} (${p.role}) gelyncht.`));
                const deadIds = new Set(deaths.map(p => p.id));
                return currentPlayers.map(p => deadIds.has(p.id) ? { ...p, isAlive: false } : p);
            });
        }
        
        setShowWitchSelfHeal(false);
        setLynchTargetId(null);
        setSelectedPlayerIds([]);
        setIsInitialNight(false);
        setPhase(NightPhase.START);
    };


    const handlePlayerClick = (id: number) => {
        const player = players.find(p => p.id === id);
        if (!player || !player.isAlive) return;

        switch (phase) {
            case NightPhase.AMOR:
                setSelectedPlayerIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id].slice(-2));
                break;
            case NightPhase.WEREWOLVES:
                if (player.role !== 'Werwolf') setSelectedPlayerIds([id]);
                break;
            case NightPhase.SEER:
                setSelectedPlayerIds(ids => ids.includes(id) ? [] : [id]);
                break;
            case NightPhase.WITCH:
                 if (witchAction === 'healing') {
                    if (id === wolfVictimId) {
                        setHealTargetId(current => (current === id ? null : id));
                    } else {
                        addNotification("Der Heiltrank kann nur auf das Opfer der Werwölfe angewendet werden.", "info");
                    }
                } else if (witchAction === 'poisoning') {
                    if (id !== healTargetId) {
                        setPoisonTargetId(current => (current === id ? null : id));
                    }
                }
                 break;
            case NightPhase.DAY_VOTING:
                setSelectedPlayerIds([id]);
                break;
        }
    };
    
    const handleConfirm = useCallback(() => {
        switch(phase) {
            case NightPhase.AMOR:
                if (selectedPlayerIds.length === 2) {
                    setPlayers(p => p.map(player => selectedPlayerIds.includes(player.id) ? { ...player, isLover: true } : player));
                    advancePhase();
                } else { addNotification("Bitte wähle genau zwei Liebende aus."); }
                break;
            case NightPhase.WEREWOLVES:
                 if (selectedPlayerIds.length === 1) {
                    setWolfVictimId(selectedPlayerIds[0]);
                    advancePhase();
                } else { addNotification("Bitte wählt ein Opfer aus."); }
                break;
            
            case NightPhase.WITCH: {
                // Use a functional update to ensure we have the latest player state
                setPlayers(currentPlayers => {
                    const newPotions = {...witchPotions};
                    if (healTargetId !== null) newPotions.heal = false;
                    if (poisonTargetId !== null) newPotions.poison = false;
                    setWitchPotions(newPotions);

                    let deaths: WWPlayer[] = [];
                    const saved = healTargetId !== null;

                    if (wolfVictimId !== null && !saved) {
                        const victim = currentPlayers.find(p => p.id === wolfVictimId);
                        if (victim) deaths.push(victim);
                    }
                    if (poisonTargetId !== null) {
                        const victim = currentPlayers.find(p => p.id === poisonTargetId);
                        if (victim && !deaths.some(d => d.id === victim.id)) deaths.push(victim);
                    }
                    
                    let finalDeaths = [...deaths];
                    deaths.forEach(deadPlayer => {
                        if (deadPlayer.isLover) {
                            const otherLover = currentPlayers.find(p => p.isLover && p.id !== deadPlayer.id);
                            if (otherLover && !finalDeaths.some(d => d.id === otherLover.id)) {
                                finalDeaths.push(otherLover);
                            }
                        }
                    });

                    if (finalDeaths.length > 0) {
                        setAnnouncement(finalDeaths.map(p => `${p.name} (${p.role})`));
                        const deadIds = new Set(finalDeaths.map(p => p.id));
                        return currentPlayers.map(p => deadIds.has(p.id) ? { ...p, isAlive: false } : p);
                    } else {
                        setAnnouncement([]);
                        return currentPlayers;
                    }
                });

                setWolfVictimId(null);
                advancePhase();
                break;
            }

            case NightPhase.DAY_VOTING:
                if(selectedPlayerIds.length === 1) {
                    const lynchedId = selectedPlayerIds[0];
                    const lynchedPlayer = players.find(p => p.id === lynchedId);

                    if (lynchedPlayer && lynchedPlayer.role === 'Hexe' && witchPotions.heal) {
                        setLynchTargetId(lynchedId);
                        setShowWitchSelfHeal(true);
                        return; // Stop execution and wait for witch's decision
                    }

                    setPlayers(currentPlayers => {
                         let deaths = [currentPlayers.find(p => p.id === lynchedId)!];
                         if (deaths[0].isLover) {
                            const otherLover = currentPlayers.find(p => p.isLover && p.id !== lynchedId);
                            if(otherLover) deaths.push(otherLover);
                         }
                        setAnnouncement(deaths.map(p=> `Das Dorf hat ${p.name} (${p.role}) gelyncht.`));
                        const deadIds = new Set(deaths.map(p => p.id));
                        return currentPlayers.map(p => deadIds.has(p.id) ? { ...p, isAlive: false } : p);
                    });
                    setIsInitialNight(false);
                    setPhase(NightPhase.START);
                } else { addNotification("Bitte wählt einen Spieler zur Eliminierung aus."); }
                break;
            default:
                advancePhase();
        }
    }, [phase, players, selectedPlayerIds, advancePhase, witchPotions, healTargetId, poisonTargetId, wolfVictimId, addNotification]);
    
    const getPhaseUI = () => {
        switch(phase) {
            case NightPhase.START: return { title: "Die Nacht beginnt", instruction: "Der Spielleiter bittet alle Spieler, die Augen zu schließen.", buttonText: "Weiter" };
            case NightPhase.AMOR: return { title: "Amor erwacht", instruction: "Amor, erwache und wähle zwei Personen, die sich unsterblich verlieben sollen. Tippe die beiden Spieler an.", buttonText: "Paar bestätigen" };
            case NightPhase.WEREWOLVES: return { title: "Die Werwölfe erwachen", instruction: "Die Werwölfe erwachen und einigen sich auf ein Opfer.", buttonText: "Opfer bestätigen" };
            case NightPhase.SEER: return { title: "Die Seherin erwacht", instruction: "Seherin, erwache und deute auf eine Person, deren Identität du erfahren möchtest. Spielleiter, tippe den Spieler an, um seine Rolle zu bestätigen.", buttonText: "Weiter" };
            case NightPhase.WITCH: {
                const victimName = players.find(p => p.id === wolfVictimId)?.name;
                let instruction = "Hexe, erwache. Was möchtest du tun?";
                
                // Only show who is being attacked if the witch has the heal potion
                if (witchPotions.heal && victimName) {
                    instruction = `Hexe, erwache. Die Werwölfe wollen ${victimName} töten. Was tust du?`;
                }

                if (witchAction === 'healing' && victimName) {
                    instruction = `Heile ${victimName}, indem du auf den Namen tippst.`;
                }
                if (witchAction === 'poisoning') {
                    instruction = "Wähle einen Spieler, den du vergiften möchtest.";
                }

                return { title: "Die Hexe erwacht", instruction, buttonText: "Nacht fortsetzen" };
            }
            case NightPhase.DAY_TRANSITION: return { title: "Der Tag bricht an", instruction: `Das Dorf erwacht. ${announcement.length > 0 ? `In dieser Nacht starben: ${announcement.join(', ')}.` : 'In dieser Nacht ist zum Glück niemand gestorben.'}`, buttonText: "Zur Abstimmung" };
            case NightPhase.DAY_VOTING: return { title: "Abstimmung", instruction: `Das Dorf diskutiert und stimmt ab, wer als Werwolf entlarvt und eliminiert werden soll.`, buttonText: "Spieler eliminieren" };
            default: return { title: "", instruction: "", buttonText: "Weiter" };
        }
    };
    
    const { title, instruction, buttonText } = getPhaseUI();
    const alivePlayers = players.filter(p => p.isAlive);

    return (
        <div className="flex flex-col h-full bg-gray-900 p-4 text-white font-sans">
            {showWitchSelfHeal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center space-y-4 border border-green-500">
                        <h2 className="text-2xl font-bold text-green-400">Du wirst gelyncht!</h2>
                        <p className="text-gray-300">
                            Das Dorf hat dich, die Hexe, zum Tode verurteilt. Möchtest du deinen letzten Heiltrank benutzen, um dich selbst zu retten?
                        </p>
                        <div className="flex justify-center space-x-4 pt-4">
                            <button onClick={() => handleWitchSelfHealDecision(false)} className="px-8 py-3 rounded-md font-semibold bg-red-700 text-white hover:bg-red-600 transition-colors">
                                Sterben
                            </button>
                            <button onClick={() => handleWitchSelfHealDecision(true)} className="px-8 py-3 rounded-md font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors">
                                Heiltrank benutzen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-red-500">{title}</h1>
                 <button onClick={onExit} className="bg-gray-700 text-xs px-3 py-1 rounded-md hover:bg-red-600 ww-exit-button">Verlassen</button>
            </div>
            
            <div className="bg-gray-800 border border-indigo-500/30 rounded-lg p-4 mb-4 text-center min-h-[80px] flex items-center justify-center">
                <p className="text-lg text-indigo-100">{instruction}</p>
            </div>
            
            {phase === NightPhase.WITCH && (
                <div className="flex justify-center space-x-4 my-3">
                    <button
                        disabled={!witchPotions.heal || wolfVictimId === null}
                        onClick={() => setWitchAction('healing')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm
                            ${witchAction === 'healing' ? 'ring-2 ring-indigo-500' : ''}
                            ${!witchPotions.heal || wolfVictimId === null ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                        Heiltrank
                    </button>
                    <button
                        disabled={!witchPotions.poison}
                        onClick={() => setWitchAction('poisoning')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm
                            ${witchAction === 'poisoning' ? 'ring-2 ring-indigo-500' : ''}
                            ${!witchPotions.poison ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
                    >
                        Gifttrank
                    </button>
                </div>
            )}


            <div className="flex-grow bg-gray-800/50 rounded-lg p-2 overflow-y-auto">
                 <h2 className="text-lg font-bold text-gray-300 mb-2 px-2">Spieler ({alivePlayers.length} / {initialPlayers.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {players.map(player => {
                        const isPlayerButtonClickable = !player.isAlive || (phase === NightPhase.WITCH && witchAction === 'none');
                        
                        const isGenericSelection = selectedPlayerIds.includes(player.id);
                        const isHealSelection = phase === NightPhase.WITCH && healTargetId === player.id;
                        const isPoisonSelection = phase === NightPhase.WITCH && poisonTargetId === player.id;
                        const isNightlyVictim = wolfVictimId !== null && player.id === wolfVictimId && (phase >= NightPhase.WEREWOLVES && phase <= NightPhase.WITCH);

                        const baseClass = !player.isAlive
                            ? 'bg-gray-900 opacity-50'
                            : isNightlyVictim
                                ? 'bg-red-800/80'
                                : 'bg-gray-700 hover:bg-gray-600';

                        const ringClass = isHealSelection
                            ? 'ring-2 ring-green-400'
                            : isPoisonSelection
                                ? 'ring-2 ring-red-400'
                                : isGenericSelection
                                    ? 'ring-2 ring-indigo-500'
                                    : '';

                        return (
                            <button 
                                key={player.id} 
                                onClick={() => handlePlayerClick(player.id)} 
                                disabled={isPlayerButtonClickable}
                                className={`p-3 rounded-md text-left transition-all duration-200 relative ${baseClass} ${ringClass}`}>
                                {player.isLover && <span className="absolute top-1 right-1 text-pink-400 text-xl">♥</span>}
                                <p className={`font-bold text-lg ${!player.isAlive ? 'line-through' : ''}`}>{player.name}</p>
                                <p className={`text-sm font-semibold ${getRoleColor(player.role)}`}>{player.role}</p>
                            </button>
                        )
                    })}
                </div>
            </div>

            <button onClick={handleConfirm} className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-300 transform">
                {buttonText}
            </button>
        </div>
    );
};

export default WWGameplayScreen;