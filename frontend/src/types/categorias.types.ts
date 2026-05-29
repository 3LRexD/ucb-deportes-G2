export interface Categoria {
  id_categoria: number;
  nombre:       string;
  edad_min:     number;
  edad_max:     number;
  descripcion:  string | null;
  activo:       boolean;
  created_at:   string;   // ← agregar
  updated_at:   string;   // ← agregar
}