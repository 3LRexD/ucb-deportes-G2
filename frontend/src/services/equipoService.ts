/**
 * Servicio de Equipos - Frontend
 * Comunicación con la API de equipos
 */

import axios from 'axios';
import { Equipo, ApiResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const apiClient = axios.create({
  baseURL: `${API_URL}/equipos`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getAllEquipos = async (): Promise<Equipo[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Equipo[]>>('/');
    if (response.data.success) {
      return response.data.data || [];
    }
    throw new Error(response.data.error || 'Error al obtener equipos');
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
};

export const getEquipoById = async (id: number): Promise<Equipo> => {
  try {
    const response = await apiClient.get<ApiResponse<Equipo>>(`/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Equipo no encontrado');
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
};

export const createEquipo = async (data: Partial<Equipo>): Promise<Equipo> => {
  try {
    const response = await apiClient.post<ApiResponse<Equipo>>('/', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Error al crear equipo');
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
};

export const updateEquipo = async (id: number, data: Partial<Equipo>): Promise<Equipo> => {
  try {
    const response = await apiClient.put<ApiResponse<Equipo>>(`/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Error al actualizar equipo');
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
};

export const deleteEquipo = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete<ApiResponse>(`/${id}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.error || 'Error al eliminar equipo');
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
};

export const getEquiposByCarrera = async (carreraId: number): Promise<Equipo[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Equipo[]>>(`/carrera/${carreraId}`);
    if (response.data.success) {
      return response.data.data || [];
    }
    throw new Error(response.data.error || 'Error al obtener equipos');
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
};

export const equipoService = {
  getAllEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  getEquiposByCarrera
};
