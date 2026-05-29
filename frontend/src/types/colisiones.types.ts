export interface Colision {
  tipo: 'jugador' | 'espacio';
  descripcion: string;
  partido_conflicto_id: number;
  partido_conflicto_fecha: string;
  partido_conflicto_hora: string;
  entidad_nombre: string;
}