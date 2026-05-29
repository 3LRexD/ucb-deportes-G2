import { useState } from "react";

interface Props {
  onLogin: (ci: string, password: string) => Promise<void>;
  error: string | null;
  cargando: boolean;
}

export default function LoginDelegadoForm({ onLogin, error, cargando }: Props) {
  const [ci, setCi] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!ci.trim() || !password.trim()) return;
    await onLogin(ci.trim(), password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        {/* Logo / icono */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 bg-[#0a1628] rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center">Portal Delegado</h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Sistema de Gestión Deportiva UCB
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Carnet de Identidad
            </label>
            <input
              type="text"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ej: 8123456"
              className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={cargando || !ci.trim() || !password.trim()}
            className="w-full py-2.5 bg-[#0a1628] text-white text-sm font-medium rounded-xl hover:bg-[#1e3a5f] disabled:opacity-50 transition-colors"
          >
            {cargando ? "Verificando..." : "Ingresar"}
          </button>
        </div>

        {/* Hint para el mock */}
        <div className="mt-5 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400 font-medium mb-1">Credenciales de prueba:</p>
          <p className="text-xs text-gray-500">CI: <span className="font-mono font-medium">8123456</span> — cualquier contraseña</p>
        </div>
      </div>
    </div>
  );
}
