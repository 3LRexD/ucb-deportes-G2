import type { Equipo, Jugador, Torneo, Usuario } from '@/types';

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

export const mockTorneos: Torneo[] = [
  { id: 1, nombre: 'Intercarreras 2026', disciplina: 'Fútsal', estado: 'planificado' },
  { id: 2, nombre: 'Intercarreras 2026', disciplina: 'Básquetbol', estado: 'planificado' },
  { id: 3, nombre: 'Intercarreras 2026', disciplina: 'Voleibol', estado: 'planificado' },
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