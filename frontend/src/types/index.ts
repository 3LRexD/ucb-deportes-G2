export type Rol = 'admin' | 'delegado' | 'entrenador' | 'estudiante';

export interface Usuario {
  id: number;
  nombre: string;
  rol: Rol;
  carrera?: string; // solo para delegados
}

export interface Jugador {
  ci: string;
  nombre_completo: string;
  tipo: 'UCB' | 'Externo';
  carrera?: string;
  matricula_activa?: boolean;
}

export interface Equipo {
  id: number;
  nombre: string;
  carrera: string;
  delegado_id: number;
  delegado_nombre: string;
  jugadores: Jugador[];
  torneo_id: number;
}

export interface Torneo {
  id: number;
  nombre: string;
  disciplina: string;
  estado: 'planificado' | 'en_curso' | 'finalizado';
}