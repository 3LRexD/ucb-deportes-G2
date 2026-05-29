export type EstadoAsistencia = 'asistio' | 'tarde' | 'ausente' | 'justificado';
 
export interface Sesion {
  id_sesion: number;
  equipo_id: number;
  equipo_nombre: string;
  disciplina_id: number;
  disciplina_nombre: string;
  espacio_id?: number;
  espacio_nombre?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  observaciones?: string;
}
 
export interface JugadorEquipo {
  id_equipo_jugador: number;
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  numero_camiseta?: number;
  posicion?: string;
  habilitado: boolean;
}
 
export interface RegistroAsistencia {
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  estado: EstadoAsistencia;
  observacion?: string;
}
 
export interface EquipoConDisciplina {
  id_equipo: number;
  equipo_nombre: string;
  id_torneo: number;
  torneo_nombre: string;
  id_disciplina: number;
  disciplina_nombre: string;
}
 