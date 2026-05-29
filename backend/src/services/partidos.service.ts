import pool from '../utils/db';


export interface RegistrarResultadoDto {
  goles_local: number;
  goles_visitante: number;
  anotador_id?: number;
}

export interface EventoDto {
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  equipo_id: number;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'autogol';
  minuto?: number;
}

async function recalcularTablaPosiciones(torneoId: number, client: any) {
  // Obtiene todos los partidos finalizados del torneo
  const { rows: partidos } = await client.query(
    `SELECT equipo_local_id, equipo_visitante_id, goles_local, goles_visitante
     FROM partidos
     WHERE torneo_id = $1 AND estado = 'finalizado'`,
    [torneoId]
  );

  const stats: Record<number, {
    pj: number; pg: number; pe: number; pp: number;
    gf: number; gc: number; dg: number; pts: number;
  }> = {};

  const init = () => ({ pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, dg:0, pts:0 });

  for (const p of partidos) {
    const l = p.equipo_local_id;
    const v = p.equipo_visitante_id;
    if (!stats[l]) stats[l] = init();
    if (!stats[v]) stats[v] = init();

    stats[l].pj++; stats[v].pj++;
    stats[l].gf += p.goles_local;   stats[l].gc += p.goles_visitante;
    stats[v].gf += p.goles_visitante; stats[v].gc += p.goles_local;

    if (p.goles_local > p.goles_visitante) {
      stats[l].pg++; stats[l].pts += 3; stats[v].pp++;
    } else if (p.goles_local < p.goles_visitante) {
      stats[v].pg++; stats[v].pts += 3; stats[l].pp++;
    } else {
      stats[l].pe++; stats[l].pts++; stats[v].pe++; stats[v].pts++;
    }

    stats[l].dg = stats[l].gf - stats[l].gc;
    stats[v].dg = stats[v].gf - stats[v].gc;
  }

  for (const [equipoId, s] of Object.entries(stats)) {
    await client.query(
      `INSERT INTO tabla_posiciones 
        (torneo_id, equipo_id, partidos_jugados, partidos_ganados, partidos_empatados,
         partidos_perdidos, goles_favor, goles_contra, diferencia_goles, puntos, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())
       ON CONFLICT (torneo_id, equipo_id) DO UPDATE SET
         partidos_jugados   = EXCLUDED.partidos_jugados,
         partidos_ganados   = EXCLUDED.partidos_ganados,
         partidos_empatados = EXCLUDED.partidos_empatados,
         partidos_perdidos  = EXCLUDED.partidos_perdidos,
         goles_favor        = EXCLUDED.goles_favor,
         goles_contra       = EXCLUDED.goles_contra,
         diferencia_goles   = EXCLUDED.diferencia_goles,
         puntos             = EXCLUDED.puntos,
         updated_at         = NOW()`,
      [torneoId, Number(equipoId), s.pj, s.pg, s.pe, s.pp, s.gf, s.gc, s.dg, s.pts]
    );
  }
}


export const partidosService = {

  async getByTorneo(torneoId: number) {
    const { rows } = await pool.query(
      `SELECT 
        p.*,
        el.nombre AS equipo_local_nombre,
        ev.nombre AS equipo_visitante_nombre,
        cal.nombre AS carrera_local,
        cav.nombre AS carrera_visitante,
        esp.nombre AS espacio_nombre
       FROM partidos p
       JOIN equipos el  ON el.id_equipo  = p.equipo_local_id
       JOIN equipos ev  ON ev.id_equipo  = p.equipo_visitante_id
       LEFT JOIN carreras cal ON cal.id_carrera = el.carrera_id
       LEFT JOIN carreras cav ON cav.id_carrera = ev.carrera_id
       LEFT JOIN espacios esp ON esp.id_espacio = p.espacio_id
       WHERE p.torneo_id = $1
       ORDER BY p.jornada ASC, p.fecha ASC, p.hora ASC`,
      [torneoId]
    );
    return rows;
  },

  async getById(id: number) {
    const { rows } = await pool.query(
      `SELECT 
        p.*,
        el.nombre AS equipo_local_nombre,
        ev.nombre AS equipo_visitante_nombre,
        esp.nombre AS espacio_nombre,
        t.nombre AS torneo_nombre
       FROM partidos p
       JOIN equipos el  ON el.id_equipo = p.equipo_local_id
       JOIN equipos ev  ON ev.id_equipo = p.equipo_visitante_id
       LEFT JOIN espacios esp ON esp.id_espacio = p.espacio_id
       LEFT JOIN torneos t ON t.id_torneo = p.torneo_id
       WHERE p.id_partido = $1`,
      [id]
    );
    if (!rows[0]) return null;

    const { rows: estadisticas } = await pool.query(
      `SELECT * FROM estadisticas_partido WHERE partido_id = $1 ORDER BY minuto ASC`,
      [id]
    );

    return { ...rows[0], estadisticas };
  },

  // Partidos pendientes para el anotador (estado = programado)
  async getPendientesParaAnotador(anotadorId?: number) {
    let query = `
      SELECT 
        p.*,
        el.nombre AS equipo_local_nombre,
        ev.nombre AS equipo_visitante_nombre,
        cal.nombre AS carrera_local,
        cav.nombre AS carrera_visitante,
        esp.nombre AS espacio_nombre,
        t.nombre AS torneo_nombre,
        d.nombre AS disciplina_nombre
       FROM partidos p
       JOIN equipos el   ON el.id_equipo = p.equipo_local_id
       JOIN equipos ev   ON ev.id_equipo = p.equipo_visitante_id
       LEFT JOIN carreras cal ON cal.id_carrera = el.carrera_id
       LEFT JOIN carreras cav ON cav.id_carrera = ev.carrera_id
       LEFT JOIN espacios esp ON esp.id_espacio = p.espacio_id
       JOIN torneos t    ON t.id_torneo = p.torneo_id
       JOIN disciplinas d ON d.id_disciplina = t.disciplina_id
       WHERE p.estado IN ('programado', 'en_curso')
    `;
    const params: any[] = [];

    if (anotadorId) {
      params.push(anotadorId);
      query += ` AND p.anotador_id = $${params.length}`;
    }

    query += ` ORDER BY p.fecha ASC, p.hora ASC`;
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async registrarResultado(
    partidoId: number,
    dto: RegistrarResultadoDto,
    eventos: EventoDto[]
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `UPDATE partidos
         SET goles_local = $1, goles_visitante = $2,
             estado = 'finalizado', anotador_id = $3, updated_at = NOW()
         WHERE id_partido = $4
         RETURNING *`,
        [dto.goles_local, dto.goles_visitante, dto.anotador_id ?? null, partidoId]
      );

      if (!rows[0]) throw new Error('Partido no encontrado');
      const partido = rows[0];

      await client.query(
        `DELETE FROM estadisticas_partido WHERE partido_id = $1`, [partidoId]
      );

      for (const ev of eventos) {
        await client.query(
          `INSERT INTO estadisticas_partido
            (partido_id, equipo_id, deportista_id, deportista_ci,
             deportista_nombre, tipo, minuto)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            partidoId, ev.equipo_id, ev.deportista_id,
            ev.deportista_ci, ev.deportista_nombre, ev.tipo, ev.minuto ?? null
          ]
        );
      }

      await recalcularTablaPosiciones(partido.torneo_id, client);

      await client.query('COMMIT');
      return partido;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getJugadoresDePartido(partidoId: number) {
    const { rows: partido } = await pool.query(
      `SELECT equipo_local_id, equipo_visitante_id FROM partidos WHERE id_partido = $1`,
      [partidoId]
    );
    if (!partido[0]) return null;

    const { equipo_local_id, equipo_visitante_id } = partido[0];

    const { rows } = await pool.query(
      `SELECT 
        ej.deportista_id, ej.deportista_ci, ej.deportista_nombre,
        ej.numero_camiseta, ej.posicion, ej.equipo_id,
        e.nombre AS equipo_nombre
       FROM equipo_jugadores ej
       JOIN equipos e ON e.id_equipo = ej.equipo_id
       WHERE ej.equipo_id IN ($1, $2) AND ej.habilitado = true
       ORDER BY ej.equipo_id, ej.numero_camiseta`,
      [equipo_local_id, equipo_visitante_id]
    );
    return rows;
  },
};