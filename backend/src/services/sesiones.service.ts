import pool from "../utils/db";


export const sesionesService = {

  async getSesiones(filtros: { equipo_id?: number; disciplina_id?: number; fecha?: string }) {
    let q = `
      SELECT s.*,
        eq.nombre AS equipo_nombre,
        d.nombre  AS disciplina_nombre,
        e.nombre  AS espacio_nombre
      FROM sesiones s
      JOIN equipos eq ON eq.id_equipo = s.equipo_id
      JOIN disciplinas d ON d.id_disciplina = s.disciplina_id
      LEFT JOIN espacios e ON e.id_espacio = s.espacio_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;
    if (filtros.equipo_id) { params.push(filtros.equipo_id); q += ` AND s.equipo_id = $${idx++}`; }
    if (filtros.disciplina_id) { params.push(filtros.disciplina_id); q += ` AND s.disciplina_id = $${idx++}`; }
    if (filtros.fecha) { params.push(filtros.fecha); q += ` AND s.fecha = $${idx++}`; }
    q += ` ORDER BY s.fecha DESC, s.hora_inicio`;
    const { rows } = await pool.query(q, params);
    return rows;
  },

  async getSesionById(id: number) {
    const { rows } = await pool.query(
      `SELECT s.*, eq.nombre AS equipo_nombre, d.nombre AS disciplina_nombre
       FROM sesiones s
       JOIN equipos eq ON eq.id_equipo = s.equipo_id
       JOIN disciplinas d ON d.id_disciplina = s.disciplina_id
       WHERE s.id_sesion = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async crearSesion(datos: {
    equipo_id: number;
    disciplina_id: number;
    espacio_id?: number | null;
    entrenador_id?: number | null;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    observaciones?: string;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO sesiones (equipo_id, disciplina_id, espacio_id, entrenador_id, fecha, hora_inicio, hora_fin, observaciones, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW()) RETURNING *`,
      [datos.equipo_id, datos.disciplina_id, datos.espacio_id || null, datos.entrenador_id || null,
        datos.fecha, datos.hora_inicio, datos.hora_fin, datos.observaciones || null]
    );
    return rows[0];
  },

  async eliminarSesion(id: number) {
    const { rows } = await pool.query(`DELETE FROM sesiones WHERE id_sesion = $1 RETURNING *`, [id]);
    return rows[0];
  },

  async getEquiposConDisciplinas() {
    const { rows } = await pool.query(
      `SELECT DISTINCT e.id_equipo, e.nombre AS equipo_nombre,
              t.id_torneo, t.nombre AS torneo_nombre,
              d.id_disciplina, d.nombre AS disciplina_nombre
       FROM equipos e
       JOIN torneos t ON t.id_torneo = e.torneo_id
       JOIN disciplinas d ON d.id_disciplina = t.disciplina_id
       WHERE e.id_equipo IS NOT NULL
       ORDER BY e.nombre`
    );
    return rows;
  },
};