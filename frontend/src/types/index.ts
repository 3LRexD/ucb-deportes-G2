// ============================================================
// TIPOS — Sprint 1 + 2 + 3
// ============================================================

export type Rol = 'admin' | 'delegado' | 'entrenador' | 'estudiante';

export interface Usuario {
  id: number;
  nombre: string;
  rol: Rol;
  carrera?: string;
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
  categoria_id?: number;      
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
  espacio_id?: number;
  espacio_nombre?: string;
  jornada: number;
  fase?: 'grupos' | 'cuartos' | 'semis' | 'final';
  grupo?: string;
  estado: 'programado' | 'en_curso' | 'finalizado' | 'suspendido';
  goles_local: number;
  goles_visitante: number;
  eventos: EventoPartido[];
}


export interface Categoria {
  id: number;
  nombre: string;           // sub-13, sub-15, juvenil, mayor
  edad_min: number;
  edad_max: number;
  descripcion?: string;
  activo: boolean;
}

export interface Espacio {
  id: number;
  nombre: string;           // Coliseo, Cancha Arquitectura
  ubicacion: string;
  horario_apertura: string; // "08:00"
  horario_cierre: string;   // "22:00"
  activo: boolean;
}

export interface Sesion {
  id: number;
  equipo_id: number;
  equipo_nombre: string;
  disciplina_id: number;
  disciplina_nombre: string;
  entrenador_id: number;
  entrenador_nombre: string;
  espacio_id: number;
  espacio_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  observaciones?: string;
}

export interface RegistroAsistencia {
  sesion_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  presente: boolean;
  observacion?: string;
}

export interface ColisionHorario {
  tipo: 'espacio' | 'jugador';
  descripcion: string;
  partido_existente_id?: number;
  sesion_existente_id?: number;
}

// Fixture generado
export interface JornadaFixture {
  jornada: number;
  fecha_sugerida: string;
  partidos: PartidoFixture[];
}

export interface Equipo {
  id: number;
  nombre: string;
  carrera: string;
  carrera_id?: number;   // ← agregar
  delegado_id: number;
  delegado_nombre: string;
  jugadores: Jugador[];
  torneo_id: number;
}


export interface PartidoFixture {
  id: string;
  equipo_local_id: number;
  equipo_local_nombre: string;
  equipo_visitante_id: number;
  equipo_visitante_nombre: string;
  fecha: string;
  hora: string;
  espacio_id: number;
  espacio_nombre: string;
  jornada: number;
  fase?: string;
  grupo?: string;
  colisiones: ColisionHorario[];
}