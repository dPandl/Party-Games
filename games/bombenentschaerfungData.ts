// Types
export type WireColor = 'red' | 'blue' | 'yellow' | 'white' | 'black';
export type ButtonColor = 'red' | 'blue' | 'yellow' | 'white';
export type ButtonText = 'DRÜCK' | 'HALT' | 'SPRENG' | 'LOS';
export type SimonSaysColor = 'red' | 'blue' | 'green' | 'yellow';

export type BombModuleType = 'wires' | 'button' | 'keypad' | 'simonSays';

export const AVAILABLE_MODULES: { type: BombModuleType; name: string }[] = [
    { type: 'wires', name: 'Drähte' },
    { type: 'button', name: 'Der Knopf' },
    { type: 'keypad', name: 'Symbole' },
    { type: 'simonSays', name: 'Simon Sagt' },
];

export interface WiresModule {
  type: 'wires';
  id: string;
  wires: WireColor[];
  solved: boolean;
}

export interface ButtonModule {
  type: 'button';
  id: string;
  color: ButtonColor;
  text: ButtonText;
  solved: boolean;
}

const KEYPAD_COLUMNS = [
    ['★', 'Ω', 'Ѭ', 'Ӭ', '҂', 'ϗ'],
    ['Ѯ', '★', 'ϗ', 'Ѽ', 'Ψ', 'Ӭ'],
    ['Ӂ', 'Ѧ', 'Ψ', 'Ω', 'Ѽ', '҂'],
    ['Ѭ', 'Ӂ', 'Ѯ', 'ϗ', 'Ѧ', '★']
];

export interface KeypadModule {
  type: 'keypad';
  id:string;
  symbols: string[]; // 4 symbols
  solved: boolean;
}

export interface SimonSaysModule {
  type: 'simonSays';
  id: string;
  colors: SimonSaysColor[];
  solved: boolean;
}

export type BombModule = WiresModule | ButtonModule | KeypadModule | SimonSaysModule;

export interface Bomb {
  serialNumber: string;
  batteries: number;
  modules: BombModule[];
  timer: number;
  maxStrikes: number;
}

// Bomb Generation
const generateSerialNumber = () => `BRX-${Math.floor(Math.random() * 900) + 100}-${String.fromCharCode(65 + Math.random() * 26)}${String.fromCharCode(65 + Math.random() * 26)}`;

const generateWiresModule = (id: string): WiresModule => {
  const wireCount = Math.floor(Math.random() * 4) + 3; // 3 to 6 wires
  const colors: WireColor[] = ['red', 'blue', 'yellow', 'white', 'black'];
  const wires = Array.from({ length: wireCount }, () => colors[Math.floor(Math.random() * colors.length)]);
  return { type: 'wires', id, wires, solved: false };
};

const generateButtonModule = (id: string): ButtonModule => {
  const colors: ButtonColor[] = ['red', 'blue', 'yellow', 'white'];
  const texts: ButtonText[] = ['DRÜCK', 'HALT', 'SPRENG', 'LOS'];
  return {
    type: 'button',
    id,
    color: colors[Math.floor(Math.random() * colors.length)],
    text: texts[Math.floor(Math.random() * texts.length)],
    solved: false,
  };
};

const generateKeypadModule = (id: string): KeypadModule => {
    // 1. Wähle eine zufällige Spalte aus dem Handbuch
    const randomColumnIndex = Math.floor(Math.random() * KEYPAD_COLUMNS.length);
    const selectedColumn = KEYPAD_COLUMNS[randomColumnIndex];

    // 2. Mische die Symbole dieser Spalte und nimm die ersten vier
    const shuffledSymbols = [...selectedColumn].sort(() => 0.5 - Math.random());
    const symbols = shuffledSymbols.slice(0, 4);
    
    return { type: 'keypad', id, symbols, solved: false };
};

const generateSimonSaysModule = (id: string): SimonSaysModule => {
    const colors: SimonSaysColor[] = ['red', 'blue', 'green', 'yellow'];
    const sequenceLength = Math.floor(Math.random() * 3) + 3; // 3 to 5 colors
    const flashingColors = Array.from({ length: sequenceLength }, () => colors[Math.floor(Math.random() * colors.length)]);
    return { type: 'simonSays', id, colors: flashingColors, solved: false };
}


export const generateBomb = (options: { modules: number; timer: number; strikes: number; allowedModules?: BombModuleType[] }): Bomb => {
  const { modules: moduleCount, timer, strikes: maxStrikes, allowedModules } = options;
  
  // Use allowedModules if provided and not empty, otherwise use all module types
  const moduleTypes = (allowedModules && allowedModules.length > 0) ? allowedModules : ['wires', 'button', 'keypad', 'simonSays'];
  
  const modules: BombModule[] = Array.from({ length: moduleCount }, (_, i) => {
    const type = moduleTypes[Math.floor(Math.random() * moduleTypes.length)];
    const id = `mod-${i}`;
    if (type === 'wires') return generateWiresModule(id);
    if (type === 'button') return generateButtonModule(id);
    if (type === 'keypad') return generateKeypadModule(id);
    // Simon says is the only one left
    return generateSimonSaysModule(id);
  });

  return {
    serialNumber: generateSerialNumber(),
    batteries: Math.floor(Math.random() * 5), // Generates 0 to 4 batteries
    modules,
    timer,
    maxStrikes,
  };
};

// Manual
export const MANUAL_CONTENT = {
    wires: {
        title: 'Drähte',
        rules: [
            { cond: "Wenn es 3 Drähte gibt:", val: "Wenn kein roter Draht da ist, schneide den zweiten Draht durch. Ansonsten, wenn der letzte Draht weiß ist, schneide den letzten Draht durch. Ansonsten, wenn es mehr als einen blauen Draht gibt, schneide den letzten blauen Draht durch. Ansonsten schneide den letzten Draht durch." },
            { cond: "Wenn es 4 Drähte gibt:", val: "Wenn es mehr als einen roten Draht gibt und die letzte Ziffer der Seriennummer ungerade ist, schneide den letzten roten Draht durch. Ansonsten, wenn der letzte Draht gelb ist und keine roten Drähte da sind, schneide den ersten Draht durch. Ansonsten, wenn es genau einen blauen Draht gibt, schneide den ersten Draht durch. Ansonsten, wenn es mehr als einen gelben Draht gibt, schneide den letzten Draht durch. Ansonsten schneide den zweiten Draht durch." },
            { cond: "Wenn es 5 Drähte gibt:", val: "Wenn der letzte Draht schwarz ist und die letzte Ziffer der Seriennummer ungerade ist, schneide den vierten Draht durch. Ansonsten, wenn es genau einen roten Draht und mehr als einen gelben Draht gibt, schneide den ersten Draht durch. Ansonsten, wenn es keine schwarzen Drähte gibt, schneide den zweiten Draht durch. Ansonsten schneide den ersten Draht durch." },
            { cond: "Wenn es 6 Drähte gibt:", val: "Wenn es keine gelben Drähte gibt und die letzte Ziffer der Seriennummer ungerade ist, schneide den dritten Draht durch. Ansonsten, wenn es genau einen gelben Draht und mehr als einen weißen Draht gibt, schneide den vierten Draht durch. Ansonsten, wenn es keine roten Drähte gibt, schneide den letzten Draht durch. Ansonsten schneide den vierten Draht durch." },
        ]
    },
    button: {
        title: 'Der Knopf',
        rules: [
            "1. Wenn der Knopf blau ist und 'HALT' anzeigt, halte den Knopf gedrückt.",
            "2. Wenn es mehr als 1 Batterie gibt und der Knopf 'SPRENG' anzeigt, drücke den Knopf sofort.",
            "3. Wenn der Knopf weiß ist, halte den Knopf gedrückt.",
            "4. Wenn es mehr als 2 Batterien gibt und der Knopf 'LOS' anzeigt, halte den Knopf gedrückt.",
            "5. Wenn der Knopf gelb ist, halte den Knopf gedrückt.",
            "6. Wenn der Knopf rot ist und 'HALT' anzeigt, drücke den Knopf sofort.",
            "7. In allen anderen Fällen, halte den Knopf gedrückt."
        ],
        strip: [
            "Blauer Streifen: Lasse bei einer 4 in der Zeitanzeige los.",
            "Weißer Streifen: Lasse bei einer 1 in der Zeitanzeige los.",
            "Gelber Streifen: Lasse bei einer 5 in der Zeitanzeige los.",
            "Anderer Streifen: Lasse bei einer 1 in der Zeitanzeige los."
        ]
    },
    keypad: {
        title: 'Symbole',
        instructions: "Drücke die vier Symbole in der richtigen Reihenfolge. Finde die Spalte, die alle vier Symbole deiner Anzeige enthält, und drücke sie dann in der Reihenfolge, in der sie in dieser Spalte von oben nach unten erscheinen.",
        columns: KEYPAD_COLUMNS
    },
    simonSays: {
        title: 'Simon Sagt',
        rules: [
            { cond: "Wenn die Seriennummer einen Vokal (A, E, I, O, U) enthält:", val: "Bei 0 Fehlern: Tausche Rot mit Blau und Grün mit Gelb. Bei 1 Fehler: Drücke die Farben in der angezeigten Reihenfolge. Bei 2+ Fehlern: Drücke die Farben in umgekehrter Reihenfolge." },
            { cond: "Wenn die Seriennummer KEINEN Vokal enthält:", val: "Bei 0 Fehlern: Drücke die Farben in der angezeigten Reihenfolge. Bei 1 Fehler: Drücke die Farben in umgekehrter Reihenfolge. Bei 2+ Fehlern: Rotiere die Farben (Rot wird Blau, Blau wird Grün, Grün wird Gelb, Gelb wird Rot)." }
        ]
    }
};
