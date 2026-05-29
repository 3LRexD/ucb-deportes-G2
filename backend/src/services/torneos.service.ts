import pool from '../utils/db';


export interface CreateTorneoDto {
  nombre: string;
  disciplina_id: number;
  categoria_id: number;
  tipo: 'intercarreras' | 'externo' | 'amistoso' | 'copa';
  formato: 'liga' | 'eliminacion_directa' | 'grupos_eliminacion';
  temporada: string;
  fecha_inicio: string; 
  fecha_fin: string;
  reglas?: string;
  creado_por_id?: number;
}

export interface UpdateTorneoDto extends Partial<CreateTorneoDto> {
  estado?: 'planificado' | 'en_curso' | 'finalizado' | 'cancelado';
}


export const torneosService = {

  async getAll(filtros?: { estado?: string; disciplina_id?: number; tipo?: string }) {
    let query = `
      SELECT 
        t.*,
        d.nombre AS disciplina_nombre,
        c.nombre AS categoria_nombre,
        COUNT(DISTINCT e.id_equipo) AS total_equipos
      FROM torneos t
      LEFT JOIN disciplinas d ON d.id_disciplina = t.disciplina_id
      LEFT JOIN categorias c  ON c.id_categoria  = t.categoria_id
      LEFT JOIN equipos e     ON e.torneo_id      = t.id_torneo
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (filtros?.estado) {
      params.push(filtros.estado);
      conditions.push(`t.estado = $${params.length}`);
    }
    if (filtros?.disciplina_id) {
      params.push(filtros.disciplina_id);
      conditions.push(`t.disciplina_id = $${params.length}`);
    }
    if (filtros?.tipo) {
      params.push(filtros.tipo);
      conditions.push(`t.tipo = $${params.length}`);
    }

    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` GROUP BY t.id_torneo, d.nombre, c.nombre ORDER BY t.created_at DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async getById(id: number) {
    const { rows } = await pool.query(
      `SELECT 
        t.*,
        d.nombre AS disciplina_nombre,
        c.nombre AS categoria_nombre
       FROM torneos t
       LEFT JOIN disciplinas d ON d.id_disciplina = t.disciplina_id
       LEFT JOIN categorias c  ON c.id_categoria  = t.categoria_id
       WHERE t.id_torneo = $1`,
      [id]
    );
    if (!rows[0]) return null;

    const { rows: equipos } = await pool.query(
      `SELECT e.*, ca.nombre AS carrera_nombre
       FROM equipos e
       LEFT JOIN carreras ca ON ca.id_carrera = e.carrera_id
       WHERE e.torneo_id = $1
       ORDER BY e.nombre`,
      [id]
    );

    return { ...rows[0], equipos };
  },

  async create(dto: CreateTorneoDto) {
    const { rows } = await pool.query(
      `INSERT INTO torneos 
        (nombre, disciplina_id, categoria_id, tipo, formato, temporada,
         fecha_inicio, fecha_fin, estado, reglas, creado_por_id, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'planificado',$9,$10, NOW())
       RETURNING *`,
      [
        dto.nombre, dto.disciplina_id, dto.categoria_id,
        dto.tipo, dto.formato, dto.temporada,
        dto.fecha_inicio, dto.fecha_fin,
        dto.reglas ?? null, dto.creado_por_id ?? null
      ]
    );
    return rows[0];
  },

  async update(id: number, dto: UpdateTorneoDto) {
    const fields: string[] = [];
    const params: any[] = [];

    const allowed: (keyof UpdateTorneoDto)[] = [
      'nombre','disciplina_id','categoria_id','tipo','formato',
      'temporada','fecha_inicio','fecha_fin','estado','reglas'
    ];

    allowed.forEach(key => {
      if (dto[key] !== undefined) {
        params.push(dto[key]);
        fields.push(`${key} = $${params.length}`);
      }
    });

    if (!fields.length) throw new Error('Nada que actualizar');

    params.push(new Date());
    fields.push(`updated_at = $${params.length}`);
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE torneos SET ${fields.join(', ')} WHERE id_torneo = $${params.length} RETURNING *`,
      params
    );
    return rows[0] ?? null;
  },

  async delete(id: number) {
    const { rows } = await pool.query(
      `DELETE FROM torneos WHERE id_torneo = $1 AND estado = 'planificado' RETURNING id_torneo`,
      [id]
    );
    return rows[0] ?? null;
  },

  async cambiarEstado(id: number, estado: UpdateTorneoDto['estado']) {
    const { rows } = await pool.query(
      `UPDATE torneos SET estado = $1, updated_at = NOW() WHERE id_torneo = $2 RETURNING *`,
      [estado, id]
    );
    return rows[0] ?? null;
  },

  async getTablasPosiciones(torneoId: number) {
    const { rows } = await pool.query(
      `SELECT 
        tp.*,
        e.nombre AS equipo_nombre,
        ca.nombre AS carrera_nombre
       FROM tabla_posiciones tp
       JOIN equipos e ON e.id_equipo = tp.equipo_id
       LEFT JOIN carreras ca ON ca.id_carrera = e.carrera_id
       WHERE tp.torneo_id = $1
       ORDER BY tp.puntos DESC, tp.diferencia_goles DESC, tp.goles_favor DESC`,
      [torneoId]
    );
    return rows;
  },
};