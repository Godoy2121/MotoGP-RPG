import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useGameStore } from './store/gameStore';
import { getCharacter, getSeason } from './services/gameService';
import { Navbar } from './components/ui/Navbar';
import { Landing } from './pages/Landing';
import { CharacterCreate } from './pages/CharacterCreate';
import { Dashboard } from './pages/Dashboard';
import { RacePage } from './pages/RacePage';
import { Championship } from './pages/Championship';
import { Profile } from './pages/Profile';
import { Achievements } from './pages/Achievements';
import { Leaderboard } from './pages/Leaderboard';

function AppInner() {
  const { user, loading } = useAuth();
  const { character, season, setCharacter, setSeason } = useGameStore();

  useEffect(() => {
    if (!user) return;
    const restoreSession = async () => {
      if (user.activeCharacterId && !character) {
        const char = await getCharacter(user.activeCharacterId);
        if (char) setCharacter(char);
      }
      if (user.activeSeasonId && !season) {
        const s = await getSeason(user.activeSeasonId);
        if (s) setSeason(s);
      }
    };
    restoreSession();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-motogp-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏍️</div>
          <p className="text-gray-400 font-orbitron text-sm">Cargando paddock...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Landing />;

  if (!character) return <CharacterCreate />;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-motogp-dark">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/race" element={<RacePage />} />
          <Route path="/championship" element={<Championship />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppInner />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#ffffff',
            border: '1px solid rgba(228, 3, 23, 0.3)',
          },
        }}
      />
    </BrowserRouter>
  );
}
