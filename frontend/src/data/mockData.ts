// ============================================================
// DATOS MOCK — reemplazar con llamadas reales a la API
// cuando el backend esté listo
// 
// Patrón sugerido para conectar:
//   import { equiposService } from '@/services/equipos.service';
//   const equipos = await equiposService.getAll();
// ============================================================

import type { Equipo, Jugador, Torneo, Usuario, Disciplina, Partido } from '@/types';

export const mockUsuarioAdmin: Usuario = {
  id: 1,
  nombre: 'Admin UCB',
  rol: 'admin',
};

export const mockUsuarioDelegado: Usuario = {
  id: 2,
  nombre: 'Juan Mamani',
  rol: 'delegado',
  carrera: 'Ingeniería de Sistemas',
};

export const mockDisciplinas: Disciplina[] = [
  { id: 1, nombre: 'Fútsal', activo: true },
  { id: 2, nombre: 'Básquetbol', activo: true },
  { id: 3, nombre: 'Voleibol', activo: true },
  { id: 4, nombre: 'Ajedrez', activo: true },
  { id: 5, nombre: 'Atletismo', activo: false },
];

export const mockTorneos: Torneo[] = [
  {
    id: 1,
    nombre: 'Intercarreras Fútsal 2026',
    disciplina_id: 1,
    disciplina_nombre: 'Fútsal',
    tipo: 'intercarreras',
    formato: 'grupos_eliminacion',
    categoria: 'Mayor',
    temporada: '2026',
    fecha_inicio: '2026-05-01',
    fecha_fin: '2026-06-15',
    estado: 'en_curso',
    reglas: 'Cada equipo juega contra todos en la fase de grupos. Los 2 primeros de cada grupo avanzan a eliminación directa.',
  },
  {
    id: 2,
    nombre: 'Intercarreras Básquetbol 2026',
    disciplina_id: 2,
    disciplina_nombre: 'Básquetbol',
    tipo: 'intercarreras',
    formato: 'liga',
    categoria: 'Mayor',
    temporada: '2026',
    fecha_inicio: '2026-05-05',
    fecha_fin: '2026-06-20',
    estado: 'planificado',
  },
  {
    id: 3,
    nombre: 'Copa Voluntad Voleibol',
    disciplina_id: 3,
    disciplina_nombre: 'Voleibol',
    tipo: 'amistoso',
    formato: 'eliminacion_directa',
    categoria: 'Juvenil',
    temporada: '2026',
    fecha_inicio: '2026-05-20',
    fecha_fin: '2026-05-22',
    estado: 'planificado',
  },
];

export const mockPartidos: Partido[] = [
  {
    id: 1,
    torneo_id: 1,
    torneo_nombre: 'Intercarreras Fútsal 2026',
    equipo_local_id: 1,
    equipo_local_nombre: 'Sistemas FC',
    equipo_visitante_id: 2,
    equipo_visitante_nombre: 'Derecho United',
    fecha: '2026-05-10',
    hora: '10:00',
    jornada: 1,
    estado: 'finalizado',
    goles_local: 3,
    goles_visitante: 1,
    eventos: [
      { id: 1, tipo: 'gol', deportista_ci: '1234567', deportista_nombre: 'Carlos Pérez', equipo_id: 1, minuto: 8 },
      { id: 2, tipo: 'gol', deportista_ci: '7654321', deportista_nombre: 'Ana Gómez', equipo_id: 2, minuto: 15 },
      { id: 3, tipo: 'tarjeta_amarilla', deportista_ci: '5566778', deportista_nombre: 'Roberto Condori', equipo_id: 2, minuto: 22 },
      { id: 4, tipo: 'gol', deportista_ci: '1122334', deportista_nombre: 'María Flores', equipo_id: 1, minuto: 30 },
      { id: 5, tipo: 'gol', deportista_ci: '1234567', deportista_nombre: 'Carlos Pérez', equipo_id: 1, minuto: 38 },
    ],
  },
  {
    id: 2,
    torneo_id: 1,
    torneo_nombre: 'Intercarreras Fútsal 2026',
    equipo_local_id: 2,
    equipo_local_nombre: 'Derecho United',
    equipo_visitante_id: 1,
    equipo_visitante_nombre: 'Sistemas FC',
    fecha: '2026-05-17',
    hora: '11:00',
    jornada: 2,
    estado: 'programado',
    goles_local: 0,
    goles_visitante: 0,
    eventos: [],
  },
  {
    id: 3,
    torneo_id: 1,
    torneo_nombre: 'Intercarreras Fútsal 2026',
    equipo_local_id: 1,
    equipo_local_nombre: 'Sistemas FC',
    equipo_visitante_id: 2,
    equipo_visitante_nombre: 'Derecho United',
    fecha: '2026-05-24',
    hora: '09:00',
    jornada: 3,
    estado: 'programado',
    goles_local: 0,
    goles_visitante: 0,
    eventos: [],
  },
];

export const mockJugadores: Jugador[] = [
  { ci: '1234567', nombre_completo: 'Carlos Pérez', tipo: 'UCB', carrera: 'Ing. Sistemas', matricula_activa: true },
  { ci: '7654321', nombre_completo: 'Ana Gómez', tipo: 'UCB', carrera: 'Derecho', matricula_activa: true },
  { ci: '9988776', nombre_completo: 'Luis Torres', tipo: 'UCB', carrera: 'Ing. Sistemas', matricula_activa: false },
  { ci: '1122334', nombre_completo: 'María Flores', tipo: 'UCB', carrera: 'Ing. Sistemas', matricula_activa: true },
  { ci: '5566778', nombre_completo: 'Roberto Condori', tipo: 'UCB', carrera: 'Ing. Sistemas', matricula_activa: true },
];

export const mockEquipos: Equipo[] = [
  {
    id: 1,
    nombre: 'Sistemas FC',
    carrera: 'Ingeniería de Sistemas',
    delegado_id: 2,
    delegado_nombre: 'Juan Mamani',
    torneo_id: 1,
    jugadores: [mockJugadores[0], mockJugadores[1], mockJugadores[3]],
  },
  {
    id: 2,
    nombre: 'Derecho United',
    carrera: 'Derecho',
    delegado_id: 3,
    delegado_nombre: 'Pedro Quispe',
    torneo_id: 1,
    jugadores: [mockJugadores[4]],
  },
];

export const mockCarreras = [
  'Ingeniería de Sistemas',
  'Derecho',
  'Administración de Empresas',
  'Medicina',
  'Arquitectura',
  'Ingeniería Civil',
  'Economía',
  'Psicología',
  'Comunicación Social',
  'Ingeniería Industrial',
];