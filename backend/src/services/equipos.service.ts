import pool from '../utils/db';

export interface Equipo {
  id_equipo: number;
  nombre: string;
  torneo_id: number;
  carrera_id: number | null;
  carrera_nombre: string | null;
  delegado_id: number | null;
  delegado_nombre: string | null;
  delegado_ci: string | null;
  delegado_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface JugadorEquipo {
  id_equipo_jugador: number;
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  numero_camiseta: number | null;
  posicion: string | null;
  fecha_inscripcion: string;
  habilitado: boolean;
  matricula_validada: boolean;
}

export interface EquipoConJugadores extends Equipo {
  jugadores: JugadorEquipo[];
}
export async function getEquiposByTorneo(torneoId: number): Promise<EquipoConJugadores[]> {
  const equiposResult = await pool.query(`
    SELECT
      e.id_equipo,
      e.nombre,
      e.torneo_id,
      e.carrera_id,
      c.nombre          AS carrera_nombre,
      e.delegado_id,
      u.nombre_completo AS delegado_nombre,
      u.ci              AS delegado_ci,
      u.email           AS delegado_email,
      e.created_at,
      e.updated_at
    FROM equipos e
    LEFT JOIN carreras  c ON c.id_carrera = e.carrera_id
    LEFT JOIN usuarios  u ON u.id         = e.delegado_id
    WHERE e.torneo_id = $1
    ORDER BY e.created_at ASC
  `, [torneoId]);

  if (equiposResult.rows.length === 0) return [];

  const equipoIds = equiposResult.rows.map((e: any) => e.id_equipo);

  const jugadoresResult = await pool.query(`
    SELECT
      ej.id_equipo_jugador,
      ej.equipo_id,
      ej.deportista_id,
      ej.deportista_ci,
      ej.deportista_nombre,
      ej.numero_camiseta,
      ej.posicion,
      ej.fecha_inscripcion,
      ej.habilitado,
      ej.matricula_validada
    FROM equipo_jugadores ej
    WHERE ej.equipo_id = ANY($1)
      AND ej.habilitado = true
    ORDER BY ej.fecha_inscripcion ASC
  `, [equipoIds]);

  const jugadoresPorEquipo = new Map<number, JugadorEquipo[]>();
  for (const j of jugadoresResult.rows) {
    const { equipo_id, ...jugador } = j;
    if (!jugadoresPorEquipo.has(equipo_id)) {
      jugadoresPorEquipo.set(equipo_id, []);
    }
    jugadoresPorEquipo.get(equipo_id)!.push(jugador);
  }

  return equiposResult.rows.map((equipo: any) => ({
    ...equipo,
    jugadores: jugadoresPorEquipo.get(equipo.id_equipo) ?? [],
  }));
}

export async function crearEquipo(
  nombre: string,
  torneoId: number,
  carreraId: number | null
): Promise<Equipo> {
  if (carreraId !== null) {
    const existe = await pool.query(`
      SELECT id_equipo FROM equipos
      WHERE torneo_id = $1 AND carrera_id = $2
      LIMIT 1
    `, [torneoId, carreraId]);

    if (existe.rows.length > 0) {
      throw new Error('Ya existe un equipo registrado para esta carrera en el torneo');
    }
  }

  const result = await pool.query(`
    INSERT INTO equipos (nombre, torneo_id, carrera_id, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING
      id_equipo, nombre, torneo_id, carrera_id,
      NULL::text AS carrera_nombre,
      NULL::integer AS delegado_id,
      NULL::text AS delegado_nombre,
      NULL::text AS delegado_ci,
      NULL::text AS delegado_email,
      created_at, updated_at
  `, [nombre, torneoId, carreraId]);

  return result.rows[0];
}

export async function eliminarEquipo(equipoId: number): Promise<void> {
  await pool.query(`DELETE FROM equipos WHERE id_equipo = $1`, [equipoId]);
}

export async function buscarUsuarioPorCI(ci: string) {
  const result = await pool.query(`
    SELECT id, nombre_completo, ci, email, rol
    FROM usuarios
    WHERE ci = $1 AND activo = true
    LIMIT 1
  `, [ci]);
  return result.rows[0] ?? null;
}

export async function asignarDelegado(
  equipoId: number,
  usuarioId: number
): Promise<void> {
  await pool.query(`
    UPDATE equipos
    SET delegado_id = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id_equipo = $2
  `, [usuarioId, equipoId]);
}

export async function buscarDeportistaPorCI(ci: string) {
  const result = await pool.query(`
    SELECT id, ci, nombre_completo, carrera, matricula_activa
    FROM deportistas
    WHERE ci = $1 AND activo = true
    LIMIT 1
  `, [ci]);
  return result.rows[0] ?? null;
}

export async function agregarJugador(
  equipoId: number,
  deportista: { id: number; ci: string; nombre_completo: string; matricula_activa: boolean }
): Promise<void> {
  const existe = await pool.query(`
    SELECT id_equipo_jugador FROM equipo_jugadores
    WHERE equipo_id = $1 AND deportista_id = $2 AND habilitado = true
    LIMIT 1
  `, [equipoId, deportista.id]);

  if (existe.rows.length > 0) {
    throw new Error('El jugador ya está inscrito en este equipo');
  }

  await pool.query(`
    INSERT INTO equipo_jugadores
      (equipo_id, deportista_id, deportista_ci, deportista_nombre,
       fecha_inscripcion, habilitado, matricula_validada)
    VALUES ($1, $2, $3, $4, CURRENT_DATE, true, $5)
  `, [equipoId, deportista.id, deportista.ci, deportista.nombre_completo, deportista.matricula_activa]);
}

export async function quitarJugador(
  equipoId: number,
  jugadorId: number
): Promise<void> {
  await pool.query(`
    UPDATE equipo_jugadores
    SET habilitado = false, fecha_baja = CURRENT_DATE
    WHERE id_equipo_jugador = $1 AND equipo_id = $2
  `, [jugadorId, equipoId]);
}


export async function getEquipoByDelegadoCI(ci: string): Promise<EquipoConJugadores | null> {
  const usuario = await buscarUsuarioPorCI(ci);
  if (!usuario) return null;

  const equipoResult = await pool.query(`
    SELECT
      e.id_equipo, e.nombre, e.torneo_id, e.carrera_id,
      c.nombre          AS carrera_nombre,
      e.delegado_id,
      u.nombre_completo AS delegado_nombre,
      u.ci              AS delegado_ci,
      u.email           AS delegado_email,
      e.created_at, e.updated_at
    FROM equipos e
    LEFT JOIN carreras c ON c.id_carrera = e.carrera_id
    LEFT JOIN usuarios u ON u.id = e.delegado_id
    WHERE e.delegado_id = $1
    ORDER BY e.created_at DESC
    LIMIT 1
  `, [usuario.id]);

  if (equipoResult.rows.length === 0) return null;

  const equipo = equipoResult.rows[0];

  const jugadoresResult = await pool.query(`
    SELECT
      id_equipo_jugador, deportista_id, deportista_ci,
      deportista_nombre, numero_camiseta, posicion,
      fecha_inscripcion, habilitado, matricula_validada
    FROM equipo_jugadores
    WHERE equipo_id = $1 AND habilitado = true
    ORDER BY fecha_inscripcion ASC
  `, [equipo.id_equipo]);

  return { ...equipo, jugadores: jugadoresResult.rows };
}
