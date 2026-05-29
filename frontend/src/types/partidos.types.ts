export type PartidoEstado = 'programado' | 'en_curso' | 'finalizado' | 'suspendido' | 'cancelado';
export type EventoTipo = 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'autogol';

export interface Partido {
  id_partido: number;
  torneo_id: number;
  torneo_nombre?: string;
  disciplina_nombre?: string;
  equipo_local_id: number;
  equipo_local_nombre: string;
  carrera_local?: string;
  equipo_visitante_id: number;
  equipo_visitante_nombre: string;
  carrera_visitante?: string;
  espacio_id?: number;
  espacio_nombre?: string;
  fecha: string;
  hora: string;
  jornada: number;
  fase: string;
  grupo?: string;
  goles_local: number;
  goles_visitante: number;
  estado: PartidoEstado;
  anotador_id?: number;
  estadisticas?: Estadistica[];
}

export interface Estadistica {
  id_estadistica: number;
  partido_id: number;
  equipo_id: number;
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  tipo: EventoTipo;
  minuto?: number;
}

export interface JugadorPartido {
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  numero_camiseta?: number;
  posicion?: string;
  equipo_id: number;
  equipo_nombre: string;
}

export interface RegistrarResultadoDto {
  goles_local: number;
  goles_visitante: number;
  anotador_id?: number;
  eventos: {
    deportista_id: number;
    deportista_ci: string;
    deportista_nombre: string;
    equipo_id: number;
    tipo: EventoTipo;
    minuto?: number;
  }[];
}