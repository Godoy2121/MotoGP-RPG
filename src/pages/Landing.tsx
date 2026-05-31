import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export function Landing() {
  const { signInWithGoogle, loading } = useAuth();
  const { canInstall, install } = usePWAInstall();

  return (
    <div className="min-h-screen bg-motogp-dark flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-motogp-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center z-10 max-w-lg"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="text-6xl mb-2">🏍️</div>
          <h1 className="font-orbitron font-black text-5xl mb-1">
            <span className="text-motogp-red">MOTO</span>
            <span className="text-white">GP</span>
          </h1>
          <h2 className="font-orbitron font-bold text-2xl text-gray-300 tracking-widest">
            RPG MANAGER
          </h2>
          <div className="mt-2 inline-block bg-motogp-red/20 border border-motogp-red/30 rounded px-3 py-1">
            <span className="text-motogp-red text-xs font-orbitron font-bold tracking-wider">TEMPORADA 2026</span>
          </div>
        </motion.div>

        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-base mb-8 leading-relaxed"
        >
          Crea tu piloto, elige equipo y compite en los <strong className="text-white">22 Grandes Premios</strong> del Mundial 2026.
          Decisiones en tiempo real, progresión de carrera y clasificaciones mundiales.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-8 text-center"
        >
          {[
            { icon: '🏆', label: '22 Grandes Premios' },
            { icon: '⚡', label: 'Sprints cada semana' },
            { icon: '📈', label: 'Progresión de carrera' },
          ].map(f => (
            <div key={f.label} className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs text-gray-400">{f.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3 items-center"
        >
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4 w-full max-w-sm justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Entrando...' : 'Comenzar con Google'}
          </button>

          {canInstall && (
            <button
              onClick={install}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Download size={14} />
              Instalar app
            </button>
          )}
        </motion.div>

        <p className="text-gray-600 text-xs mt-6">v0.1.0 · MotoGP RPG Manager</p>
      </motion.div>
    </div>
  );
}
