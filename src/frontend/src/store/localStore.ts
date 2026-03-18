import type { Lineup, Match, Player, Scorecard, TeamSettings } from "../types";

const KEYS = {
  players: "sw_players",
  matches: "sw_matches",
  settings: "sw_settings",
  userMobile: "sw_user_mobile",
};

const DEFAULT_PLAYERS: Player[] = [
  {
    id: "1",
    name: "Hayan Khan",
    mobile: "03001234567",
    role: "Batsman",
    jerseyNumber: 7,
    battingStyle: "Right-hand bat",
  },
  {
    id: "2",
    name: "Ali Raza",
    mobile: "03009876543",
    role: "Bowler",
    jerseyNumber: 11,
    bowlingStyle: "Right-arm fast",
  },
  {
    id: "3",
    name: "Usman Tariq",
    mobile: "03211111111",
    role: "All-rounder",
    jerseyNumber: 5,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
  },
  {
    id: "4",
    name: "Bilal Ahmed",
    mobile: "03322222222",
    role: "Wicket-keeper",
    jerseyNumber: 1,
    battingStyle: "Right-hand bat",
  },
  {
    id: "5",
    name: "Faisal Mahmood",
    mobile: "03433333333",
    role: "Bowler",
    jerseyNumber: 9,
    bowlingStyle: "Left-arm spin",
  },
  {
    id: "6",
    name: "Zain ul Abideen",
    mobile: "03154444444",
    role: "Batsman",
    jerseyNumber: 3,
    battingStyle: "Left-hand bat",
  },
  {
    id: "7",
    name: "Kamran Akmal",
    mobile: "03005555555",
    role: "Batsman",
    jerseyNumber: 14,
    battingStyle: "Right-hand bat",
  },
  {
    id: "8",
    name: "Saad Naseem",
    mobile: "03116666666",
    role: "Bowler",
    jerseyNumber: 17,
    bowlingStyle: "Right-arm fast",
  },
  {
    id: "9",
    name: "Tariq Jameel",
    mobile: "03237777777",
    role: "All-rounder",
    jerseyNumber: 6,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Left-arm spin",
  },
  {
    id: "10",
    name: "Umer Gul",
    mobile: "03348888888",
    role: "Bowler",
    jerseyNumber: 22,
    bowlingStyle: "Right-arm fast-medium",
  },
  {
    id: "11",
    name: "Nabeel Shah",
    mobile: "03459999999",
    role: "All-rounder",
    jerseyNumber: 8,
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm medium",
  },
];

const DEFAULT_MATCHES: Match[] = [
  {
    id: "1",
    opponent: "Royal Strikers",
    date: "2026-03-10",
    venue: "Gaddafi Stadium",
    format: "T20",
    result: "Won",
    teamScore: "187/5",
    oppScore: "163/9",
  },
  {
    id: "2",
    opponent: "City Hawks",
    date: "2026-02-28",
    venue: "National Stadium",
    format: "T20",
    result: "Lost",
    teamScore: "145/8",
    oppScore: "148/6",
  },
  {
    id: "3",
    opponent: "Desert Eagles",
    date: "2026-03-18",
    venue: "Arbab Niaz Stadium",
    format: "T20",
  },
];

const DEFAULT_SETTINGS: TeamSettings = {
  teamName: "Sultan Warriors",
  captainMobile: "03001234567",
  founded: "2020",
  homeGround: "Gaddafi Stadium, Lahore",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStore = {
  getPlayers: (): Player[] => load(KEYS.players, DEFAULT_PLAYERS),
  savePlayers: (players: Player[]) => save(KEYS.players, players),

  getMatches: (): Match[] => load(KEYS.matches, DEFAULT_MATCHES),
  saveMatches: (matches: Match[]) => save(KEYS.matches, matches),

  getSettings: (): TeamSettings => load(KEYS.settings, DEFAULT_SETTINGS),
  saveSettings: (s: TeamSettings) => save(KEYS.settings, s),

  getUserMobile: (): string => localStorage.getItem(KEYS.userMobile) || "",
  saveUserMobile: (m: string) => localStorage.setItem(KEYS.userMobile, m),
  clearUserMobile: () => localStorage.removeItem(KEYS.userMobile),

  // Lineup
  getLineup: (matchDate: string): Lineup | null =>
    load<Lineup | null>(`lineup_${matchDate}`, null),
  saveLineup: (lineup: Lineup) => save(`lineup_${lineup.matchDate}`, lineup),

  // Scorecard
  getScorecard: (matchDate: string): Scorecard | null =>
    load<Scorecard | null>(`scorecard_${matchDate}`, null),
  saveScorecard: (sc: Scorecard) => save(`scorecard_${sc.matchDate}`, sc),
};
