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
  disciplina_id: number;
  disciplina_nombre: string;
  tipo: 'intercarreras' | 'externo' | 'amistoso';
  formato: 'liga' | 'eliminacion_directa' | 'grupos_eliminacion';
  categoria: string;
  temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'planificado' | 'en_curso' | 'finalizado' | 'cancelado';
  reglas?: string;
}

export interface Disciplina {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface EventoPartido {
  id: number;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja';
  deportista_ci: string;
  deportista_nombre: string;
  equipo_id: number;
  minuto?: number;
}

export interface Partido {
  id: number;
  torneo_id: number;
  torneo_nombre: string;
  equipo_local_id: number;
  equipo_local_nombre: string;
  equipo_visitante_id: number;
  equipo_visitante_nombre: string;
  fecha: string;
  hora: string;
  jornada: number;
  estado: 'programado' | 'en_curso' | 'finalizado' | 'suspendido';
  goles_local: number;
  goles_visitante: number;
  eventos: EventoPartido[];
}