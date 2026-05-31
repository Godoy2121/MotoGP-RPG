import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, UserProfile, PlayerCharacter, CareerSeason, RaceSession, LeaderboardEntry } from '../types';

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      user: null,
      character: null,
      season: null,
      activeRace: null,
      leaderboard: [],

      setUser: (user: UserProfile | null) => set({ user }),
      setCharacter: (character: PlayerCharacter | null) => set({ character }),
      setSeason: (season: CareerSeason | null) => set({ season }),
      setActiveRace: (activeRace: RaceSession | null) => set({ activeRace }),
      setLeaderboard: (leaderboard: LeaderboardEntry[]) => set({ leaderboard }),
      resetGame: () => set({ character: null, season: null, activeRace: null }),
    }),
    {
      name: 'motogp-rpg-game',
      partialize: (state) => ({
        character: state.character,
        season: state.season,
      }),
    }
  )
);
