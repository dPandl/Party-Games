import { Game } from '../types';
import ImpostorPartyGame from './ImpostorPartyGame';
import AgentenUndercoverGame from './AgentenUndercoverGame';
import FlaschendrehenGame from './FlaschendrehenGame';
import MoralischerKompassGame from './MoralischerKompassGame';
import BombenentschaerfungGame from './BombenentschaerfungGame';
import KrimiKlubGame from './KrimiKlubGame';
import WortakrobatenGame from './WortakrobatenGame';
import WerwoelfeGame from './WerwoelfeGame';
import { MIN_PLAYERS, MAX_PLAYERS, AU_MIN_PLAYERS, AU_MAX_PLAYERS, FD_MIN_PLAYERS, FD_MAX_PLAYERS, MK_MIN_PLAYERS, MK_MAX_PLAYERS, BD_MIN_PLAYERS, BD_MAX_PLAYERS, KK_MIN_PLAYERS, KK_MAX_PLAYERS, WA_MIN_PLAYERS, WA_MAX_PLAYERS, WW_MIN_PLAYERS, WW_MAX_PLAYERS } from '../constants';

export const GAMES: Game[] = [
  {
    id: 'impostor-party',
    title: 'Impostor Party',
    tagline: 'Wort-Detektive',
    description: 'Finde den Hochstapler, der das geheime Wort nicht kennt, indem ihr es abwechselnd beschreibt.',
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    component: ImpostorPartyGame,
    colorGradient: 'from-teal-500 to-blue-600',
  },
  {
    id: 'werwoelfe',
    title: 'Werwölfe',
    tagline: 'Das Dorf in der Dämmerung',
    description: 'Entlarvt die Werwölfe, bevor sie alle Dorfbewohner fressen. Ein Spiel voller Lügen und Täuschung.',
    minPlayers: WW_MIN_PLAYERS,
    maxPlayers: WW_MAX_PLAYERS,
    component: WerwoelfeGame,
    colorGradient: 'from-indigo-600 to-red-700',
  },
   {
    id: 'wort-akrobaten',
    title: 'Wort-Akrobaten',
    tagline: 'Sags nicht!',
    description: 'Beschreibe deinem Team ein Wort, ohne die verbotenen Begriffe zu benutzen. Ein Wettlauf gegen die Zeit!',
    minPlayers: WA_MIN_PLAYERS,
    maxPlayers: WA_MAX_PLAYERS,
    component: WortakrobatenGame,
    colorGradient: 'from-lime-500 to-green-600',
  },
  {
    id: 'agenten-undercover',
    title: 'Agenten Undercover',
    tagline: 'Spionagespiel',
    description: 'Entlarvt den feindlichen Spion, der euren geheimen Einsatzort nicht kennt.',
    minPlayers: AU_MIN_PLAYERS,
    maxPlayers: AU_MAX_PLAYERS,
    component: AgentenUndercoverGame,
    colorGradient: 'from-purple-600 to-pink-600',
  },
    {
    id: 'bombenentschaerfung',
    title: 'Bomben­kommando',
    tagline: 'Team-Kommunikation',
    description: 'Ein Spieler entschärft die Bombe, die anderen haben das Handbuch. Redet miteinander, schnell!',
    minPlayers: BD_MIN_PLAYERS,
    maxPlayers: BD_MAX_PLAYERS,
    component: BombenentschaerfungGame,
    colorGradient: 'from-red-700 to-slate-800',
  },
  {
    id: 'flaschendrehen',
    title: 'Flaschendrehen',
    tagline: 'Wahrheit oder Pflicht',
    description: 'Der klassische Party-Hit! Drehe die Flasche und stelle dich der Wahrheit oder einer gewagten Aufgabe.',
    minPlayers: FD_MIN_PLAYERS,
    maxPlayers: FD_MAX_PLAYERS,
    component: FlaschendrehenGame,
    colorGradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'moralischer-kompass',
    title: 'Moralischer Kompass',
    tagline: 'Knifflige Dilemmas',
    description: 'Stellt euch moralischen Zwickmühlen. Antwortet geheim und diskutiert, wer wie entschieden hat.',
    minPlayers: MK_MIN_PLAYERS,
    maxPlayers: MK_MAX_PLAYERS,
    component: MoralischerKompassGame,
    colorGradient: 'from-indigo-600 to-slate-800',
  },
  {
    id: 'krimi-klub',
    title: 'Krimi Klub',
    tagline: 'Kooperative Detektivarbeit',
    description: 'Ein Spielleiter kennt ein mysteriöses Geheimnis. Die Detektive müssen durch kluge Ja/Nein-Fragen herausfinden, was wirklich geschah.',
    minPlayers: KK_MIN_PLAYERS,
    maxPlayers: KK_MAX_PLAYERS,
    component: KrimiKlubGame,
    colorGradient: 'from-slate-600 to-slate-800',
  }
];