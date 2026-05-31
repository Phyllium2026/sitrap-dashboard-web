'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Home as HomeIcon, Boxes, PackageCheck, PackagePlus, PackageMinus, Truck,
  Warehouse, CalendarClock, RefreshCw, ClipboardList, ArrowLeftRight,
  Filter, AlertTriangle, ExternalLink, RotateCcw, SearchCheck, Tag,
  ShieldCheck, Gauge, FileWarning, CheckCircle2,
} from 'lucide-react';

type Kpis = Record<string, any>;
type Lote = Record<string, any>;
type Movimiento = Record<string, any>;

const API = '/api/sitrap';
const GREEN = '#166534';

const n = (v: any) => {
  if (v === null || v === undefined || v === '') return 0;
  const x = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(x) ? 0 : x;
};

const txt = (v: any) => String(v || '').trim();
const fmt = (v: any) => new Intl.NumberFormat('es-CL').format(n(v));

function KpiCard({ title, value, subtitle, icon: Icon, tone = 'green' }: any) {
  const toneClass = tone === 'amber'
    ? 'bg-amber-50 text-amber-700'
    : tone === 'red'
      ? 'bg-red-50 text-red-700'
      : 'bg-green-50 text-[#166534]';

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-100 flex items-center gap-3 min-h-[78px]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
        <Icon size={21} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-700 leading-tight">{title}</p>
        <p className="mt-0.5 text-xl font-black text-[#14532d] leading-none">{fmt(value)}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function MiniKpi({ title, value, icon: Icon, tone = 'green' }: any) {
  const toneClass = tone === 'amber'
    ? 'bg-amber-50 text-amber-700'
    : tone === 'red'
      ? 'bg-red-50 text-red-700'
      : 'bg-green-50 text-[#166534]';

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-2.5 flex items-center gap-2.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${toneClass}`}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-600">{title}</p>
        <p className="text-lg font-black text-[#14532d] leading-none">{fmt(value)}</p>
      </div>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold text-slate-600">{label}</label>
      <select
        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todas</option>
        {options.map((x: string) => (
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
    </div>
  );
}

function SectionHeader({ title, action }: any) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-sm font-black text-[#14532d]">{title}</h2>
      {action && <span className="text-[10px] font-semibold text-[#166534]">{action}</span>}
    </div>
  );
}

function ProgressBar({ value, max }: any) {
  const pct = max > 0 ? Math.round((n(value) / max) * 100) : 0;
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-[#166534]"
        style={{ width: `${Math.max(Math.min(pct, 100), value > 0 ? 5 : 0)}%` }}
      />
    </div>
  );
}

function StatusBox({ title, value, subtitle, status }: any) {
  const styles: Record<string, string> = {
    ok: 'bg-green-50 text-[#166534] border-green-100',
    warn: 'bg-amber-50 text-amber-700 border-amber-100',
    bad: 'bg-red-50 text-red-700 border-red-100',
  };
  const Icon = status === 'ok' ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`rounded-lg border p-2.5 ${styles[status] || styles.ok}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-black">{title}</p>
          <p className="text-lg font-black leading-none mt-1">{fmt(value)}</p>
          <p className="text-[10px] opacity-80 mt-1">{subtitle}</p>
        </div>
        <Icon size={18} />
      </div>
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
        fetch(`${API}?view=kpis`).then(r => r.json()),
        fetch(`${API}?view=lotes`).then(r => r.json()),
        fetch(`${API}?view=movimientos`).then(r => r.json()),
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
      viveros: uniq(lotes.map(x => txt(x.Vivero))),
      especies: uniq(lotes.map(x => txt(x.EspecieMaterial))),
      contratos: uniq(movimientos.map(x => txt(x.Contrato_Final || x.Contrato))),
      empresas: uniq(movimientos.map(x => txt(x.Empresa_EECC_Final || x.Empresa_EECC))),
      fechas: ['Últimos 30 días', 'Últimos 90 días', 'Año 2026'],
    };
  }, [lotes, movimientos]);

  const lotesFiltrados = useMemo(() => {
    return lotes.filter(l => {
      if (vivero && txt(l.Vivero) !== vivero) return false;
      if (especie && txt(l.EspecieMaterial) !== especie) return false;
      return true;
    });
  }, [lotes, vivero, especie]);

  const idsFiltrados = useMemo(
    () => new Set(lotesFiltrados.map(l => txt(l.ID_Final_Lote)).filter(Boolean)),
    [lotesFiltrados]
  );

  const movimientosFiltrados = useMemo(() => {
    const now = new Date();

    return movimientos.filter(m => {
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
          const lim = new Date(now); lim.setDate(now.getDate() - 30);
          if (f < lim) return false;
        }

        if (fecha === 'Últimos 90 días') {
          const lim = new Date(now); lim.setDate(now.getDate() - 90);
          if (f < lim) return false;
        }

        if (fecha === 'Año 2026' && f.getFullYear() !== 2026) return false;
      }

      return true;
    });
  }, [movimientos, idsFiltrados, contrato, empresa, fecha, vivero]);

  const calc = useMemo(() => {
    const stockInicial = lotesFiltrados.reduce((s, l) => s + n(l.CantidadInicialP), 0);

    let entradasVMA = 0;
    let salidasViveros = 0;
    let salidasEECC = 0;
    let bajas = 0;
    let transformaciones = 0;
    let ingresos = 0;
    let egresos = 0;
    let devoluciones = 0;

    movimientosFiltrados.forEach(m => {
      const subtipo = txt(m.Subtipo_Movimiento);
      const tipo = txt(m.Tipo_Evento);
      const cantidad = n(m.Cantidad);
      const afecta = txt(m.Afecta_Stock);

      if (subtipo === 'Recepción en VMA' || subtipo === 'Ingreso a VMA' || subtipo === 'Ingreso a vivero') {
        entradasVMA += cantidad;
        ingresos += cantidad;
      }

      if (subtipo === 'Despacho a VMA' || subtipo === 'Traslado entre viveros') {
        salidasViveros += cantidad;
        egresos += cantidad;
      }

      if (subtipo === 'Salida a EECC') {
        salidasEECC += cantidad;
        egresos += cantidad;
      }

      if (subtipo.includes('Devolución')) {
        devoluciones += cantidad;
        ingresos += cantidad;
      }

      if (subtipo.includes('Baja') || afecta === 'Resta') {
        bajas += cantidad;
      }

      if (tipo === 'Transformación' || subtipo.includes('Transform')) {
        transformaciones += cantidad;
      }
    });

    const trasladosPendientes = Math.max(salidasViveros - entradasVMA, 0);
    const stockActual = stockInicial + ingresos - egresos - bajas;
    const diferenciaStock = Math.min(stockActual, 0);

    let stockViveroSeleccionado = stockActual;
    if (vivero) {
      const inicialVivero = lotesFiltrados.reduce((s, l) => s + n(l.CantidadInicialP), 0);
      let movVivero = 0;

      movimientosFiltrados.forEach(m => {
        const cantidad = n(m.Cantidad);
        const subtipo = txt(m.Subtipo_Movimiento);
        const origen = txt(m.Origen);
        const destino = txt(m.Destino);

        if (origen === vivero && ['Despacho a VMA', 'Traslado entre viveros', 'Salida a EECC'].includes(subtipo)) {
          movVivero -= cantidad;
        }

        if (destino === vivero && ['Recepción en VMA', 'Ingreso a VMA', 'Ingreso a vivero', 'Devolución desde EECC', 'Devolución'].includes(subtipo)) {
          movVivero += cantidad;
        }
      });

      stockViveroSeleccionado = inicialVivero + movVivero;
    }

    return {
      stockInicial,
      stockActual,
      stockViveroSeleccionado,
      entradasVMA,
      salidasViveros,
      trasladosPendientes,
      salidasEECC,
      bajas,
      transformaciones,
      devoluciones,
      diferenciaStock,
    };
  }, [lotesFiltrados, movimientosFiltrados, vivero]);

  const stockPorVivero = useMemo(() => {
    const data: Record<string, number> = {};
    lotesFiltrados.forEach(l => {
      const v = txt(l.Vivero) || 'Sin vivero';
      data[v] = (data[v] || 0) + n(l.CantidadInicialP);
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [lotesFiltrados]);

  const topEspecies = useMemo(() => {
    const data: Record<string, number> = {};
    lotesFiltrados.forEach(l => {
      const e = txt(l.EspecieMaterial) || 'Sin especie';
      data[e] = (data[e] || 0) + n(l.CantidadInicialP);
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [lotesFiltrados]);

  const stockPorContrato = useMemo(() => {
    const data: Record<string, { contrato: string; empresa: string; movimientos: number }> = {};

    movimientosFiltrados.forEach(m => {
      const c = txt(m.Contrato_Final || m.Contrato) || 'Sin contrato';
      const e = txt(m.Empresa_EECC_Final || m.Empresa_EECC) || '-';
      if (!data[c]) data[c] = { contrato: c, empresa: e, movimientos: 0 };
      data[c].movimientos += n(m.Cantidad);
    });

    return Object.values(data).sort((a, b) => b.movimientos - a.movimientos).slice(0, 5);
  }, [movimientosFiltrados]);

  const controlOperacional = useMemo(() => ([
    { name: 'Stock inicial', value: calc.stockInicial },
    { name: 'Ingresos VMA', value: calc.entradasVMA },
    { name: 'EECC', value: calc.salidasEECC },
    { name: 'Bajas', value: calc.bajas },
  ]), [calc]);

  const lotesConID = useMemo(() => lotesFiltrados.filter(l => txt(l.ID_Final_Lote)).length, [lotesFiltrados]);
  const lotesSinID = Math.max(lotesFiltrados.length - lotesConID, 0);
  const maxEspecie = Math.max(...topEspecies.map(x => x.value), 1);
  const maxContrato = Math.max(...stockPorContrato.map(x => x.movimientos), 1);
  const ultimosMovimientos = useMemo(() => [...movimientosFiltrados].slice(0, 5), [movimientosFiltrados]);

  if (loading || !kpis) {
    return (
      <main className="min-h-screen bg-[#f7f9f6] p-8 text-[#14532d] font-bold">
        Cargando SITRAP...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[190px_1fr]">
        <aside className="bg-white border-r border-slate-200 px-4 py-3 flex flex-col">
          <div className="mb-2">
            <Image
              src="/sitrap-logo.png"
              alt="SITRAP"
              width={96}
              height={62}
              className="object-contain"
            />
          </div>

          <nav className="space-y-1">
            <button className="flex w-full items-center gap-2 rounded-md bg-[#14532d] px-2.5 py-2 text-left text-xs font-bold text-white">
              <HomeIcon size={14} /> Inicio
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-green-50">
              <Boxes size={14} /> Inventario
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-green-50">
              <ArrowLeftRight size={14} /> Movimientos
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-green-50">
              <ClipboardList size={14} /> Contratos
            </button>
          </nav>

          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-[#14532d]">Acciones rápidas</p>
            <div className="space-y-1.5">
              <a href="#" className="flex items-center justify-between rounded-md bg-[#166534] px-2.5 py-2 text-[11px] font-bold text-white">
                Codificar Lote <ExternalLink size={12} />
              </a>
              <a href="#" className="flex items-center justify-between rounded-md border border-green-200 px-2.5 py-2 text-[11px] font-bold text-[#14532d]">
                Registrar Movimiento <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Filter size={12} className="text-[#14532d]" />
              <p className="text-[10px] font-black uppercase tracking-wide text-[#14532d]">Filtros rápidos</p>
            </div>

            <div className="space-y-2">
              <SelectFilter label="Vivero" value={vivero} options={options.viveros} onChange={setVivero} />
              <SelectFilter label="Especie" value={especie} options={options.especies} onChange={setEspecie} />
              <SelectFilter label="Contrato" value={contrato} options={options.contratos} onChange={setContrato} />
              <SelectFilter label="Empresa / EECC" value={empresa} options={options.empresas} onChange={setEmpresa} />
              <SelectFilter label="Fecha" value={fecha} options={options.fechas} onChange={setFecha} />

              <button
                onClick={() => { setVivero(''); setEspecie(''); setContrato(''); setEmpresa(''); setFecha(''); }}
                className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold text-[#14532d] hover:bg-green-50"
              >
                <RotateCcw size={12} /> Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-auto pt-2 text-[10px] text-slate-400">
            SITRAP · V3.5 Gestión
          </div>
        </aside>

        <section className="p-4 lg:p-5">
          <header className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-xl font-black text-[#14532d]">SITRAP · Dashboard de Gestión</h1>
              <p className="mt-0.5 text-xs text-slate-600">
                Control ejecutivo de stock, trazabilidad, contratos, EECC y movimientos críticos
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-slate-100 text-[#14532d]">
              <CalendarClock size={19} />
              <div>
                <p className="text-[10px] text-slate-500">Última actualización</p>
                <p className="text-xs font-bold">
                  {new Date(kpis.fecha_actualizacion).toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>
          </header>

          <div className="mb-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Stock General Actual" value={calc.stockActual} subtitle="plantas disponibles" icon={PackageCheck} />
            <KpiCard title="Entregado a EECC" value={calc.salidasEECC} subtitle="plantas despachadas" icon={Truck} />
            <KpiCard title="Traslados Pendientes" value={calc.trasladosPendientes} subtitle="salidas sin recepción" icon={AlertTriangle} tone={calc.trasladosPendientes > 0 ? 'amber' : 'green'} />
            <KpiCard title="Lotes Registrados" value={lotesFiltrados.length} subtitle="según filtros activos" icon={Tag} />
          </div>

          <div className="mb-3 grid gap-3 xl:grid-cols-[1fr_1fr_0.72fr]">
            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
              <SectionHeader title="Stock por Vivero" action="Top 5" />
              <div className="h-40">
                <ResponsiveContainer>
                  <ReBarChart
                    data={stockPorVivero}
                    margin={{ top: 5, right: 4, bottom: 0, left: -18 }}
                    barCategoryGap="24%"
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} />
                    <YAxis tick={{ fontSize: 8 }} width={36} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Bar dataKey="value" fill={GREEN} radius={[5, 5, 0, 0]} barSize={18} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
              <SectionHeader title="Top Especies por Stock" action="Prioridad operacional" />
              <div className="space-y-2">
                {topEspecies.map((e, i) => (
                  <div key={e.name} className="grid grid-cols-[18px_1fr_70px] items-center gap-2 text-[11px]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-[10px] font-black text-[#166534]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-slate-700">{e.name}</span>
                      </div>
                      <ProgressBar value={e.value} max={maxEspecie} />
                    </div>
                    <span className="text-right font-black text-[#14532d]">{fmt(e.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
              <SectionHeader title="Indicadores Operacionales" />
              <div className="grid gap-2">
                <MiniKpi title="Ingresos VMA" value={calc.entradasVMA} icon={PackagePlus} />
                <MiniKpi title="Salidas Viveros" value={calc.salidasViveros} icon={PackageMinus} />
                <MiniKpi title="Despachos EECC" value={calc.salidasEECC} icon={Truck} />
                <MiniKpi title="Transformaciones" value={calc.transformaciones} icon={RefreshCw} />
              </div>
            </div>
          </div>

          <div className="mb-3 grid gap-3 xl:grid-cols-[1fr_1fr_0.72fr]">
            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
              <SectionHeader title="Balance Operacional" action="Stock / ingresos / egresos" />
              <div className="h-36">
                <ResponsiveContainer>
                  <ReBarChart data={controlOperacional} margin={{ top: 5, right: 6, bottom: 0, left: -18 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} />
                    <YAxis tick={{ fontSize: 8 }} width={36} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Bar dataKey="value" fill={GREEN} radius={[5, 5, 0, 0]} barSize={20} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
              <SectionHeader title="Semáforo de Trazabilidad" action="Control de calidad del dato" />
              <div className="grid grid-cols-3 gap-2">
                <StatusBox title="Lotes con ID" value={lotesConID} subtitle="trazables" status="ok" />
                <StatusBox title="Sin ID" value={lotesSinID} subtitle="revisar" status={lotesSinID > 0 ? 'warn' : 'ok'} />
                <StatusBox title="Stock negativo" value={Math.abs(calc.diferenciaStock)} subtitle="diferencia" status={calc.diferenciaStock < 0 ? 'bad' : 'ok'} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniKpi title="Devoluciones" value={calc.devoluciones} icon={ShieldCheck} />
                <MiniKpi title="Bajas / pérdidas" value={calc.bajas} icon={FileWarning} tone={calc.bajas > 0 ? 'red' : 'green'} />
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
              <SectionHeader title="Stock Vivero Activo" action={vivero || 'Todos'} />
              <div className="flex h-36 flex-col items-center justify-center rounded-lg bg-green-50 text-center">
                <Warehouse className="mb-2 text-[#166534]" size={28} />
                <p className="text-3xl font-black text-[#14532d]">{fmt(calc.stockViveroSeleccionado)}</p>
                <p className="text-[11px] font-semibold text-slate-600">plantas según filtro de vivero</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#166534]">
                  <Gauge size={12} /> vista ejecutiva compacta
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100 overflow-x-auto">
              <SectionHeader title="Resumen por Contrato" action="Top 5 movimientos" />
              <table className="w-full text-[11px]">
                <thead className="uppercase text-slate-500">
                  <tr>
                    <th className="py-1.5 text-left">Contrato</th>
                    <th className="py-1.5 text-left">Empresa / EECC</th>
                    <th className="py-1.5 text-left">Avance</th>
                    <th className="py-1.5 text-right">Mov.</th>
                  </tr>
                </thead>
                <tbody>
                  {stockPorContrato.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-1.5 font-bold text-[#14532d]">{r.contrato}</td>
                      <td className="py-1.5 text-slate-600">{r.empresa}</td>
                      <td className="py-1.5 min-w-[110px]"><ProgressBar value={r.movimientos} max={maxContrato} /></td>
                      <td className="py-1.5 text-right font-black">{fmt(r.movimientos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100 overflow-x-auto">
              <SectionHeader title="Últimos Movimientos" action="Trazabilidad reciente" />

              <div className="space-y-2">
                {ultimosMovimientos.map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-b-0">
                    <div>
                      <p className="text-[11px] font-bold text-[#14532d]">{m.Subtipo_Movimiento || 'Movimiento'}</p>
                      <p className="text-[10px] text-slate-500">
                        {m.Fecha_Movimiento ? new Date(m.Fecha_Movimiento).toLocaleDateString('es-CL') : '-'} · {m.Origen || '-'} → {m.Destino || '-'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[220px]">{m.ID_Final_Lote}</p>
                    </div>
                    <p className="whitespace-nowrap text-[11px] font-black">{fmt(m.Cantidad)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
