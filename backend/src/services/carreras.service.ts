import pool from '../utils/db';

export interface Carrera {
  id_carrera: number;
  nombre: string;
  facultad: string;
  activo: boolean;
}

export async function getAllCarreras(): Promise<Carrera[]> {
  const result = await pool.query<Carrera>(`
    SELECT id_carrera, nombre, facultad, activo
    FROM carreras
    WHERE activo = true
    ORDER BY nombre ASC
  `);
  return result.rows;
}
