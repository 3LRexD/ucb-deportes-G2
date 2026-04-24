import { Bell } from "lucide-react";
import logoUCB from "../../assets/logo-ucb.png";

export default function Header() {
  return (
    <header className="bg-[#1e3a8a] text-white shadow-lg">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo + Título ── */}
          <div className="flex items-center gap-3">
            <img
              src={logoUCB}
              alt="Logo UCB"
              className="h-11 w-11 object-contain rounded-full bg-white p-0.5"
            />
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight">
                Sistema de Gestión Deportiva UCB
              </h1>
              <p className="text-blue-200 text-xs">
                GESTIÓN ADMINISTRATIVA
              </p>
            </div>
          </div>

          {/* ── Derecha: campana + avatar ── */}
          <div className="flex items-center gap-3">
            {/* Campana */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-white/10 transition">
                <Bell size={20} className="text-white" />
              </button>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>

            {/* Divisor */}
            <div className="h-8 w-px bg-white/20" />

            {/* Avatar + nombre */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold">
                AD
              </div>
              <span className="text-sm font-medium hidden sm:block">Admin. UCB</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}