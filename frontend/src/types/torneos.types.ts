export type TorneoEstado = 'planificado' | 'en_curso' | 'finalizado' | 'cancelado';
export type TorneoTipo   = 'intercarreras' | 'externo' | 'amistoso' | 'copa';
export type TorneoFormato = 'liga' | 'eliminacion_directa' | 'grupos_eliminacion';

export interface Torneo {
  id_torneo: number;
  nombre: string;
  disciplina_id: number;
  disciplina_nombre?: string;
  categoria_id: number;
  categoria_nombre?: string;
  tipo: TorneoTipo;
  formato: TorneoFormato;
  temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: TorneoEstado;
  reglas?: string;
  creado_por_id?: number;
  total_equipos?: number;
  created_at: string;
  updated_at: string;
  equipos?: Equipo[];
}

export interface CreateTorneoDto {
  nombre: string;
  disciplina_id: number;
  categoria_id: number;
  tipo: TorneoTipo;
  formato: TorneoFormato;
  temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  reglas?: string;
}

export interface Disciplina {
  id_disciplina: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  edad_min: number;
  edad_max: number;
  descripcion?: string;
  activo: boolean;
  created_at?: string;   
  updated_at?: string;   
}

export interface Equipo {
  id_equipo: number;
  nombre: string;
  torneo_id: number;
  carrera_id?: number;
  carrera_nombre?: string;
  delegado_id?: number;
}

export interface TablaPosicion {
  id_tabla_posicion: number;
  torneo_id: number;
  equipo_id: number;
  equipo_nombre: string;
  carrera_nombre?: string;
  partidos_jugados: number;
  partidos_ganados: number;
  partidos_empatados: number;
  partidos_perdidos: number;
  goles_favor: number;
  goles_contra: number;
  diferencia_goles: number;
  puntos: number;
}
