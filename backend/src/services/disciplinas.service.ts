import pool from "../utils/db";

export const disciplinasService = {
  async getAll(soloActivas = false) {
    const where = soloActivas ? `WHERE activo = true` : '';
    const { rows } = await pool.query(
      `SELECT * FROM disciplinas ${where} ORDER BY orden ASC, nombre ASC`
    );
    return rows;
  },

  async getById(id: number) {
    const { rows } = await pool.query(
      `SELECT * FROM disciplinas WHERE id_disciplina = $1`, [id]
    );
    return rows[0] ?? null;
  },

  async create(dto: { nombre: string; descripcion?: string; orden?: number }) {
    const { rows } = await pool.query(
      `INSERT INTO disciplinas (nombre, descripcion, activo, orden, updated_at)
       VALUES ($1, $2, true, $3, NOW()) RETURNING *`,
      [dto.nombre, dto.descripcion ?? null, dto.orden ?? 0]
    );
    return rows[0];
  },

  async update(id: number, dto: { nombre?: string; descripcion?: string; activo?: boolean; orden?: number }) {
    const fields: string[] = [];
    const params: any[] = [];
    const keys = ['nombre','descripcion','activo','orden'] as const;
    keys.forEach(k => {
      if (dto[k] !== undefined) { params.push(dto[k]); fields.push(`${k} = $${params.length}`); }
    });
    if (!fields.length) throw new Error('Nada que actualizar');
    params.push(new Date()); fields.push(`updated_at = $${params.length}`);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE disciplinas SET ${fields.join(', ')} WHERE id_disciplina = $${params.length} RETURNING *`, params
    );
    return rows[0] ?? null;
  },

  async toggleActivo(id: number) {
    const { rows } = await pool.query(
      `UPDATE disciplinas SET activo = NOT activo, updated_at = NOW()
       WHERE id_disciplina = $1 RETURNING *`, [id]
    );
    return rows[0] ?? null;
  },
};