import pool from "../utils/db";


export type EstadoAsistencia = 'asistio' | 'tarde' | 'ausente' | 'justificado';

export const asistenciaService = {

  async getAsistenciaBySesion(sesion_id: number) {
    const { rows } = await pool.query(
      `SELECT a.*, 
              a.presente,
              a.observacion
       FROM asistencia a
       WHERE a.sesion_id = $1
       ORDER BY a.deportista_nombre`,
      [sesion_id]
    );
    return rows;
  },

  async getJugadoresByEquipo(equipo_id: number) {
    const { rows } = await pool.query(
      `SELECT ej.id_equipo_jugador, ej.deportista_id, ej.deportista_ci, ej.deportista_nombre,
              ej.numero_camiseta, ej.posicion, ej.habilitado
       FROM equipo_jugadores ej
       WHERE ej.equipo_id = $1 AND ej.habilitado = true
       ORDER BY ej.deportista_nombre`,
      [equipo_id]
    );
    return rows;
  },

  async guardarAsistenciaBulk(sesion_id: number, registros: Array<{
    deportista_id: number;
    deportista_ci: string;
    deportista_nombre: string;
    estado: EstadoAsistencia;
    observacion?: string;
    registrado_por_id?: number;
  }>) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`DELETE FROM asistencia WHERE sesion_id = $1`, [sesion_id]);

      const insertados = [];
      for (const r of registros) {
        const presente = r.estado === 'asistio' || r.estado === 'tarde';
        const observacionFinal = r.observacion
          ? `[${r.estado}] ${r.observacion}`
          : `[${r.estado}]`;

        const { rows } = await client.query(
          `INSERT INTO asistencia (sesion_id, deportista_id, deportista_ci, deportista_nombre, presente, observacion, registrado_por_id, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7, NOW()) RETURNING *`,
          [sesion_id, r.deportista_id, r.deportista_ci, r.deportista_nombre,
            presente, observacionFinal, r.registrado_por_id || null]
        );
        insertados.push(rows[0]);
      }

      await client.query('COMMIT');
      return insertados;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getResumenAsistencia(equipo_id: number) {
    const { rows } = await pool.query(
      `SELECT 
         s.id_sesion, s.fecha, s.hora_inicio, s.hora_fin,
         COUNT(a.id_asistencia) AS total_registros,
         COUNT(*) FILTER (WHERE a.presente = true) AS presentes,
         COUNT(*) FILTER (WHERE a.presente = false) AS ausentes
       FROM sesiones s
       LEFT JOIN asistencia a ON a.sesion_id = s.id_sesion
       WHERE s.equipo_id = $1
       GROUP BY s.id_sesion, s.fecha, s.hora_inicio, s.hora_fin
       ORDER BY s.fecha DESC`,
      [equipo_id]
    );
    return rows;
  },
};