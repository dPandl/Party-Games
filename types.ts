import React from 'react';

export enum GameState {
  SETUP,
  LOADING,
  TRANSITION,
  REVEAL,
  DISCUSSION,
  VOTING,
  RESULTS,
}

export interface Player {
  id: number;
  name: string;
  role: 'Player' | 'Impostor';
}

export interface Game {
  id:string;
  title: string;
  tagline: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  component: React.FC<{ onExit: () => void }> | (() => null);
  colorGradient: string;
}

export type AnimationState = 'idle' | 'pre-in' | 'in' | 'active' | 'out';

export interface GameSettings {
  playerNames: string[];
  impostorCount: number;
  themes: string[];
  discussionTime: number; // in seconds
  withVoting: boolean;
  giveImpostorHint: boolean;
}

export interface CustomTheme {
  name: string;
  words: string[];
  isAdult?: boolean;
}

export interface CustomLocationSet {
  name: string;
  locations: string[];
  isAdult?: boolean;
}

export interface CustomTruthOrDareSet {
  name: string;
  wahrheit: string[];
  pflicht: string[];
  isAdult?: boolean;
}

export interface Dilemma {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
}

export interface CustomDilemmaSet {
  name: string;
  dilemmas: Dilemma[];
  isAdult?: boolean;
}

export interface BlackStory {
  id: string;
  title: string;
  scenario: string;
  solution: string;
  details: string;
}

export interface CustomBlackStorySet {
  name: string;
  stories: BlackStory[];
  isAdult?: boolean;
}

// --- Wort-Akrobaten Types ---
export type WACardType = 'explain' | 'pantomime';

export interface WACard {
  id: string;
  type: WACardType;
  word: string;
  taboos?: string[];
}

export interface CustomWASet {
  name:string;
  cards: WACard[];
  isAdult?: boolean;
}

export type WAPlayStyle = 'teams' | 'freeForAll';
export type WAWinCondition = 'score' | 'rounds';
export type WATurnStyle = 'classic' | 'singleWord';
export type WACardMode = 'explain' | 'pantomime' | 'mixed';

export interface WASettings {
    playerNames: string[];
    roundTime: number; // in seconds
    winScore: number;
    roundCount: number;
    playStyle: WAPlayStyle;
    winCondition: WAWinCondition;
    turnStyle: WATurnStyle;
    gameMode: WACardMode;
    selectedSets: string[];
    customWACards: CustomWASet[];
}

export interface WAGameState {
    teamAScore: number;
    teamBScore: number;
    playerScores: { [playerName: string]: number };
    currentTeam: 'A' | 'B';
    // Team mode
    teamAPlayerIndex: number;
    teamBPlayerIndex: number;
    // Free for all mode
    currentPlayerIndex: number;
    // Round-based win condition
    turnsTaken: number;
    currentRound: number;
}

// --- Werwölfe Types ---
export type WerwolfRole = 'Werwolf' | 'Dorfbewohner' | 'Seherin' | 'Hexe' | 'Amor' | 'Jäger';

export interface WWPlayer {
    id: number;
    name: string;
    role: WerwolfRole;
    isAlive: boolean;
    isLover: boolean;
}