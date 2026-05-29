import type { JugadorEquipo } from "@/types/equipos.types";


interface Props {
  jugador: JugadorEquipo;
  onQuitar: (id: number) => void;
  index: number;
}

export default function JugadorRow({ jugador, onQuitar, index }: Props) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
      <td className="py-3 px-4 text-sm text-gray-500 w-8">{index + 1}</td>
      <td className="py-3 px-4">
        <div>
          <p className="text-sm font-medium text-gray-800">{jugador.deportista_nombre}</p>
          <p className="text-xs text-gray-400">CI: {jugador.deportista_ci}</p>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        {jugador.numero_camiseta ? `#${jugador.numero_camiseta}` : <span className="text-gray-300">—</span>}
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        {jugador.posicion ?? <span className="text-gray-300">—</span>}
      </td>
      <td className="py-3 px-4">
        {jugador.matricula_validada ? (
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Validado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pendiente
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={() => onQuitar(jugador.id_equipo_jugador)}
          className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-all duration-150 px-2 py-1 rounded hover:bg-red-50"
        >
          Quitar
        </button>
      </td>
    </tr>
  );
}
