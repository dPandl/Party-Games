export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 30;
export const AU_MIN_PLAYERS = 3;
export const AU_MAX_PLAYERS = 12;
export const FD_MIN_PLAYERS = 2;
export const FD_MAX_PLAYERS = 20;
export const MK_MIN_PLAYERS = 2;
export const MK_MAX_PLAYERS = 20;
export const BD_MIN_PLAYERS = 2;
export const BD_MAX_PLAYERS = 8;
export const KK_MIN_PLAYERS = 2;
export const KK_MAX_PLAYERS = 20;
export const WA_MIN_PLAYERS = 2;
export const WA_MAX_PLAYERS = 20;
export const WW_MIN_PLAYERS = 5;
export const WW_MAX_PLAYERS = 20;


/**
 * Legt eine ausgewogene Standardanzahl von Impostorn basierend auf der Spielerzahl fest.
 * @param playerCount Die Gesamtzahl der Spieler.
 * @returns Die empfohlene Anzahl von Impostorn.
 */
export const getDefaultImpostorCount = (playerCount: number): number => {
  if (playerCount < 6) return 1;
  if (playerCount < 9) return 2;
  if (playerCount < 15) return 3;
  if (playerCount < 20) return 4;
  if (playerCount < 25) return 5;
  return 6;
};

/**
 * Berechnet die maximal zulässige Anzahl von Impostorn basierend auf der Spieleranzahl.
 * Entspricht der Regel floor(playerCount / 2).
 * @param playerCount Die Gesamtzahl der Spieler.
 * @returns Die maximal zulässige Anzahl von Impostorn.
 */
export const getMaxImpostors = (playerCount: number): number => {
  const max = Math.floor(playerCount / 2);
  // Es muss immer mindestens einen Impostor geben.
  return Math.max(1, max);
};


export const DEFAULT_DISCUSSION_TIME_SECONDS = 120; // 2 Minuten

export const ALL_GAME_SET_STORAGE_KEYS = [
  'impostorCustomThemes',
  'agentenCustomLocationSets',
  'flaschendrehenCustomTaskSets',
  'moralischerKompassCustomSets',
  'krimiKlubCustomSets',
  'wortakrobatenCustomSets',
];

export const ALL_SETTINGS_STORAGE_KEYS = [
    'highContrastEnabled',
    'show18PlusContent',
];