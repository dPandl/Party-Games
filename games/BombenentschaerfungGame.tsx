import React, { useState, useCallback, useRef, useEffect } from 'react';
import BDSetupScreen from '../components/BDSetupScreen';
import BDGameplayScreen from '../components/BDGameplayScreen';
import BDResultsScreen from '../components/BDResultsScreen';
import BDManualScreen from '../components/BDManualScreen';
import { generateBomb, Bomb, BombModuleType } from './bombenentschaerfungData';

interface BombenentschaerfungGameProps {
  onExit: () => void;
}

export type Difficulty = 'Einfach' | 'Mittel' | 'Schwer' | 'Individuell';

export interface BDGameSettings {
    difficulty: Difficulty;
    customModules: number;
    customTime: number; // in seconds
    customStrikes: number;
    musicEnabled: boolean;
    customModuleSelection: BombModuleType[];
}

enum GamePhase {
  SETUP,
  GAMEPLAY,
  RESULTS,
}

// Erstellt einen einzigen, wiederverwendbaren AudioContext, um die Latenz zu reduzieren.
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioContext || audioContext.state === 'closed') {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API wird in diesem Browser nicht unterstützt.", e);
            return null;
        }
    }
    return audioContext;
};


const BombenentschaerfungGame: React.FC<BombenentschaerfungGameProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
  const [bomb, setBomb] = useState<Bomb | null>(null);
  const [outcome, setOutcome] = useState<'defused' | 'exploded' | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [lastSettings, setLastSettings] = useState<BDGameSettings>({ 
      difficulty: 'Einfach',
      customModules: 3,
      customTime: 300,
      customStrikes: 3,
      musicEnabled: true,
      customModuleSelection: ['wires', 'button', 'keypad', 'simonSays'],
  });

  // Refs for Web Audio API
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourcesRef = useRef<Array<{ source: AudioBufferSourceNode; gain: GainNode }>>([]);
  const musicLoopTimeoutRef = useRef<number | null>(null);
  const nextSegmentStartTimeRef = useRef<number>(0);
  
  const stopAllMusic = useCallback((fadeDuration: number) => {
    if (musicLoopTimeoutRef.current) {
        clearTimeout(musicLoopTimeoutRef.current);
        musicLoopTimeoutRef.current = null;
    }
    const ctx = getAudioContext();
    if (ctx) {
        activeSourcesRef.current.forEach(({ source, gain }) => {
            try {
                const now = ctx.currentTime;
                gain.gain.cancelScheduledValues(now);
                gain.gain.setValueAtTime(gain.gain.value, now);
                gain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
                source.stop(now + fadeDuration + 0.1);
            } catch (e) { /* Fehler beim Stoppen bereits gestoppter Nodes ignorieren */ }
        });
    }
    activeSourcesRef.current = [];
  }, []);

  const scheduleNextMusicSegment = useCallback((isFirstPlay: boolean) => {
    const ctx = getAudioContext();
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer) return;

    // --- MUSIK-LOOP-EINSTELLUNGEN ---
    // Passen Sie diese Werte an, um den Loop perfekt auf den Musiktitel abzustimmen.
    
    // Die Zeit in Sekunden, zu der der Loop zurückspringen soll (z.B. nach dem Intro).
    const LOOP_START = 5.835; 
    // Die Zeit in Sekunden, an der die Schleife endet.
    const LOOP_END = 31.259;
    // Die Dauer der Überblendung in Sekunden.
    const CROSSFADE_DURATION = 2.0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    source.connect(gainNode).connect(ctx.destination);
    
    activeSourcesRef.current.push({ source, gain: gainNode });
    source.onended = () => {
         activeSourcesRef.current = activeSourcesRef.current.filter(n => n.source !== source);
    };
    
    const now = ctx.currentTime;
    let startTime: number;
    let offset: number;
    let duration: number;

    if (isFirstPlay) {
        startTime = now;
        offset = 0;
        duration = LOOP_END;
        nextSegmentStartTimeRef.current = startTime + duration - CROSSFADE_DURATION;
    } else {
        startTime = nextSegmentStartTimeRef.current;
        offset = LOOP_START;
        duration = LOOP_END - LOOP_START;
        nextSegmentStartTimeRef.current = startTime + duration - CROSSFADE_DURATION;
    }

    // Schedule Fade-in
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + CROSSFADE_DURATION);

    // Schedule Fade-out
    gainNode.gain.setValueAtTime(0.4, startTime + duration - CROSSFADE_DURATION);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

    source.start(startTime, offset, duration);

    // Schedule next segment
    const delay = (nextSegmentStartTimeRef.current - now) * 1000;
    musicLoopTimeoutRef.current = window.setTimeout(() => scheduleNextMusicSegment(false), Math.max(0, delay));
  }, []);

  // Bereinigt beim Verlassen der Komponente
  useEffect(() => {
    return () => stopAllMusic(0.5);
  }, [stopAllMusic]);

  // Stoppt die Musik, wenn das Spiel endet
  useEffect(() => {
    if (phase !== GamePhase.GAMEPLAY) {
        stopAllMusic(1.5);
    }
  }, [phase, stopAllMusic]);

  const handleStartGame = useCallback(async (settings: BDGameSettings) => {
    setLastSettings(settings);

    const config = {
        Einfach: { modules: 2, timer: 300, strikes: 3, allowedModules: ['wires', 'button'] as BombModuleType[] },
        Mittel: { modules: 3, timer: 240, strikes: 3, allowedModules: ['wires', 'button', 'keypad'] as BombModuleType[] },
        Schwer: { modules: 4, timer: 180, strikes: 2, allowedModules: ['wires', 'button', 'keypad', 'simonSays'] as BombModuleType[] },
    };

    let bombOptions;
    if (settings.difficulty === 'Individuell') {
        bombOptions = {
            modules: settings.customModules,
            timer: settings.customTime,
            strikes: settings.customStrikes,
            allowedModules: settings.customModuleSelection,
        };
    } else {
        bombOptions = config[settings.difficulty];
    }
    
    const newBomb = generateBomb(bombOptions);
    setBomb(newBomb);
    setOutcome(null);
    setPhase(GamePhase.GAMEPLAY);
    
    if (!settings.musicEnabled) {
        stopAllMusic(0);
        return;
    }
    
    const ctx = getAudioContext();
    if (!ctx) {
      console.error("Kann Audio nicht abspielen: Web Audio API context nicht verfügbar.");
      return;
    }
    
    if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch (e) { console.error("Konnte AudioContext nicht fortsetzen:", e); return; }
    }

    stopAllMusic(0.2);
    
    try {
      if (!audioBufferRef.current) {
        const isGitHubPages = window.location.pathname.startsWith('/Party-Games/');
        const basePath = isGitHubPages ? '/Party-Games/' : '/';
        const musicPath = `${basePath}audio/bomb_squad_music.ogg`.replace('//', '/');

        const response = await fetch(musicPath);
        if (!response.ok) throw new Error(`Audio-Abruf fehlgeschlagen: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await ctx.decodeAudioData(arrayBuffer);
      }

      if (!audioBufferRef.current) return;
      
      scheduleNextMusicSegment(true);

    } catch (error) {
        console.error("Fehler beim Laden oder Abspielen der Hintergrundmusik:", error);
    }
  }, [scheduleNextMusicSegment, stopAllMusic]);

  const handleEndGame = useCallback((result: 'defused' | 'exploded') => {
    setOutcome(result);
    setPhase(GamePhase.RESULTS);
  }, []);
  
  const handlePlayAgain = useCallback(() => {
    setPhase(GamePhase.SETUP);
  }, []);

  if (showManual) {
    return <BDManualScreen onExit={() => setShowManual(false)} />;
  }

  switch (phase) {
    case GamePhase.SETUP:
      return <BDSetupScreen onStartGame={handleStartGame} onExit={onExit} lastSettings={lastSettings} onShowManual={() => setShowManual(true)} />;
    case GamePhase.GAMEPLAY:
      return bomb ? <BDGameplayScreen bomb={bomb} onEndGame={handleEndGame} /> : null;
    case GamePhase.RESULTS:
        return outcome ? <BDResultsScreen outcome={outcome} onPlayAgain={handlePlayAgain} /> : null;
    default:
      return <BDSetupScreen onStartGame={handleStartGame} onExit={onExit} lastSettings={lastSettings} onShowManual={() => setShowManual(true)} />;
  }
};

export default BombenentschaerfungGame;
