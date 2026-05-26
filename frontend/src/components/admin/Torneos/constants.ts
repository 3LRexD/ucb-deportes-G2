import { Clock, PlayCircle, CheckCircle, Ban } from 'lucide-react';

export const ESTADO_CONFIG: Record<string, any> = {
  planificado: { label: 'Planificado', color: 'bg-blue-50 text-blue-700', icon: Clock },
  en_curso:    { label: 'En curso',    color: 'bg-green-50 text-green-700', icon: PlayCircle },
  finalizado:  { label: 'Finalizado',  color: 'bg-gray-100 text-gray-500', icon: CheckCircle },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-50 text-red-600',    icon: Ban },
};

export const FORMATO_LABELS: Record<string, string> = {
  liga: 'Liga (todos contra todos)',
  eliminacion_directa: 'Eliminación directa',
  grupos_eliminacion: 'Fase de grupos + Eliminación',
};

export const TIPO_LABELS: Record<string, string> = {
  intercarreras: 'Intercarreras',
  externo: 'Externo',
  amistoso: 'Amistoso',
};
