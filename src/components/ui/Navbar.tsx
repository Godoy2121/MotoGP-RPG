import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, User, Flag, Star, BarChart2, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGameStore } from '../../store/gameStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: Flag },
  { to: '/championship', label: 'Campeonato', icon: Trophy },
  { to: '/achievements', label: 'Logros', icon: Star },
  { to: '/leaderboard', label: 'Ranking', icon: BarChart2 },
  { to: '/profile', label: 'Perfil', icon: User },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { user, character } = useGameStore();

  return (
    <nav className="bg-motogp-card border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-motogp-red font-orbitron font-black text-lg tracking-wider">MOTO</span>
          <span className="text-white font-orbitron font-black text-lg tracking-wider">GP RPG</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === to
                  ? 'bg-motogp-red/20 text-motogp-red'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* User + logout */}
        <div className="hidden md:flex items-center gap-3">
          {character && (
            <span className="text-xs text-gray-500 font-orbitron">
              #{character.numero} {character.apellido}
            </span>
          )}
          <button
            onClick={logout}
            className="text-gray-400 hover:text-motogp-red transition-colors p-1"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
          {user?.photoURL && (
            <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full" />
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-motogp-card">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-white/5 ${
                pathname === to ? 'text-motogp-red bg-motogp-red/10' : 'text-gray-400'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}
