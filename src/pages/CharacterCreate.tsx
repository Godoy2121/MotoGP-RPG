import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { RiderAvatar } from '../components/ui/RiderAvatar';
import { saveCharacter, createSeason, buildInitialStandings, buildInitialConstructors, xpForNextLevel } from '../services/gameService';
import { updateUserProfile } from '../services/gameService';
import { TEAMS_2026, getTeamsByTier } from '../data/teams2026';
import { RIDERS_2026, getRidersByTeam } from '../data/riders2026';
import { StatBar } from '../components/ui/StatBar';
import type { PlayerCharacter, CareerSeason, RiderStats, AvatarStyle } from '../types';

const NATIONALITIES = [
  'Español', 'Italiano', 'Francés', 'Alemán', 'Británico', 'Australiano',
  'Japonés', 'Brasileño', 'Turco', 'Sudafricano', 'Portugués', 'Holandés',
  'Argentino', 'Estadounidense', 'Tailandés', 'Indonesio', 'Malayo',
];

const STAT_INFO: { key: keyof RiderStats; label: string; icon: string; description: string }[] = [
  { key: 'velocidad', label: 'Velocidad', icon: '⚡', description: 'Ritmo en clasificación y carrera' },
  { key: 'frenada', label: 'Frenada', icon: '🛑', description: 'Capacidad de frenada tardía y ataque' },
  { key: 'pasoCurva', label: 'Paso por Curva', icon: '🔄', description: 'Velocidad en ápex y curvas medias' },
  { key: 'aceleracion', label: 'Aceleración', icon: '🚀', description: 'Control de tracción y salida de curva' },
  { key: 'tiempoMojado', label: 'Tiempo Mojado', icon: '🌧️', description: 'Rendimiento con lluvia o pista húmeda' },
  { key: 'gestionNeumaticos', label: 'Gestión Neumáticos', icon: '🔵', description: 'Preservación de neumáticos Michelin' },
];

const INITIAL_STATS: RiderStats = {
  velocidad: 60, frenada: 60, pasoCurva: 60, aceleracion: 60, tiempoMojado: 60, gestionNeumaticos: 60,
};
const STAT_POINTS_TO_DISTRIBUTE = 20;
const STAT_MAX = 95;

const HELMET_COLORS = ['#E40317', '#FF6B00', '#003087', '#1A1A1A', '#F5D800', '#00B8A9', '#6A0DAD', '#FFFFFF'];
const SUIT_COLORS = ['#E40317', '#003087', '#1A1A1A', '#F5D800', '#FF6B00', '#2D2D2D', '#6A0DAD', '#006633'];

export function CharacterCreate() {
  const [step, setStep] = useState(1);
  const { user, setCharacter, setSeason } = useGameStore();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [nacionalidad, setNacionalidad] = useState('Español');
  const [numero, setNumero] = useState(99);
  const [teamId, setTeamId] = useState('');
  const [replacedRiderId, setReplacedRiderId] = useState('');
  const [stats, setStats] = useState<RiderStats>({ ...INITIAL_STATS });
  const [remainingPoints, setRemainingPoints] = useState(STAT_POINTS_TO_DISTRIBUTE);
  const [avatar, setAvatar] = useState<AvatarStyle>({
    cascoColor: '#E40317', cascoAccent: '#FFFFFF', monoCuerpo: '#1A1A1A', monoAccent: '#E40317',
  });
  const [saving, setSaving] = useState(false);

  const availableTeams = [...getTeamsByTier('backmarker'), ...getTeamsByTier('midfield')];
  const selectedTeam = TEAMS_2026.find(t => t.id === teamId);
  const teamRiders = teamId ? getRidersByTeam(teamId) : [];

  function adjustStat(key: keyof RiderStats, delta: number) {
    const current = stats[key];
    const newVal = current + delta;
    if (newVal < 60 || newVal > STAT_MAX) return;
    if (delta > 0 && remainingPoints <= 0) return;
    setStats(prev => ({ ...prev, [key]: newVal }));
    setRemainingPoints(prev => prev - delta);
  }

  async function handleCreate() {
    if (!user) return;
    setSaving(true);
    try {
      const charId = nanoid();
      const seasonId = nanoid();

      const character: PlayerCharacter = {
        id: charId,
        userId: user.uid,
        nombre,
        apellido,
        nacionalidad,
        numero,
        stats,
        level: 1,
        xp: 0,
        xpToNextLevel: xpForNextLevel(1),
        statPoints: 0,
        teamId,
        replacedRiderId,
        avatarStyle: avatar,
        upgrades: [],
        createdAt: Date.now(),
      };

      const season: CareerSeason = {
        id: seasonId,
        userId: user.uid,
        characterId: charId,
        season: 2026,
        teamId,
        currentRound: 1,
        completedRaces: [],
        driverStandings: buildInitialStandings(),
        constructorStandings: buildInitialConstructors(),
        phase: 'pre_season',
        startedAt: Date.now(),
        claimedObjectiveIds: [],
      };

      await saveCharacter(character);
      await createSeason(season);
      await updateUserProfile(user.uid, {
        activeCharacterId: charId,
        activeSeasonId: seasonId,
      });

      setCharacter(character);
      setSeason(season);
      toast.success(`¡Bienvenido al paddock, ${apellido}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear el piloto');
    } finally {
      setSaving(false);
    }
  }

  const canProceed = () => {
    if (step === 1) return nombre.trim() && apellido.trim() && numero >= 1 && numero <= 99;
    if (step === 2) return !!teamId;
    if (step === 3) return remainingPoints === 0;
    if (step === 4) return true;
    if (step === 5) return !!replacedRiderId;
    return true;
  };

  return (
    <div className="min-h-screen bg-motogp-dark flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-orbitron font-black text-2xl text-white mb-1">Crea tu Piloto</h1>
          <p className="text-gray-500 text-sm">Paso {step} de 6</p>
          <div className="flex gap-1 justify-center mt-3">
            {[1,2,3,4,5,6].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-motogp-red w-8' : 'bg-white/10 w-4'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-motogp-card border border-white/10 rounded-2xl p-6"
          >
            {/* Paso 1: Identidad */}
            {step === 1 && (
              <div>
                <h2 className="font-orbitron text-lg text-white mb-4">Identidad del Piloto</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Nombre</label>
                    <input className="input-field" placeholder="Carlos" value={nombre} onChange={e => setNombre(e.target.value)} maxLength={20} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Apellido</label>
                    <input className="input-field" placeholder="García" value={apellido} onChange={e => setApellido(e.target.value)} maxLength={20} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Nacionalidad</label>
                      <select className="input-field" value={nacionalidad} onChange={e => setNacionalidad(e.target.value)}>
                        {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Número (1-99)</label>
                      <input type="number" min={1} max={99} className="input-field" value={numero} onChange={e => setNumero(Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Equipo */}
            {step === 2 && (
              <div>
                <h2 className="font-orbitron text-lg text-white mb-1">Elige tu Equipo</h2>
                <p className="text-xs text-gray-500 mb-4">Los rookies comienzan en equipos Midfield o Backmarker</p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {availableTeams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => { setTeamId(team.id); setReplacedRiderId(''); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        teamId === team.id
                          ? 'border-motogp-red bg-motogp-red/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                      <div className="text-left flex-1">
                        <p className="text-sm text-white font-medium">{team.name}</p>
                        <p className="text-xs text-gray-500">{team.manufacturer} · {team.tier === 'midfield' ? 'Midfield 📊' : 'Backmarker 🔧'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Moto</p>
                        <p className="text-sm font-bold" style={{ color: team.color }}>{team.bikePerformance}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 3: Stats */}
            {step === 3 && (
              <div>
                <h2 className="font-orbitron text-lg text-white mb-1">Distribución de Stats</h2>
                <p className="text-xs text-gray-500 mb-4">
                  Puntos restantes: <span className={`font-bold ${remainingPoints === 0 ? 'text-green-400' : 'text-motogp-red'}`}>{remainingPoints}</span> / {STAT_POINTS_TO_DISTRIBUTE}
                </p>
                <div className="space-y-3">
                  {STAT_INFO.map(({ key, label, icon, description }) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">{icon} {label}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => adjustStat(key, -1)} className="w-6 h-6 rounded bg-white/10 text-white text-sm hover:bg-white/20 flex items-center justify-center">−</button>
                          <span className="text-white font-bold w-8 text-center">{stats[key]}</span>
                          <button onClick={() => adjustStat(key, 1)} disabled={remainingPoints === 0 || stats[key] >= STAT_MAX} className="w-6 h-6 rounded bg-motogp-red/80 text-white text-sm hover:bg-motogp-red flex items-center justify-center disabled:opacity-30">+</button>
                        </div>
                      </div>
                      <StatBar label="" value={stats[key]} />
                      <p className="text-xs text-gray-600">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 4: Personalización */}
            {step === 4 && (
              <div>
                <h2 className="font-orbitron text-lg text-white mb-4">Personaliza tu Look</h2>
                {[
                  { label: 'Color del Casco', key: 'cascoColor' as keyof AvatarStyle, options: HELMET_COLORS },
                  { label: 'Acento del Casco', key: 'cascoAccent' as keyof AvatarStyle, options: HELMET_COLORS },
                  { label: 'Color del Mono', key: 'monoCuerpo' as keyof AvatarStyle, options: SUIT_COLORS },
                  { label: 'Acento del Mono', key: 'monoAccent' as keyof AvatarStyle, options: SUIT_COLORS },
                ].map(({ label, key, options }) => (
                  <div key={key} className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">{label}</p>
                    <div className="flex gap-2 flex-wrap">
                      {options.map(c => (
                        <button
                          key={c}
                          onClick={() => setAvatar(prev => ({ ...prev, [key]: c }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${avatar[key] === c ? 'border-white scale-125' : 'border-transparent hover:border-white/50'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Preview */}
                <div className="mt-4 flex justify-center">
                  <div className="relative w-20 h-20">
                    <div className="w-12 h-12 rounded-full mx-auto mb-1 border-4" style={{ backgroundColor: avatar.cascoColor, borderColor: avatar.cascoAccent }} />
                    <div className="w-16 h-8 rounded-lg mx-auto" style={{ backgroundColor: avatar.monoCuerpo, borderBottom: `3px solid ${avatar.monoAccent}` }} />
                    <span className="absolute bottom-0 right-0 text-white text-xs font-bold font-orbitron bg-black/60 px-1 rounded">#{numero}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 5: Reemplazar piloto */}
            {step === 5 && (
              <div>
                <h2 className="font-orbitron text-lg text-white mb-1">¿A quién reemplazas?</h2>
                <p className="text-xs text-gray-500 mb-4">Ocuparás el asiento de uno de estos pilotos en {selectedTeam?.name}</p>
                <div className="space-y-2">
                  {teamRiders.map(rider => (
                    <button
                      key={rider.id}
                      onClick={() => setReplacedRiderId(rider.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        replacedRiderId === rider.id
                          ? 'border-motogp-red bg-motogp-red/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <RiderAvatar
                        photoUrl={rider.photoUrl}
                        name={`${rider.name} ${rider.surname}`}
                        number={rider.number}
                        teamColor={selectedTeam?.color}
                        size="md"
                      />
                      <div className="text-left flex-1">
                        <p className="text-white font-medium">{rider.name} {rider.surname}</p>
                        <p className="text-xs text-gray-500">{rider.nationality} · #{rider.number}</p>
                      </div>
                      <div className="font-orbitron text-sm font-bold" style={{ color: selectedTeam?.color }}>
                        #{rider.number}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 6: Confirmación */}
            {step === 6 && (
              <div className="text-center">
                <div className="text-5xl mb-4">🏍️</div>
                <h2 className="font-orbitron text-xl text-white mb-2">¡Listo para rodar!</h2>
                <div className="text-left bg-white/5 rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Piloto</span><span className="text-white font-bold">#{numero} {nombre} {apellido}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Nación</span><span className="text-white">{nacionalidad}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Equipo</span><span className="font-medium" style={{ color: selectedTeam?.color }}>{selectedTeam?.shortName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Fabricante</span><span className="text-white">{selectedTeam?.manufacturer}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Reemplaza a</span><span className="text-white">{RIDERS_2026.find(r => r.id === replacedRiderId)?.surname}</span></div>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {saving ? '⏳ Creando...' : <><Check size={18} /> ¡Unirse al Paddock!</>}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navegación */}
        {step < 6 && (
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-30 text-sm px-3 py-2"
            >
              <ChevronLeft size={16} /> Atrás
            </button>
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-1 text-sm px-5 py-2 disabled:opacity-40"
            >
              {step === 5 ? 'Confirmar' : 'Siguiente'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
