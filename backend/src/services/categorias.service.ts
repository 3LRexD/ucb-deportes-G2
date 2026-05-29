import pool from '../utils/db';

export const categoriasService = {
  async getAll(soloActivas = false) {
    const where = soloActivas ? `WHERE activo = true` : '';
    const { rows } = await pool.query(
      `SELECT * FROM categorias ${where} ORDER BY edad_min ASC`
    );
    return rows;
  },

  async getById(id: number) {
    const { rows } = await pool.query(
      `SELECT * FROM categorias WHERE id_categoria = $1`, [id]
    );
    return rows[0] ?? null;
  },

  async create(dto: { nombre: string; edad_min: number; edad_max: number; descripcion?: string }) {
    const { rows } = await pool.query(
      `INSERT INTO categorias (nombre, edad_min, edad_max, descripcion, activo, updated_at)
       VALUES ($1,$2,$3,$4,true,NOW()) RETURNING *`,
      [dto.nombre, dto.edad_min, dto.edad_max, dto.descripcion ?? null]
    );
    return rows[0];
  },

  async update(id: number, dto: { nombre?: string; edad_min?: number; edad_max?: number; descripcion?: string; activo?: boolean }) {
    const fields: string[] = [];
    const params: any[] = [];
    const keys = ['nombre','edad_min','edad_max','descripcion','activo'] as const;
    keys.forEach(k => {
      if (dto[k] !== undefined) { params.push(dto[k]); fields.push(`${k} = $${params.length}`); }
    });
    if (!fields.length) throw new Error('Nada que actualizar');
    params.push(new Date()); fields.push(`updated_at = $${params.length}`);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE categorias SET ${fields.join(', ')} WHERE id_categoria = $${params.length} RETURNING *`, params
    );
    return rows[0] ?? null;
  },
};