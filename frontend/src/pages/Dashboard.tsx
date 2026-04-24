import { useState } from "react";
import Header from "../components/layout/Header";
import Navbar, { type Tab } from "../components/layout/Navbar";
import Torneos from "./Torneos";
import Inscripciones from "./Inscripciones";
import Fixtures from "./Fixtures";
import Resultados from "./Resultados";
import Tabla from "./Tabla";
import Calendario from "./Calendario";
import Config from "./Config";

const PAGE_MAP: Record<Tab, React.ReactNode> = {
  torneos:       <Torneos />,
  inscripciones: <Inscripciones />,
  fixtures:      <Fixtures />,
  resultados:    <Resultados />,
  tabla:         <Tabla />,
  calendario:    <Calendario />,
  config:        <Config />,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("torneos");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {PAGE_MAP[activeTab]}
      </main>
    </div>
  );
}