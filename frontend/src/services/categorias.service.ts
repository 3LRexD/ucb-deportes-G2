import { api } from './api';

export const categoriasService = {
  getAll: async () => {
    return await api.get('/categorias');
  },
  // Add more methods here as needed (create, update, etc.)
};
