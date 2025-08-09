export interface ReleaseNote {
  version: string;
  optionalTitle?: string;
  whatsNew: (string | string[])[];
  bugFixes: (string | string[])[];
  adjustments: (string | string[])[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.0.0",
    optionalTitle: "Erster Release",
    whatsNew: [
      "Willkommen zur ersten Version der Party Spielesammlung!",
      "Folgende Spiele sind enthalten:",
      [
        "Impostor Party",
        "Werwölfe",
        "Wort-Akrobaten",
        "Agenten Undercover",
        "Bombenkommando",
        "Flaschendrehen",
        "Moralischer Kompass",
        "Krimi Klub",
      ],
      "Erstelle und teile deine eigenen Kartensets in den meisten Spielen.",
    ],
    bugFixes: [],
    adjustments: []
  }
];

export const CURRENT_VERSION = RELEASE_NOTES[0].version;