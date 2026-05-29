// ─── Carrera (viene de la BD, no se modifica) ───────────────────────────────
export interface Carrera {
  id_carrera: number;
  nombre: string;
  facultad: string;
  activo: boolean;
}

// ─── Torneo ──────────────────────────────────────────────────────────────────
export interface Torneo {
  id_torneo: number;
  nombre: string;
  disciplina_nombre: string;
  tipo: "intercarreras" | "externo" | "amistoso";
  formato: string;
  categoria: string;
  temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "planificado" | "en_curso" | "finalizado" | "cancelado";
}

// ─── Delegado (usuario con rol delegado) ─────────────────────────────────────
export interface Delegado {
  id_usuario: number;
  nombre_completo: string;
  ci: string;
  email: string;
}

// ─── Jugador dentro de un equipo ─────────────────────────────────────────────
export interface JugadorEquipo {
  id_equipo_jugador: number;
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  numero_camiseta: number | null;
  posicion: string | null;
  fecha_inscripcion: string;
  habilitado: boolean;
  matricula_validada: boolean;
}

// ─── Equipo ───────────────────────────────────────────────────────────────────
export interface Equipo {
  id_equipo: number;
  nombre: string;
  torneo_id: number;
  carrera_id: number | null;
  carrera_nombre: string | null;
  delegado: Delegado | null;
  jugadores: JugadorEquipo[];
  created_at: string;
}

// ─── Payloads para crear/actualizar ──────────────────────────────────────────
export interface CrearEquipoPayload {
  nombre: string;
  torneo_id: number;
  carrera_id: number | null;
}

export interface AsignarDelegadoPayload {
  ci: string; // busca al usuario por CI
}

export interface AgregarJugadorPayload {
  ci: string; // busca al deportista por CI
  numero_camiseta?: number;
  posicion?: string;
}
