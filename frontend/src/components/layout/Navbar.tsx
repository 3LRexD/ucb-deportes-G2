import {
  Trophy, Users, Grid3X3, BarChart2,
  Table2, CalendarDays, Settings,
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type AdminTab =
  | "torneos" | "equipos" | "inscripciones" | "fixtures"
  | "resultados" | "tabla" | "calendario" | "config";

export type DelegadoTab = "mi-equipo" | "calendario" | "fixtures";

export type Tab = AdminTab | DelegadoTab;

// ── Items por rol ─────────────────────────────────────────────────────────────

const ADMIN_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "torneos",       label: "Torneos",       icon: <Trophy size={14} strokeWidth={1.8} /> },
  { id: "equipos",       label: "Equipos",       icon: <Users size={14} strokeWidth={1.8} /> },
  { id: "inscripciones", label: "Inscripciones", icon: <Users size={14} strokeWidth={1.8} /> },
  { id: "fixtures",      label: "Fixtures",      icon: <Grid3X3 size={14} strokeWidth={1.8} /> },
  { id: "resultados",    label: "Resultados",    icon: <BarChart2 size={14} strokeWidth={1.8} /> },
  { id: "tabla",         label: "Tabla",         icon: <Table2 size={14} strokeWidth={1.8} /> },
  { id: "calendario",    label: "Calendario",    icon: <CalendarDays size={14} strokeWidth={1.8} /> },
  { id: "config",        label: "Config",        icon: <Settings size={14} strokeWidth={1.8} /> },
];

const DELEGADO_ITEMS: { id: DelegadoTab; label: string; icon: React.ReactNode }[] = [
  { id: "mi-equipo",  label: "Mi Equipo",  icon: <Users size={14} strokeWidth={1.8} /> },
  { id: "calendario", label: "Calendario", icon: <CalendarDays size={14} strokeWidth={1.8} /> },
  { id: "fixtures",   label: "Fixtures",   icon: <Trophy size={14} strokeWidth={1.8} /> },
];

// ── Temas ─────────────────────────────────────────────────────────────────────

const THEME = {
  admin: {
    borderBottom: "border-slate-200",
    activeText: "text-[#0f2557]",
    activeBorder: "border-[#0f2557]",
    inactiveText: "text-slate-400",
    hoverText: "hover:text-slate-700",
    hoverBorder: "hover:border-slate-300",
  },
  delegado: {
    borderBottom: "border-amber-100",
    activeText: "text-[#1a1a2e]",
    activeBorder: "border-[#f5c518]",
    inactiveText: "text-slate-400",
    hoverText: "hover:text-slate-700",
    hoverBorder: "hover:border-amber-200",
  },
};

// ── Componente ────────────────────────────────────────────────────────────────

interface NavbarProps {
  role: "admin" | "delegado";
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navbar({ role, activeTab, onTabChange }: NavbarProps) {
  const t = THEME[role];
  const items = role === "admin" ? ADMIN_ITEMS : DELEGADO_ITEMS;

  return (
    <nav className={`bg-white border-b ${t.borderBottom} shadow-sm sticky top-14 z-40`}>
      <div className="flex justify-center overflow-x-auto">
        {items.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as Tab)}
              className={`
                flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap
                border-b-2 transition-all duration-200
                ${active
                  ? `${t.activeBorder} ${t.activeText}`
                  : `border-transparent ${t.inactiveText} ${t.hoverText} ${t.hoverBorder}`
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}