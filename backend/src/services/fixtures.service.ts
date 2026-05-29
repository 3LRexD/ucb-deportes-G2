import pool from "../utils/db";

interface Equipo { id_equipo: number; nombre: string; grupo?: string }
interface PartidoInput {
  torneo_id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  espacio_id?: number | null;
  fecha: string;
  hora: string;
  jornada: number;
  fase: string;
  grupo?: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarRoundRobin(equipos: Equipo[]): [Equipo, Equipo][] {
  const equiposList = equipos.length % 2 === 0 ? [...equipos] : [...equipos, { id_equipo: -1, nombre: 'BYE' }];
  const n = equiposList.length;
  const partidos: [Equipo, Equipo][] = [];
  const fijos = equiposList[0];
  const rotativos = equiposList.slice(1);

  for (let ronda = 0; ronda < n - 1; ronda++) {
    const rondaEquipos = [fijos, ...rotativos];
    for (let i = 0; i < n / 2; i++) {
      const local = rondaEquipos[i];
      const visitante = rondaEquipos[n - 1 - i];
      if (local.id_equipo !== -1 && visitante.id_equipo !== -1) {
        partidos.push([local, visitante]);
      }
    }
    rotativos.unshift(rotativos.pop()!);
  }
  return partidos;
}

function dividirEnGrupos(equipos: Equipo[], numGrupos: number): Equipo[][] {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const grupos: Equipo[][] = Array.from({ length: numGrupos }, () => []);
  equipos.forEach((eq, i) => {
    eq.grupo = letras[i % numGrupos];
    grupos[i % numGrupos].push(eq);
  });
  return grupos;
}
export const fixturesService = {

  async getEquiposByTorneo(torneo_id: number) {
    const { rows } = await pool.query(
      `SELECT id_equipo, nombre FROM equipos WHERE torneo_id = $1 ORDER BY nombre`,
      [torneo_id]
    );
    return rows;
  },

  async getFixturesByTorneo(torneo_id: number) {
    const { rows } = await pool.query(
      `SELECT f.*, 
        (SELECT COUNT(*) FROM partidos p WHERE p.torneo_id = f.torneo_id) as total_partidos_real
       FROM fixtures f WHERE f.torneo_id = $1 ORDER BY f.generado_en DESC`,
      [torneo_id]
    );
    return rows;
  },

  async getPartidosByTorneo(torneo_id: number, filtros: { grupo?: string; jornada?: number; fase?: string }) {
    let q = `
      SELECT p.*,
        el.nombre AS equipo_local_nombre,
        ev.nombre AS equipo_visitante_nombre,
        e.nombre  AS espacio_nombre
      FROM partidos p
      JOIN equipos el ON el.id_equipo = p.equipo_local_id
      JOIN equipos ev ON ev.id_equipo = p.equipo_visitante_id
      LEFT JOIN espacios e ON e.id_espacio = p.espacio_id
      WHERE p.torneo_id = $1
    `;
    const params: any[] = [torneo_id];
    if (filtros.grupo) { params.push(filtros.grupo); q += ` AND p.grupo = $${params.length}`; }
    if (filtros.jornada) { params.push(filtros.jornada); q += ` AND p.jornada = $${params.length}`; }
    if (filtros.fase) { params.push(filtros.fase); q += ` AND p.fase = $${params.length}`; }
    q += ` ORDER BY p.fecha, p.hora, p.grupo, p.jornada`;
    const { rows } = await pool.query(q, params);
    return rows;
  },

  async generarFixture(payload: {
    torneo_id: number;
    formato: string;      
    fecha_inicio: string;
    hora_inicio: string;
    intervalo_minutos: number;
    espacio_id?: number | null;
    num_grupos?: number;
    observaciones?: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: equiposRaw } = await client.query(
        `SELECT id_equipo, nombre FROM equipos WHERE torneo_id = $1`,
        [payload.torneo_id]
      );
      if (equiposRaw.length < 2) throw new Error('El torneo necesita al menos 2 equipos');

      const equipos: Equipo[] = shuffle(equiposRaw);
      await client.query(
        `DELETE FROM partidos WHERE torneo_id = $1 AND fase = 'grupos'`,
        [payload.torneo_id]
      );

      const partidosAInsertar: PartidoInput[] = [];
      let fechaActual = new Date(payload.fecha_inicio + 'T00:00:00');
      let horaActual = payload.hora_inicio;

      const avanzarHora = (hora: string, minutos: number): string => {
        const [h, m] = hora.split(':').map(Number);
        const total = h * 60 + m + minutos;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      };

      if (payload.formato === 'liga') {
        const partidos = generarRoundRobin(equipos);
        partidos.forEach(([ local, visitante ], idx) => {
          partidosAInsertar.push({
            torneo_id: payload.torneo_id,
            equipo_local_id: local.id_equipo,
            equipo_visitante_id: visitante.id_equipo,
            espacio_id: payload.espacio_id || null,
            fecha: fechaActual.toISOString().split('T')[0],
            hora: horaActual,
            jornada: idx + 1,
            fase: 'grupos',
            grupo: null,
          });
          horaActual = avanzarHora(horaActual, payload.intervalo_minutos);
          if (horaActual >= '22:00') {
            fechaActual.setDate(fechaActual.getDate() + 1);
            horaActual = payload.hora_inicio;
          }
        });

      } else if (payload.formato === 'grupos_eliminacion') {
        const numGrupos = payload.num_grupos || 2;
        const grupos = dividirEnGrupos(equipos, numGrupos);
        let jornada = 1;
        grupos.forEach((grupoEquipos) => {
          const partidos = generarRoundRobin(grupoEquipos);
          partidos.forEach(([ local, visitante ]) => {
            partidosAInsertar.push({
              torneo_id: payload.torneo_id,
              equipo_local_id: local.id_equipo,
              equipo_visitante_id: visitante.id_equipo,
              espacio_id: payload.espacio_id || null,
              fecha: fechaActual.toISOString().split('T')[0],
              hora: horaActual,
              jornada,
              fase: 'grupos',
              grupo: local.grupo || null,
            });
            horaActual = avanzarHora(horaActual, payload.intervalo_minutos);
            if (horaActual >= '22:00') {
              fechaActual.setDate(fechaActual.getDate() + 1);
              horaActual = payload.hora_inicio;
            }
            jornada++;
          });
        });

      } else if (payload.formato === 'eliminacion_directa') {
        let rondaEquipos = equipos;
        let fase = 'cuartos';
        if (rondaEquipos.length <= 2) fase = 'final';
        else if (rondaEquipos.length <= 4) fase = 'semifinal';

        let jornada = 1;
        for (let i = 0; i < rondaEquipos.length - 1; i += 2) {
          partidosAInsertar.push({
            torneo_id: payload.torneo_id,
            equipo_local_id: rondaEquipos[i].id_equipo,
            equipo_visitante_id: rondaEquipos[i + 1].id_equipo,
            espacio_id: payload.espacio_id || null,
            fecha: fechaActual.toISOString().split('T')[0],
            hora: horaActual,
            jornada,
            fase,
            grupo: null,
          });
          horaActual = avanzarHora(horaActual, payload.intervalo_minutos);
          jornada++;
        }
      }

      for (const p of partidosAInsertar) {
        await client.query(
          `INSERT INTO partidos (torneo_id, equipo_local_id, equipo_visitante_id, espacio_id, fecha, hora, jornada, fase, grupo, estado, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'programado', NOW())`,
          [p.torneo_id, p.equipo_local_id, p.equipo_visitante_id, p.espacio_id, p.fecha, p.hora, p.jornada, p.fase, p.grupo]
        );
      }

      const { rows: [fixture] } = await client.query(
        `INSERT INTO fixtures (torneo_id, formato, total_partidos, observaciones, generado_en)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [payload.torneo_id, payload.formato, partidosAInsertar.length, payload.observaciones || null]
      );

      await client.query('COMMIT');
      return { fixture, total_partidos: partidosAInsertar.length };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async actualizarPartido(id: number, datos: Partial<PartidoInput & { goles_local: number; goles_visitante: number; estado: string }>) {
    const campos: string[] = [];
    const valores: any[] = [];
    let idx = 1;

    const permitidos = ['fecha', 'hora', 'espacio_id', 'jornada', 'grupo', 'fase', 'goles_local', 'goles_visitante', 'estado',
      'equipo_local_id', 'equipo_visitante_id'];
    for (const [k, v] of Object.entries(datos)) {
      if (permitidos.includes(k)) {
        campos.push(`${k} = $${idx++}`);
        valores.push(v);
      }
    }
    if (!campos.length) throw new Error('Sin campos para actualizar');
    valores.push(new Date());
    campos.push(`updated_at = $${idx++}`);
    valores.push(id);

    const { rows } = await pool.query(
      `UPDATE partidos SET ${campos.join(', ')} WHERE id_partido = $${idx} RETURNING *`,
      valores
    );
    return rows[0];
  },

  async eliminarFixture(id: number) {
    const { rows } = await pool.query(`DELETE FROM fixtures WHERE id_fixture = $1 RETURNING *`, [id]);
    return rows[0];
  },

  async crearPartidoManual(datos: PartidoInput) {
    const { rows } = await pool.query(
      `INSERT INTO partidos (torneo_id, equipo_local_id, equipo_visitante_id, espacio_id, fecha, hora, jornada, fase, grupo, estado, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'programado', NOW()) RETURNING *`,
      [datos.torneo_id, datos.equipo_local_id, datos.equipo_visitante_id, datos.espacio_id || null,
        datos.fecha, datos.hora, datos.jornada, datos.fase, datos.grupo || null]
    );
    return rows[0];
  },

  async getFasesBloqueadas(torneo_id: number): Promise<{ semifinal: boolean; final: boolean }> {
    
    const { rows: [grupos] } = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE estado != 'finalizado') AS pendientes,
              COUNT(*) AS total
       FROM partidos WHERE torneo_id = $1 AND fase = 'grupos'`,
      [torneo_id]
    );
    const gruposCompletos = parseInt(grupos.total) > 0 && parseInt(grupos.pendientes) === 0;

    const { rows: [semis] } = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE estado != 'finalizado') AS pendientes,
              COUNT(*) AS total
       FROM partidos WHERE torneo_id = $1 AND fase = 'semifinal'`,
      [torneo_id]
    );
    const semisCompletas = parseInt(semis.total) > 0 && parseInt(semis.pendientes) === 0;

    return { semifinal: !gruposCompletos, final: !semisCompletas };
  },
};