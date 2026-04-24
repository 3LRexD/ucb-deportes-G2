import { Trophy, Users, Grid3X3, BarChart2, Table2, CalendarDays, Settings } from "lucide-react";

export type Tab = "torneos" | "inscripciones" | "fixtures" | "resultados" | "tabla" | "calendario" | "config";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "torneos",       label: "Torneos",       icon: <Trophy size={15} /> },
  { id: "inscripciones", label: "Inscripciones", icon: <Users size={15} /> },
  { id: "fixtures",      label: "Fixtures",      icon: <Grid3X3 size={15} /> },
  { id: "resultados",    label: "Resultados",    icon: <BarChart2 size={15} /> },
  { id: "tabla",         label: "Tabla",         icon: <Table2 size={15} /> },
  { id: "calendario",    label: "Calendario",    icon: <CalendarDays size={15} /> },
  { id: "config",        label: "Config",        icon: <Settings size={15} /> },
];

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      {/* Centrado con justify-center */}
      <div className="flex justify-center overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap
              border-b-2 transition-all duration-200
              ${activeTab === item.id
                ? "border-[#1e3a8a] text-[#1e3a8a]"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }
            `}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}