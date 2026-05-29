import pool from "../utils/db";

export interface Colision {
  tipo: 'jugador' | 'espacio';
  descripcion: string;
  partido_conflicto_id: number;
  partido_conflicto_fecha: string;
  partido_conflicto_hora: string;
  entidad_nombre: string;
}

export const colisionesService = {

  async validarColisiones(params: {
    torneo_id: number;
    equipo_local_id: number;
    equipo_visitante_id: number;
    espacio_id?: number | null;
    fecha: string;
    hora: string;
    excluir_partido_id?: number; 
  }): Promise<Colision[]> {
    const colisiones: Colision[] = [];
    const { equipo_local_id, equipo_visitante_id, espacio_id, fecha, hora, excluir_partido_id } = params;

    if (espacio_id) {
      let q = `
        SELECT p.id_partido, p.fecha, p.hora,
               el.nombre AS local, ev.nombre AS visitante,
               e.nombre AS espacio_nombre
        FROM partidos p
        JOIN equipos el ON el.id_equipo = p.equipo_local_id
        JOIN equipos ev ON ev.id_equipo = p.equipo_visitante_id
        JOIN espacios e ON e.id_espacio = p.espacio_id
        WHERE p.espacio_id = $1
          AND p.fecha = $2
          AND p.hora = $3
          AND p.estado != 'cancelado'
      `;
      const qParams: any[] = [espacio_id, fecha, hora];
      if (excluir_partido_id) { qParams.push(excluir_partido_id); q += ` AND p.id_partido != $${qParams.length}`; }

      const { rows } = await pool.query(q, qParams);
      for (const row of rows) {
        colisiones.push({
          tipo: 'espacio',
          descripcion: `La cancha "${row.espacio_nombre}" ya tiene un partido a las ${hora} del ${fecha}`,
          partido_conflicto_id: row.id_partido,
          partido_conflicto_fecha: row.fecha,
          partido_conflicto_hora: row.hora,
          entidad_nombre: row.espacio_nombre,
        });
      }
    }

    const equiposIds = [equipo_local_id, equipo_visitante_id];
    for (const equipoId of equiposIds) {
      let q = `
        SELECT p.id_partido, p.fecha, p.hora,
               el.nombre AS local, ev.nombre AS visitante,
               eq.nombre AS equipo_nombre
        FROM partidos p
        JOIN equipos el ON el.id_equipo = p.equipo_local_id
        JOIN equipos ev ON ev.id_equipo = p.equipo_visitante_id
        JOIN equipos eq ON eq.id_equipo = $1
        WHERE (p.equipo_local_id = $1 OR p.equipo_visitante_id = $1)
          AND p.fecha = $2
          AND p.hora = $3
          AND p.estado != 'cancelado'
      `;
      const qParams: any[] = [equipoId, fecha, hora];
      if (excluir_partido_id) { qParams.push(excluir_partido_id); q += ` AND p.id_partido != $${qParams.length}`; }

      const { rows } = await pool.query(q, qParams);
      if (rows.length > 0) {
        const row = rows[0];
        colisiones.push({
          tipo: 'jugador',
          descripcion: `El equipo "${row.equipo_nombre}" ya tiene un partido (${row.local} vs ${row.visitante}) a las ${hora} del ${fecha}`,
          partido_conflicto_id: row.id_partido,
          partido_conflicto_fecha: row.fecha,
          partido_conflicto_hora: row.hora,
          entidad_nombre: row.equipo_nombre,
        });
      }
    }

    return colisiones;
  },
};  