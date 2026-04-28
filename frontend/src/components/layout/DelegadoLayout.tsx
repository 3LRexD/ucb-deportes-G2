import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Users, CalendarDays, Trophy, LogOut } from "lucide-react";
import logoUCB from "../../assets/logo-ucb.png";
import { mockUsuarioDelegado } from "@/data/mockData";

const NAV_ITEMS = [
  { path: "/delegado/mi-equipo",  label: "Mi Equipo",  icon: Users },
  { path: "/delegado/calendario", label: "Calendario", icon: CalendarDays },
  { path: "/delegado/fixtures",   label: "Fixtures",   icon: Trophy },
];

interface DelegadoLayoutProps {
  children?: React.ReactNode;
}

export default function DelegadoLayout({ children }: DelegadoLayoutProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const usuario = mockUsuarioDelegado;
  const initials = usuario.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#fdfbf5] flex flex-col">

      {/* ── Header — fondo oscuro, acento dorado UCB ── */}
      <header className="bg-[#1a1a2e] text-white sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo + título */}
          <div className="flex items-center gap-3">
            <img
              src={logoUCB}
              alt="Logo UCB"
              className="h-10 w-10 object-contain rounded-full p-0.5 shrink-0
                         transition-transform duration-300 hover:scale-110"
            />
            <div>
              <h1 className="font-bold text-[15px] leading-tight tracking-tight text-white">
                Sistema de Gestión Deportiva UCB
              </h1>
              <p className="text-[11px] text-[#f5c518] uppercase tracking-widest mt-0.5 opacity-80">
                Portal del Delegado
              </p>
            </div>
          </div>

          {/* Usuario + logout — desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] text-[#f5c518]/70 uppercase tracking-wider">Delegado</p>
              <p className="text-sm font-semibold text-white">{usuario.nombre}</p>
              <p className="text-[10px] text-white/40 leading-none mt-0.5">{usuario.carrera}</p>
            </div>
            <div
              className="w-8 h-8 rounded-full bg-[#f5c518] flex items-center justify-center
                          text-xs font-bold text-[#1a1a2e]
                          transition-transform duration-200 hover:scale-105
                          ring-2 ring-[#f5c518]/30"
            >
              {initials}
            </div>
            <button
              className="text-white/40 hover:text-white transition-colors duration-200 ml-1"
              title="Cerrar sesión"
            >
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="sm:hidden text-white/80 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block transition-transform duration-200 ${menuOpen ? "rotate-90" : ""}`}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>
        </div>
      </header>

      {/* ── Nav tabs — borde dorado inferior ── */}
      <nav className="bg-white border-b border-amber-200/60 shadow-sm sticky top-16 z-40 hidden sm:block">
        <div className="max-w-screen-xl mx-auto flex justify-center overflow-x-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 px-7 py-4 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${active
                    ? "border-[#f5c518] text-[#1a1a2e]"
                    : "border-transparent text-gray-400 hover:text-gray-700 hover:border-amber-300"
                  }
                `}
              >
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}
                />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Menú mobile ── */}
      <div
        className={`
          sm:hidden bg-[#13131f] text-white overflow-hidden
          transition-all duration-300 ease-in-out
          ${menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-6 py-3 border-b border-white/10">
          <p className="text-[11px] text-[#f5c518]/70 uppercase tracking-wider">Delegado</p>
          <p className="text-sm font-semibold">{usuario.nombre}</p>
          <p className="text-[11px] text-white/40">{usuario.carrera}</p>
        </div>
        {NAV_ITEMS.map(({ path, label, icon: Icon }, i) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`
                flex items-center gap-3 px-6 py-3 text-sm border-b border-white/[0.06]
                transition-colors duration-150
                ${active
                  ? "text-[#f5c518] font-semibold bg-white/5"
                  : "text-white/50 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
        <div className="px-6 py-3">
          <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
            <LogOut size={15} strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Contenido ── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}