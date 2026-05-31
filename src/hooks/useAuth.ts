import { useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithRedirect, getRedirectResult,
  signOut, type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { getUserProfile, createUserProfile } from '../services/gameService';
import { useGameStore } from '../store/gameStore';
import type { UserProfile } from '../types';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useGameStore();

  useEffect(() => {
    // Procesar resultado del redirect de vuelta a la app
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? 'Piloto',
            photoURL: firebaseUser.photoURL ?? undefined,
            totalXp: 0,
            achievements: [],
            createdAt: Date.now(),
            stats: {
              totalRaces: 0,
              totalWins: 0,
              totalPodiums: 0,
              totalPoles: 0,
              bestChampionshipPosition: 99,
              seasonsCompleted: 0,
            },
          };
          await createUserProfile(profile);
        }
        setUser(profile as UserProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser]);

  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    useGameStore.getState().resetGame();
    setUser(null);
  };

  return { user, loading, signInWithGoogle, logout };
}
