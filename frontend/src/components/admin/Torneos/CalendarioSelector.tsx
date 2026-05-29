import React, { useState, useRef, useEffect } from 'react';

interface Props {
  fechaInicio: string;
  fechaFin: string;
  onChangeFechaInicio: (v: string) => void;
  onChangeFechaFin: (v: string) => void;
  error?: string;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

function toDateObj(s: string) {
  if (!s) return null;
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

type Selecting = 'inicio' | 'fin' | null;

export const CalendarioSelector: React.FC<Props> = ({
  fechaInicio, fechaFin, onChangeFechaInicio, onChangeFechaFin, error
}) => {
  const today      = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [open, setOpen]           = useState(false);
  const [selecting, setSelecting] = useState<Selecting>(null);
  const [hovered, setHovered]     = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al click fuera
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const startDate = toDateObj(fechaInicio);
  const endDate   = toDateObj(fechaFin);

  const handleDayClick = (day: Date) => {
    if (selecting === 'inicio' || !selecting) {
      onChangeFechaInicio(toStr(day));
      setSelecting('fin');
      if (endDate && day > endDate) onChangeFechaFin('');
    } else {
      if (startDate && day < startDate) {
        onChangeFechaInicio(toStr(day));
        onChangeFechaFin(fechaInicio);
        setSelecting(null);
      } else {
        onChangeFechaFin(toStr(day));
        setSelecting(null);
        setOpen(false);
      }
    }
  };

  const isStart   = (d: Date) => startDate && toStr(d) === toStr(startDate);
  const isEnd     = (d: Date) => endDate   && toStr(d) === toStr(endDate);
  const isInRange = (d: Date) => {
    const from = startDate;
    const to   = selecting === 'fin' && hovered ? hovered : endDate;
    if (!from || !to) return false;
    return d > from && d < to;
  };

  const renderDays = () => {
    const total     = daysInMonth(viewYear, viewMonth);
    const firstDay  = firstDayOfMonth(viewYear, viewMonth);
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }
    for (let d = 1; d <= total; d++) {
      const date    = new Date(viewYear, viewMonth, d);
      const start   = isStart(date);
      const end     = isEnd(date);
      const inRange = isInRange(date);
      const isToday = toStr(date) === toStr(today);
      const isPast  = date < today && !isToday;

      cells.push(
        <button
          key={d}
          type="button"
          disabled={isPast}
          onClick={() => !isPast && handleDayClick(date)}
          onMouseEnter={() => selecting === 'fin' && setHovered(date)}
          onMouseLeave={() => setHovered(null)}
          className={`
            relative h-8 w-8 flex items-center justify-center text-sm font-medium rounded-full
            transition-all duration-150 mx-auto
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
            ${start || end
              ? 'bg-[#003DA5] text-white shadow-md shadow-blue-200 scale-110 z-10'
              : inRange
              ? 'bg-[#003DA5]/10 text-[#003DA5] rounded-none'
              : isPast ? '' : 'hover:bg-[#003DA5]/10 hover:text-[#003DA5]'}
            ${isToday && !start && !end ? 'ring-2 ring-[#E31837] ring-offset-1 text-[#E31837] font-bold' : ''}
            ${start ? 'rounded-l-full' : ''}
            ${end   ? 'rounded-r-full' : ''}
          `}
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const fmtDisplay = (s: string) => {
    if (!s) return null;
    const d = toDateObj(s);
    if (!d) return null;
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <div
        onClick={() => { setOpen(o => !o); setSelecting('inicio'); }}
        className={`
          flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 cursor-pointer
          transition-all duration-200 bg-white
          ${open ? 'border-[#003DA5] shadow-md shadow-blue-100' : 'border-gray-200 hover:border-[#003DA5]/40'}
          ${error ? 'border-[#E31837]' : ''}
        `}
      >
        <svg className="w-5 h-5 text-[#003DA5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="flex-1 flex items-center gap-2 text-sm">
          <div className={`${fechaInicio ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {fmtDisplay(fechaInicio) ?? 'Fecha inicio'}
          </div>
          <span className="text-gray-300">→</span>
          <div className={`${fechaFin ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {fmtDisplay(fechaFin) ?? 'Fecha fin'}
          </div>
        </div>
        {(fechaInicio || fechaFin) && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChangeFechaInicio(''); onChangeFechaFin(''); }}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Hint */}
      {open && selecting && (
        <p className="text-xs text-[#003DA5] mt-1 animate-pulse">
          {selecting === 'inicio' ? ' Selecciona la fecha de inicio' : ' Ahora selecciona la fecha de fin'}
        </p>
      )}
      {error && <p className="text-xs text-[#E31837] mt-1">{error}</p>}

      {/* Dropdown calendario */}
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4
                        animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Nav mes */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[#003DA5] transition-colors">
              ‹
            </button>
            <span className="font-semibold text-gray-800 text-sm">
              {MESES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[#003DA5] transition-colors">
              ›
            </button>
          </div>

          {/* Días semana */}
          <div className="grid grid-cols-7 mb-2">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="h-7 flex items-center justify-center text-xs font-semibold text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 gap-y-1">
            {renderDays()}
          </div>

          {/* Pie */}
          {fechaInicio && fechaFin && (
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>
                {Math.ceil((toDateObj(fechaFin)!.getTime() - toDateObj(fechaInicio)!.getTime()) / 86400000)} días de torneo
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-[#003DA5] hover:text-[#002d7a]"
              >
                Confirmar ✓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};