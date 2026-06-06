'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Home as HomeIcon, Boxes, PackageCheck, PackagePlus, PackageMinus, Truck,
  Warehouse, CalendarClock, RefreshCw, ClipboardList, ArrowLeftRight, BarChart3,
  Filter, AlertTriangle, ExternalLink, RotateCcw, SearchCheck, Tag,
  FileText, ChevronRight, ScanLine,
} from 'lucide-react';

type Kpis = Record<string, any>;
type Lote = Record<string, any>;
type Movimiento = Record<string, any>;

const API = '/api/sitrap';
const GREEN = '#166534';
const COLORS = ['#166534', '#3f7f34', '#77a86c', '#adc7a7', '#d1d8dc'];

const FORM_E1_LOTES = 'https://forms.gle/rmeVotdbvr1Mcmay8';
const FORM_E2_MOVIMIENTOS = 'https://forms.gle/87vXapaf6nDGR9gN9';

const n = (v: any) => {
  if (v === null || v === undefined || v === '') return 0;
  const x = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(x) ? 0 : x;
};

const txt = (v: any) => String(v || '').trim();
const fmt = (v: any) => new Intl.NumberFormat('es-CL').format(n(v));

const fmtDate = (v: any) => {
  const d = new Date(v || Date.now());
  if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString('es-CL');
  return d.toLocaleDateString('es-CL');
};

const short = (v: any, max = 18) => {
  const s = txt(v);
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
};

function SidebarTitle({ children }: any) {
  return (
    <div className="mb-0.5 rounded-md bg-[#14532d] px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-white">
      {children}
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="mb-0 block text-[7px] font-black uppercase tracking-wide text-[#14532d]">
        {label}
      </label>
      <select
        className="w-full rounded-md border border-green-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-slate-800 outline-none focus:border-[#166534]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todas</option>
        {options.map((x: string) => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}

function SectionHeader({ title, action }: any) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[15px] font-black leading-none text-[#14532d]">{title}</h2>
      {action && <span className="text-[9px] font-bold text-[#166534]">{action}</span>}
    </div>
  );
}

function CompactKpi({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div className="flex min-h-[42px] items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-1.5 shadow-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#166534]">
          <Icon size={15} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 text-left">
          <p className="truncate text-[10px] font-black leading-tight text-slate-800">{title}</p>
          <p className="text-[8.5px] leading-tight text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className="pl-3 text-right text-[17px] font-black leading-none text-[#14532d]">{fmt(value)}</p>
    </div>
  );
}

function MobileAction({ title, subtitle, icon: Icon, href, onClick, badge }: any) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-[#166534]">
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-[15px] font-black leading-tight text-slate-900">{title}</p>
          <p className="mt-0.5 text-[12px] leading-tight text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
            {badge}
          </span>
        )}
        <ChevronRight size={18} className="text-slate-400" />
      </div>
    </>
  );

  const className =
    'flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm active:scale-[0.99]';

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function MobileMiniKpi({ label, value, tone = 'normal' }: any) {
  const toneClass = tone === 'warn' ? 'bg-amber-50 text-amber-800' : 'bg-white text-[#14532d]';
  return (
    <div className={`rounded-2xl border border-slate-100 p-3 shadow-sm ${toneClass}`}>
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-[20px] font-black leading-none">{fmt(value)}</p>
      <p className="mt-1 text-[10px] text-slate-500">plantas</p>
    </div>
  );
}

export default function Home() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  const [vivero, setVivero] = useState('');
  const [especie, setEspecie] = useState('');
  const [contrato, setContrato] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [k, l, m] = await Promise.all([
        fetch(`${API}?view=kpis`).then((r) => r.json()),
        fetch(`${API}?view=lotes`).then((r) => r.json()),
        fetch(`${API}?view=movimientos`).then((r) => r.json()),
      ]);
      setKpis(k);
      setLotes(Array.isArray(l) ? l : []);
      setMovimientos(Array.isArray(m) ? m : []);
      setLoading(false);
    }
    load();
  }, []);

  const options = useMemo(() => {
    const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort();
    return {
      viveros: uniq(lotes.map((x) => txt(x.Vivero))),
      especies: uniq(lotes.map((x) => txt(x.EspecieMaterial))),
      contratos: uniq(movimientos.map((x) => txt(x.Contrato_Final || x.Contrato))),
      empresas: uniq(movimientos.map((x) => txt(x.Empresa_EECC_Final || x.Empresa_EECC))),
      fechas: ['Últimos 30 días', 'Últimos 90 días', 'Año 2026'],
    };
  }, [lotes, movimientos]);

  const lotesFiltrados = useMemo(() => {
    return lotes.filter((l) => {
      if (vivero && txt(l.Vivero) !== vivero) return false;
      if (especie && txt(l.EspecieMaterial) !== especie) return false;
      return true;
    });
  }, [lotes, vivero, especie]);

  const idsFiltrados = useMemo(
  () => new Set(lotesFiltrados.map((l) => txt(l.ID_Final_Lote || l.ID_Lote_SITRAP || l.ID_Lote_SITRAP_Base))),
  [lotesFiltrados]
);

  const movimientosFiltrados = useMemo(() => {
    const now = new Date();
    return movimientos.filter((m) => {
      const id = txt(m.ID_Final_Lote);
      if (idsFiltrados.size && id && !idsFiltrados.has(id)) return false;
      if (contrato && txt(m.Contrato_Final || m.Contrato) !== contrato) return false;
      if (empresa && txt(m.Empresa_EECC_Final || m.Empresa_EECC) !== empresa) return false;

      if (vivero) {
        const origen = txt(m.Origen);
        const destino = txt(m.Destino);
        if (origen !== vivero && destino !== vivero) return false;
      }

      if (fecha) {
        const f = new Date(m.Fecha_Movimiento || m.Fecha_Registro || m.Timestamp || '');
        if (Number.isNaN(f.getTime())) return false;

        if (fecha === 'Últimos 30 días') {
          const lim = new Date(now);
          lim.setDate(now.getDate() - 30);
          if (f < lim) return false;
        }

        if (fecha === 'Últimos 90 días') {
          const lim = new Date(now);
          lim.setDate(now.getDate() - 90);
          if (f < lim) return false;
        }

        if (fecha === 'Año 2026' && f.getFullYear() !== 2026) return false;
      }

      return true;
    });
  }, [movimientos, idsFiltrados, contrato, empresa, fecha, vivero]);

  const calc = useMemo(() => {
    const stockInicial = n(kpis?.stockGeneralInicial ?? kpis?.stockInicial ?? kpis?.stock_inicial);
    const stockActual = n(kpis?.stockGeneralActual ?? kpis?.stockActual ?? kpis?.stock_actual);
    const totalLotes = n(kpis?.totalLotes ?? kpis?.total_lotes ?? kpis?.lotesRegistrados);
    const entradasVMA = n(kpis?.entradasVMA ?? kpis?.recepcionesVMA ?? kpis?.ingresos_destino);
    const salidasViveros = n(kpis?.salidasViveros ?? kpis?.salidas_viveros ?? kpis?.despachosAVMA);
    const trasladosPendientes = n(kpis?.trasladosPendientes ?? kpis?.lotesEnTransito ?? kpis?.lotes_en_transito);
    const salidasEECC = n(kpis?.despachosEECC ?? kpis?.salidasEECC ?? kpis?.salidas_eecc);
    const bajas = n(kpis?.bajasPerdidas ?? kpis?.bajas_perdidas ?? kpis?.bajas);
    const transformaciones = n(kpis?.transformaciones ?? kpis?.transformacionesLote ?? kpis?.transformaciones_lote);

    const stockViveroSeleccionado = vivero
      ? (() => {
          const inicial = lotes
            .filter((l) => txt(l.Vivero) === vivero)
            .reduce((s, l) => s + n(l.CantidadInicialP), 0);

          const salidas = movimientos
            .filter((m) => txt(m.Origen) === vivero)
            .filter((m) => ['Traslado entre viveros', 'Despacho a EECC'].includes(txt(m.Subtipo_Movimiento)))
            .reduce((s, m) => s + n(m.Cantidad), 0);

          const ingresos = movimientos
            .filter((m) => txt(m.Destino) === vivero)
            .filter((m) => ['Recepción en vivero', 'Devolución desde EECC'].includes(txt(m.Subtipo_Movimiento)))
            .reduce((s, m) => s + n(m.Cantidad), 0);

          return inicial - salidas + ingresos;
        })()
      : stockInicial;

    return {
      stockInicial,
      stockActual,
      stockViveroSeleccionado,
      totalLotes,
      entradasVMA,
      salidasViveros,
      trasladosPendientes,
      salidasEECC,
      bajas,
      transformaciones,
    };
  }, [kpis, vivero, lotes, movimientos]);

  const stockPorVivero = useMemo(() => {
    const data: Record<string, number> = {};
    lotesFiltrados.forEach((l) => {
      const v = txt(l.Vivero) || 'Sin vivero';
      data[v] = (data[v] || 0) + n(l.CantidadInicialP);
    });

    return Object.entries(data)
      .map(([name, value]) => ({ name: short(name, 14), fullName: name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [lotesFiltrados]);

  const stockPorEspecie = useMemo(() => {
    const data: Record<string, number> = {};
    lotesFiltrados.forEach((l) => {
      const e = txt(l.EspecieMaterial) || 'Sin especie';
      data[e] = (data[e] || 0) + n(l.CantidadInicialP);
    });

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [lotesFiltrados]);

  const stockPorContrato = useMemo(() => {
    const data: Record<string, { contrato: string; empresa: string; movimientos: number }> = {};

    movimientosFiltrados.forEach((m) => {
      const c = txt(m.Contrato_Final || m.Contrato) || 'Sin contrato';
      const e = txt(m.Empresa_EECC_Final || m.Empresa_EECC) || '-';

      if (!data[c]) data[c] = { contrato: c, empresa: e, movimientos: 0 };
      data[c].movimientos += n(m.Cantidad);
    });

    return Object.values(data).sort((a, b) => b.movimientos - a.movimientos).slice(0, 5);
  }, [movimientosFiltrados]);

  const maxContrato = Math.max(...stockPorContrato.map((x) => x.movimientos), 1);
  const totalEspecies = stockPorEspecie.reduce((s, x) => s + x.value, 0);

  if (loading || !kpis) {
    return (
      <main className="min-h-screen bg-[#f7f9f6] p-8 font-bold text-[#14532d]">
        Cargando SITRAP...
      </main>
    );
  }

  return (
    <>
      <main className="block min-h-screen bg-[#f7f9f6] text-slate-900 lg:hidden">
        <section className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-5 pt-4">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <Image
                  src="/sitrap-app-icon.png.png"
                  alt="SITRAP"
                  width={54}
                  height={54}
                  className="h-14 w-14 object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-[22px] font-black leading-none text-[#14532d]">SITRAP</h1>
                <p className="mt-1 text-[12px] font-semibold text-slate-500">Operación en terreno</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm ring-1 ring-slate-100">
              <p className="text-[9px] font-bold text-slate-400">Actualizado</p>
              <p className="text-[11px] font-black text-[#14532d]">
                {new Date(kpis.fechaActualizacion || kpis.fecha_actualizacion).toLocaleDateString('es-CL')}
              </p>
            </div>
          </header>

          <section className="mb-4 rounded-[28px] bg-gradient-to-br from-[#14532d] via-[#166534] to-[#0b3d22] p-5 text-white shadow-lg">
            <p className="text-[12px] font-bold text-green-100">Stock actual del sistema</p>
            <p className="mt-2 text-[38px] font-black leading-none tracking-tight">{fmt(calc.stockActual)}</p>
            <p className="mt-1 text-[13px] font-semibold text-green-100">plantas disponibles</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="text-[10px] font-bold text-green-100">Stock inicial</p>
                <p className="mt-1 text-[17px] font-black">{fmt(calc.stockInicial)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="text-[10px] font-bold text-green-100">Lotes</p>
                <p className="mt-1 text-[17px] font-black">{fmt(calc.totalLotes)}</p>
              </div>
            </div>
          </section>

          <section className="mb-4 space-y-2.5">
            <MobileAction
  title="Escanear QR"
  subtitle="Abrir cámara y leer QR de bandeja"
  icon={ScanLine}
  onClick={() => {
    window.location.href = '/scan';
  }}
/>

            <MobileAction
              title="Codificar lote"
              subtitle="Abrir formulario E1 de alta de lote"
              icon={Tag}
              href={FORM_E1_LOTES}
            />

            <MobileAction
  title="Consultar lote"
  subtitle="Buscar lote y abrir ficha corta/larga"
  icon={PackageCheck}
  onClick={() => {
    window.location.href = '/consultar-lote';
  }}
/>
<MobileAction
  title="Reimprimir etiqueta"
  subtitle="Buscar lote y volver a imprimir QR"
  icon={Tag}
  onClick={() => {
    window.location.href = '/consultar-lote';
  }}
/>
            <MobileAction
              title="Ticket despacho"
              subtitle="Abrir último ticket generado"
              icon={FileText}
              onClick={() => {
                window.location.href = '/ticket-despacho';
              }}
            />
          </section>

          <section className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[16px] font-black text-[#14532d]">KPIs rápidos</h2>
              <span className="text-[11px] font-bold text-slate-400">V5.3 Mobile</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <MobileMiniKpi label="Entradas VMA" value={calc.entradasVMA} />
              <MobileMiniKpi label="Salidas viveros" value={calc.salidasViveros} />
              <MobileMiniKpi label="Despachos EECC" value={calc.salidasEECC} />
              <MobileMiniKpi label="Pendientes" value={calc.trasladosPendientes} tone="warn" />
            </div>
          </section>

          <section className="mt-auto rounded-2xl border border-green-100 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#14532d]">
              <AlertTriangle size={16} className="text-amber-600" />
              <div>
                <p className="text-[12px] font-black">Traslados pendientes</p>
                <p className="text-[11px] text-slate-500">
                  {fmt(calc.trasladosPendientes)} plantas despachadas aún no recepcionadas.
                </p>
              </div>
            </div>
          </section>
        </section>
      </main>

      <main className="hidden h-screen overflow-hidden bg-[#f7f9f6] text-slate-900 lg:block">
        <div className="grid h-[calc(100vh-2rem)] grid-cols-1 lg:grid-cols-[205px_1fr]">
          <aside className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden border-r border-slate-200 bg-white px-2.5 py-1">
            <div className="h-[178px] flex items-start justify-center pt-2">
              <Image
                src="/sitrap-logo.png"
                alt="SITRAP"
                width={145}
                height={105}
                className="object-contain"
                priority
              />
            </div>

            <div>
              <SidebarTitle>Inicio</SidebarTitle>

              <nav className="space-y-0 text-[10px]">

  <Link
    href="/"
    className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 font-bold text-[#14532d]"
  >
    <HomeIcon size={11} />
    Inicio
  </Link>

  <Link
    href="/inventario"
    className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 font-semibold text-slate-700 hover:text-[#14532d]"
  >
    <Boxes size={11} />
    Inventario
  </Link>

  <Link
    href="/movimientos"
    className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 font-semibold text-slate-700 hover:text-[#14532d]"
  >
    <ArrowLeftRight size={11} />
    Movimientos
  </Link>

  <Link
    href="/contratos"
    className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 font-semibold text-slate-700 hover:text-[#14532d]"
  >
    <ClipboardList size={11} />
    Contratos
  </Link>

  <Link
    href="/dashboard"
    className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 font-semibold text-slate-700 hover:text-[#14532d]"
  >
    <BarChart3 size={11} />
    Dashboard
  </Link>

</nav>

              <div className="mt-1">
                <SidebarTitle>Acciones rápidas</SidebarTitle>

                <div className="space-y-0.5">
                  <a
                    href={FORM_E1_LOTES}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir Formulario E1: Codificación de lotes"
                    className="flex items-center justify-between rounded-md border border-green-200 bg-white px-2 py-0.5 text-[8.5px] font-bold text-[#14532d]"
                  >
                    Codificar Lote <ExternalLink size={9} />
                  </a>
                  <a
                    href={FORM_E2_MOVIMIENTOS}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir Formulario E2: Movimientos de lotes"
                    className="flex items-center justify-between rounded-md border border-green-200 bg-white px-2 py-0.5 text-[8.5px] font-bold text-[#14532d]"
                  >
                    Registrar Movimiento <ExternalLink size={9} />
                  </a>
                  <Link
  href="/consultar-lote"
  title="Buscar lote existente para reimprimir etiqueta QR"
  className="flex items-center justify-between rounded-md border border-green-200 bg-white px-2 py-0.5 text-[8.5px] font-bold text-[#14532d]"
>
  Reimprimir etiqueta <Tag size={9} />
</Link>
                </div>
              </div>

              <div className="mt-1">
                <SidebarTitle>
                  <span className="flex items-center gap-1.5">
                    <Filter size={9} />
                    Filtros rápidos
                  </span>
                </SidebarTitle>

                <div className="space-y-0.5">
                  <SelectFilter label="Vivero" value={vivero} options={options.viveros} onChange={setVivero} />
                  <SelectFilter label="Especie" value={especie} options={options.especies} onChange={setEspecie} />
                  <SelectFilter label="Contrato" value={contrato} options={options.contratos} onChange={setContrato} />
                  <SelectFilter label="Empresa / EECC" value={empresa} options={options.empresas} onChange={setEmpresa} />
                  <SelectFilter label="Fecha" value={fecha} options={options.fechas} onChange={setFecha} />

                  <button
                    onClick={() => {
                      setVivero('');
                      setEspecie('');
                      setContrato('');
                      setEmpresa('');
                      setFecha('');
                    }}
                    className="flex w-full items-center justify-center gap-1 rounded-md border border-green-200 px-2 py-0.5 text-[9px] font-bold text-[#14532d] hover:bg-green-50"
                  >
                    <RotateCcw size={9} />
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden p-3 pb-0">
            <header className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-black leading-tight text-[#14532d]">Bienvenido a SITRAP</h1>
                <p className="mt-0.5 text-xs text-slate-600">
                  Resumen ejecutivo de inventario y trazabilidad de plantas
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-[#14532d] shadow-sm">
                <CalendarClock size={16} />
                <div>
                  <p className="text-[9px] text-slate-500">Última actualización</p>
                  <p className="text-xs font-black">
                    {fmtDate(kpis.fechaActualizacion || kpis.fecha_actualizacion)}
                  </p>
                </div>
              </div>
            </header>

            <div className="mb-2 grid gap-2 xl:grid-cols-[1fr_1.08fr_0.98fr]">
              <div className="h-[290px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <SectionHeader title="Stock por Vivero" action="Stock actual" />
                <div className="h-[248px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={stockPorVivero} margin={{ top: 8, right: 2, bottom: 26, left: 18 }} barCategoryGap="4%" barGap={2}>
                      <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} height={34} tickLine={false} angle={0} textAnchor="middle" />
                      <YAxis width={42} tick={{ fontSize: 8 }} tickLine={false} axisLine={false} tickMargin={4} />
                      <Tooltip formatter={(v: any) => fmt(v)} labelFormatter={(_, payload: any) => payload?.[0]?.payload?.fullName || ''} />
                      <Bar dataKey="value" fill={GREEN} radius={[7, 7, 0, 0]} maxBarSize={72} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="h-[290px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <SectionHeader title="Stock por Especie" />
                <div className="grid h-[245px] grid-cols-[150px_minmax(0,1fr)] items-center gap-2">
                  <div className="relative h-[145px] w-[145px] min-w-[145px] overflow-visible">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 14, right: 14, bottom: 14, left: 14 }}>
                        <Pie data={stockPorEspecie} dataKey="value" nameKey="name" innerRadius={36} outerRadius={52} paddingAngle={2}>
                          {stockPorEspecie.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => fmt(v)} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-sm font-black text-[#14532d]">{fmt(calc.stockActual)}</p>
                      <p className="text-[9px] text-slate-500">plantas</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 overflow-hidden pr-1">
                    {stockPorEspecie.map((e, i) => {
                      const pct = totalEspecies ? (e.value / totalEspecies) * 100 : 0;
                      return (
                        <div key={e.name} className="grid grid-cols-[8px_minmax(0,1fr)_32px_46px] items-center gap-1.5 text-[9.3px]">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="truncate text-slate-700" title={e.name}>{short(e.name, 15)}</span>
                          <span className="font-semibold text-slate-700">{pct.toFixed(1)}%</span>
                          <span className="text-right font-black text-[#14532d]">{fmt(e.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="h-[290px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <SectionHeader title="Indicadores Clave (KPI)" />
                <div className="grid gap-1.5">
                  <CompactKpi title="Stock General Inicial" value={calc.stockInicial} subtitle="plantas registradas" icon={Boxes} />
                  <CompactKpi title="Stock General Actual" value={calc.stockActual} subtitle="plantas disponibles" icon={PackageCheck} />
                  <CompactKpi title="Stock por Vivero (según filtro)" value={calc.stockViveroSeleccionado} subtitle="plantas" icon={Warehouse} />
                  <CompactKpi title="Lotes Registrados" value={calc.totalLotes} subtitle="registros filtrados" icon={Tag} />
                  <CompactKpi title="Entradas VMA" value={calc.entradasVMA} subtitle="plantas" icon={PackagePlus} />
                </div>
              </div>
            </div>

            <div className="grid flex-1 gap-2 xl:grid-cols-[1fr_1.08fr_0.98fr]">
              <div className="h-[230px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <SectionHeader title="Resumen por Contrato" action="Ver todos" />
                <table className="w-full text-[10px]">
                  <thead className="uppercase text-slate-500">
                    <tr>
                      <th className="py-1 text-left">Contrato</th>
                      <th className="py-1 text-left">Empresa / EECC</th>
                      <th className="py-1 text-left">Avance</th>
                      <th className="py-1 text-right">Mov.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockPorContrato.map((r, i) => {
                      const pct = Math.round((r.movimientos / maxContrato) * 100);
                      return (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="py-1 font-black text-[#14532d]">{r.contrato}</td>
                          <td className="py-1 text-slate-600">{r.empresa}</td>
                          <td className="min-w-[100px] py-1">
                            <div className="h-2 rounded-full bg-slate-100">
                              <div className="h-2 rounded-full bg-[#166534]" style={{ width: `${Math.max(pct, 5)}%` }} />
                            </div>
                          </td>
                          <td className="py-1 text-right font-black">{fmt(r.movimientos)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="h-[230px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <SectionHeader title="Alertas SITRAP" action="Ver todas" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2.5">
                    <AlertTriangle className="text-amber-600" size={14} />
                    <div>
                      <p className="text-[10px] font-black">Traslados pendientes</p>
                      <p className="text-[9px] text-slate-500">{fmt(calc.trasladosPendientes)} plantas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-2.5">
                    <AlertTriangle className="text-red-600" size={14} />
                    <div>
                      <p className="text-[10px] font-black">Bajas / pérdidas</p>
                      <p className="text-[9px] text-slate-500">{fmt(calc.bajas)} plantas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md bg-green-50 p-2.5">
                    <SearchCheck className="text-[#166534]" size={14} />
                    <div>
                      <p className="text-[10px] font-black">Lotes registrados</p>
                      <p className="text-[9px] text-slate-500">{fmt(calc.totalLotes)} registros</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[230px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <SectionHeader title="Indicadores Operacionales" />
                <div className="grid gap-1.5">
                  <CompactKpi title="Salidas Viveros" value={calc.salidasViveros} subtitle="plantas" icon={PackageMinus} />
                  <CompactKpi title="Despachos EECC" value={calc.salidasEECC} subtitle="plantas" icon={Truck} />
                  <CompactKpi title="Transformaciones" value={calc.transformaciones} subtitle="plantas" icon={RefreshCw} />
                  <CompactKpi title="Traslados Pendientes" value={calc.trasladosPendientes} subtitle="plantas" icon={Warehouse} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="flex h-8 w-full items-center justify-center bg-[#14532d] px-4 text-[11px] font-semibold text-white">
          <span>SITRAP · Sistema de Inventario y Trazabilidad de Plantas</span>
          <span className="absolute right-4">Versión 5.3</span>
        </footer>
      </main>
    </>
  );
}
