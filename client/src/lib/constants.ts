import { StatType, STATS, RANKS, JOBS } from "@shared/schema";

// Rank colors
export const RANK_COLORS = {
  E: "bg-gray-500 text-gray-100",
  D: "bg-green-500 text-gray-900",
  C: "bg-blue-500 text-white",
  B: "bg-purple-400 text-white",
  A: "bg-orange-400 text-gray-900",
  S: "bg-red-400 text-white",
  SS: "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-glow-purple"
};

// Stat colors for progress bars
export const STAT_COLORS = {
  strength: "bg-red-500",
  stamina: "bg-green-500",
  speed: "bg-blue-500",
  endurance: "bg-purple-500"
};

// Stat display names
export const STAT_NAMES: Record<StatType, string> = {
  strength: "Strength",
  stamina: "Stamina",
  speed: "Speed",
  endurance: "Endurance"
};

// XP required for each level
export const XP_PER_LEVEL = 500;

// Requirements for rank up
export const RANK_REQUIREMENTS = {
  E: { level: 5, stats: 25 },
  D: { level: 10, stats: 50 },
  C: { level: 15, stats: 75 },
  B: { level: 20, stats: 100 },
  A: { level: 25, stats: 125 },
  S: { level: 30, stats: 150 },
};

// Job perks
export const JOB_PERKS = {
  "Novice Hunter": [
    "Basic training capabilities",
    "Standard XP gain",
    "Access to beginner quests"
  ],
  "Assassin": [
    "+15% Speed Bonus",
    "+10% Critical Hits",
    "2× XP from Speed workouts"
  ],
  "Berserker": [
    "+15% Strength Bonus",
    "+10% Attack Power",
    "Rage Mode: +25% XP for Strength workouts"
  ],
  "Mage": [
    "+15% Stamina Bonus",
    "+10% Energy Control",
    "Meditation: +20% XP for Stamina workouts"
  ],
  "Tank": [
    "+15% Defense Bonus",
    "+10% Endurance",
    "Fortification: +25% XP for Endurance workouts"
  ],
  "Warlock": [
    "+15% Mana Control",
    "+10% Magic Boost",
    "Dark Energy: +30% XP for all workouts"
  ],
  "Shadow Monarch": [
    "All stats +20%",
    "Special skills unlocked",
    "Shadow Army: +50% XP for all workouts"
  ]
};

// Rank description
export const RANK_DESCRIPTION = {
  E: "Beginner",
  D: "Casual",
  C: "Intermediate",
  B: "Advanced",
  A: "Pro-Level",
  S: "Elite Hunter",
  SS: "Legendary Hunter"
};
