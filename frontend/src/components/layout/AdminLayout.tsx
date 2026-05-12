import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Trophy, Users, Grid3X3, BarChart2, Table2, CalendarDays, Settings, LogOut } from "lucide-react";
import logoUCB from "../../assets/logo-ucb.png";
import { mockUsuarioAdmin } from "@/data/mockData";

// Sin "Inscripciones"
const NAV_ITEMS = [
  { path: "/admin/torneos",    label: "Torneos",    icon: Trophy },
  { path: "/admin/equipos",    label: "Equipos",    icon: Users },
  { path: "/admin/fixtures",   label: "Fixtures",   icon: Grid3X3 },
  { path: "/admin/resultados", label: "Resultados", icon: BarChart2 },
  { path: "/admin/tabla",      label: "Tabla",      icon: Table2 },
  { path: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { path: "/admin/config",     label: "Config",     icon: Settings },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const usuario = mockUsuarioAdmin;
  const initials = usuario.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">

      {/* ── Header — estilo figma: logo izq, usuario der ── */}
      <header className="bg-[#052845] text-white sticky top-0 z-50">
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
              <p className="text-[11px] text-blue-300 uppercase tracking-widest mt-0.5">
                Gestión Administrativa
              </p>
            </div>
          </div>

          {/* Usuario + logout — desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] text-blue-300 uppercase tracking-wider">Administrador</p>
              <p className="text-sm font-semibold text-white">{usuario.nombre}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center
                            text-xs font-bold text-white ring-2 ring-blue-400/40
                            transition-transform duration-200 hover:scale-105">
              {initials}
            </div>
            <button
              className="text-blue-300 hover:text-white transition-colors duration-200 ml-1"
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

      {/* ── Nav tabs — separado del header, como en el figma ── */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40 hidden sm:block">
        <div className="max-w-screen-xl mx-auto flex justify-center overflow-x-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${active
                    ? "border-[#1e3a8a] text-[#1e3a8a]"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  }
                `}
              >
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  className={`transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`}
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
          sm:hidden bg-[#1a337a] text-white overflow-hidden
          transition-all duration-300 ease-in-out
          ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-6 py-3 border-b border-white/10">
          <p className="text-[11px] text-blue-300 uppercase tracking-wider">Administrador</p>
          <p className="text-sm font-semibold">{usuario.nombre}</p>
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
                ${active ? "text-white font-semibold bg-white/10" : "text-blue-200 hover:text-white hover:bg-white/5"}
              `}
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
        <div className="px-6 py-3">
          <button className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors">
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