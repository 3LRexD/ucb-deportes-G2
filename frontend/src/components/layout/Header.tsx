import { Bell, LogOut } from "lucide-react";
import logoUCB from "../../assets/logo-ucb.png";

interface HeaderProps {
  role: "admin" | "delegado";
  userName?: string;
  userInitials?: string;
  carrera?: string; // solo delegado
}

const THEME = {
  admin: {
    bg: "bg-[#0f2557]",
    subtitle: "text-[#93afd4]",
    subtitleText: "GESTIÓN ADMINISTRATIVA",
    avatarBg: "bg-[#1e4fa8]",
    avatarText: "text-[#93afd4]",
    bellColor: "text-[#93afd4]",
    logoutColor: "text-[#93afd4] hover:text-white",
    divider: "bg-white/20",
    userName: "text-white/80",
  },
  delegado: {
    bg: "bg-[#1a1a2e]",
    subtitle: "text-[#f5c518]/70",
    subtitleText: "PORTAL DEL DELEGADO",
    avatarBg: "bg-[#f5c518]",
    avatarText: "text-[#1a1a2e]",
    bellColor: "text-[#f5c518]/70",
    logoutColor: "text-white/40 hover:text-white/80",
    divider: "bg-white/15",
    userName: "text-white/80",
  },
};

export default function Header({
  role,
  userName = role === "admin" ? "Admin. UCB" : "Delegado",
  userInitials = "AD",
  carrera,
}: HeaderProps) {
  const t = THEME[role];

  return (
    <>
      <header className={`${t.bg} text-white shadow-md`}>
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-14">

            {/* Logo + Título */}
            <div className="flex items-center gap-3">
              <img
                src={logoUCB}
                alt="Logo UCB"
                className="h-9 w-9 object-contain rounded-full p-0.5 shrink-0"
              />
              <div>
                <h1 className="text-[13px] font-semibold leading-tight text-white">
                  Sistema de Gestión Deportiva UCB
                </h1>
                <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${t.subtitle}`}>
                  {t.subtitleText}
                </p>
              </div>
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-3">

              {/* Campana */}
              <div className="relative">
                <button className="p-2 rounded-md hover:bg-white/10 transition">
                  <Bell size={16} strokeWidth={1.8} className={t.bellColor} />
                </button>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </div>

              {/* Divisor */}
              <div className={`h-6 w-px ${t.divider}`} />

              {/* Avatar + nombre */}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full ${t.avatarBg} flex items-center justify-center text-[10px] font-bold ${t.avatarText}`}>
                  {userInitials}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-medium leading-none ${t.userName}`}>{userName}</p>
                  {role === "delegado" && carrera && (
                    <p className={`text-[10px] mt-0.5 ${t.subtitle}`}>{carrera}</p>
                  )}
                </div>
              </div>

              {/* Logout */}
              <button className={`${t.logoutColor} transition`} title="Cerrar sesión">
                <LogOut size={15} strokeWidth={1.8} />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Barra de contexto — solo delegado */}
      {role === "delegado" && carrera && (
        <div className="bg-amber-50 border-b border-amber-200/70 px-6 py-1.5">
          <p className="text-xs text-amber-700 flex items-center gap-1.5">
            <span>🏅</span>
            Delegado de{" "}
            <strong className="font-semibold text-amber-800">{carrera}</strong>
            <span className="text-amber-300 mx-1">·</span>
            Intercarreras 2026
          </p>
        </div>
      )}
    </>
  );
}