import { useState } from "react";
import { Search, Plus, X, UserPlus, Trophy, Medal } from "lucide-react";

// Definición de tipos
type TipoEstudiante = "UCB" | "Externo";
type Disciplina = "Voleibol" | "Futsal" | "Básquetbol" | "Ajedrez" | "";
type Categoria = "Sub-13" | "Sub-15" | "Juvenil" | "Mayor" | "";

interface Jugador {
  id: string;
  ci: string;
  nombre: string;
  fechaNacimiento: string;
  tipoEstudiante: TipoEstudiante;
  disciplina: Disciplina;
  categoria: Categoria;
}

export default function Inscripciones() {
  // Estado inicial con un array estático de prueba
  const [jugadores, setJugadores] = useState<Jugador[]>([
    {
      id: "1",
      ci: "1234567",
      nombre: "Carlos Perez",
      fechaNacimiento: "2005-05-12",
      tipoEstudiante: "UCB",
      disciplina: "Futsal",
      categoria: "Juvenil",
    },
    {
      id: "2",
      ci: "7654321",
      nombre: "Ana Gomez",
      fechaNacimiento: "2004-10-22",
      tipoEstudiante: "Externo",
      disciplina: "Voleibol",
      categoria: "Mayor",
    },
  ]);

  const [busquedaCi, setBusquedaCi] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    ci: "",
    nombre: "",
    fechaNacimiento: "",
    tipoEstudiante: "UCB" as TipoEstudiante,
    disciplina: "" as Disciplina,
    categoria: "" as Categoria,
  });

  // Filtrar jugadores por CI
  const jugadoresFiltrados = jugadores.filter((jugador) =>
    jugador.ci.includes(busquedaCi)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoJugador: Jugador = {
      ...formData,
      id: crypto.randomUUID(), // Genera un ID único temporal
    };
    setJugadores([...jugadores, nuevoJugador]);
    setIsModalOpen(false);
    // Reiniciar formulario
    setFormData({
      ci: "",
      nombre: "",
      fechaNacimiento: "",
      tipoEstudiante: "UCB",
      disciplina: "",
      categoria: "",
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-130px)] bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado y Buscador */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1e3a8a]">Gestión de Inscripciones</h2>
            <p className="text-gray-500 text-sm">Administración de deportistas delegados</p>
          </div>

          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por CI..."
              value={busquedaCi}
              onChange={(e) => setBusquedaCi(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-shadow"
            />
          </div>
        </div>

        {/* Lista de Jugadores (Tabla) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">CI</th>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Disciplina</th>
                  <th className="px-6 py-4">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {jugadoresFiltrados.length > 0 ? (
                  jugadoresFiltrados.map((jugador) => (
                    <tr key={jugador.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{jugador.ci}</td>
                      <td className="px-6 py-4">{jugador.nombre}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          jugador.tipoEstudiante === 'UCB' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {jugador.tipoEstudiante}
                        </span>
                      </td>
                      <td className="px-6 py-4">{jugador.disciplina}</td>
                      <td className="px-6 py-4">{jugador.categoria}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      No se encontraron deportistas con ese CI.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón Flotante Amigable (Abajo a la derecha) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 sm:bottom-12 sm:right-12 bg-[#1e3a8a] text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(30,58,138,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-medium z-40 group"
      >
        <UserPlus size={22} className="group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Agregar Estudiante</span>
      </button>

      {/* Modal de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
                <Medal className="text-blue-500" size={24} />
                Nuevo Deportista
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-5">
              {/* Tipo de Estudiante */}
              <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoEstudiante: "UCB" })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    formData.tipoEstudiante === "UCB"
                      ? "bg-white text-[#1e3a8a] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Estudiante UCB
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoEstudiante: "Externo" })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    formData.tipoEstudiante === "Externo"
                      ? "bg-white text-[#1e3a8a] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Estudiante Externo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* CI */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">CI / Identificación</label>
                  <input
                    required
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none"
                    placeholder="Ej. 1234567"
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                  <input
                    required
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none"
                  />
                </div>
              </div>

              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  required
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none"
                  placeholder="Nombres y Apellidos"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Disciplina */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Disciplina</label>
                  <select
                    required
                    name="disciplina"
                    value={formData.disciplina}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none bg-white"
                  >
                    <option value="" disabled>Seleccione...</option>
                    <option value="Voleibol">Voleibol</option>
                    <option value="Futsal">Futsal</option>
                    <option value="Básquetbol">Básquetbol</option>
                    <option value="Ajedrez">Ajedrez</option>
                  </select>
                </div>

                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    required
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none bg-white"
                  >
                    <option value="" disabled>Seleccione...</option>
                    <option value="Sub-13">Sub-13</option>
                    <option value="Sub-15">Sub-15</option>
                    <option value="Juvenil">Juvenil</option>
                    <option value="Mayor">Mayor</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus size={18} />
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}