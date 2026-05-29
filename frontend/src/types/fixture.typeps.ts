export interface Fixture {
  id_fixture: number;
  torneo_id: number;
  generado_en: string;
  formato: 'liga' | 'eliminacion_directa' | 'grupos_eliminacion';
  total_partidos: number;
  observaciones?: string;
}
 
export interface Partido {
  id_partido: number;
  torneo_id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  equipo_local_nombre: string;
  equipo_visitante_nombre: string;
  espacio_id?: number;
  espacio_nombre?: string;
  fecha: string;
  hora: string;
  jornada: number;
  fase: 'grupos' | 'cuartos' | 'semifinal' | 'final';
  grupo?: string;
  goles_local: number;
  goles_visitante: number;
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
}
 
export interface EquipoSimple {
  id_equipo: number;
  nombre: string;
}
 
export interface GenerarFixturePayload {
  torneo_id: number;
  formato: 'liga' | 'eliminacion_directa' | 'grupos_eliminacion';
  fecha_inicio: string;
  hora_inicio: string;
  intervalo_minutos: number;
  espacio_id?: number | null;
  num_grupos?: number;
  observaciones?: string;
}
 
export interface FasesBloqueadas {
  semifinal: boolean;
  final: boolean;
}
 