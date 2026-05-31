'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Home as HomeIcon, Boxes, PackageCheck, PackagePlus, PackageMinus, Truck,
  Warehouse, CalendarClock, RefreshCw, ClipboardList, ArrowLeftRight, BarChart3,
  Filter, AlertTriangle, ExternalLink, RotateCcw, SearchCheck, Tag,
} from 'lucide-react';

type Kpis = Record<string, any>;
type Lote = Record<string, any>;
type Movimiento = Record<string, any>;

const API = '/api/sitrap';
const GREEN = '#166534';
const GREEN_DARK = '#14532d';
const COLORS = ['#166534', '#2f7d32', '#66a867', '#a7c8aa', '#cfd8dc'];

const n = (v: any) => {
  if (v === null || v === undefined || v === '') return 0;
  const x = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(x) ? 0 : x;
};

const txt = (v: any) => String(v || '').trim();
const fmt = (v: any) => new Intl.NumberFormat('es-CL').format(n(v));

function KpiCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex items-center gap-3 min-h-[92px]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#166534]">
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700 leading-tight">{title}</p>
        <p className="mt-1 text-2xl font-black text-[#14532d] leading-none">{fmt(value)}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function MiniKpi({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-[#166534]">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-600">{title}</p>
        <p className="text-xl font-black text-[#14532d]">{fmt(value)}</p>
      </div>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-slate-600">{label}</label>
      <select
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none"
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
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-black text-[#14532d]">{title}</h2>
      {action && <span className="text-[11px] font-semibold text-[#166534]">{action}</span>}
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
    () => new Set(lotesFiltrados.map(l => txt(l.ID_Final_Lote))),
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

    movimientosFiltrados.forEach(m => {
      const subtipo = txt(m.Subtipo_Movimiento);
      const tipo = txt(m.Tipo_Evento);
      const cantidad = n(m.Cantidad);

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

      if (subtipo.includes('Baja') || txt(m.Afecta_Stock) === 'Resta') {
        bajas += cantidad;
      }

      if (tipo === 'Transformación' || subtipo.includes('Transform')) {
        transformaciones += cantidad;
      }
    });

    const trasladosPendientes = Math.max(salidasViveros - entradasVMA, 0);
    const stockActual = stockInicial + ingresos - egresos;

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

  const stockPorEspecie = useMemo(() => {
    const data: Record<string, number> = {};
    lotesFiltrados.forEach(l => {
      const e = txt(l.EspecieMaterial) || 'Sin especie';
      data[e] = (data[e] || 0) + n(l.CantidadInicialP);
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [lotesFiltrados]);

  const stockPorContrato = useMemo(() => {
    const data: Record<string, { contrato: string; empresa: string; stock: number; movimientos: number }> = {};

    movimientosFiltrados.forEach(m => {
      const c = txt(m.Contrato_Final || m.Contrato) || 'Sin contrato';
      const e = txt(m.Empresa_EECC_Final || m.Empresa_EECC) || '-';
      if (!data[c]) data[c] = { contrato: c, empresa: e, stock: 0, movimientos: 0 };
      data[c].movimientos += n(m.Cantidad);
    });

    return Object.values(data).sort((a, b) => b.movimientos - a.movimientos).slice(0, 5);
  }, [movimientosFiltrados]);

  const ultimosMovimientos = useMemo(() => {
    return [...movimientosFiltrados].slice(0, 5);
  }, [movimientosFiltrados]);

  const totalEspecies = stockPorEspecie.reduce((s, x) => s + x.value, 0);

  if (loading || !kpis) {
    return (
      <main className="min-h-screen bg-[#f7f9f6] p-8 text-[#14532d] font-bold">
        Cargando SITRAP...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_1fr]">
        <aside className="bg-white border-r border-slate-200 px-5 py-4 flex flex-col">
          <div className="mb-5">
            <Image
              src="/sitrap-logo.png"
              alt="SITRAP"
              width={130}
              height={90}
              className="object-contain"
            />
          </div>

          <nav className="space-y-1.5">
            <button className="flex w-full items-center gap-3 rounded-lg bg-[#14532d] px-3 py-2.5 text-left text-sm font-bold text-white">
              <HomeIcon size={16} /> Inicio
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <Boxes size={16} /> Inventario
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <ArrowLeftRight size={16} /> Movimientos
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <ClipboardList size={16} /> Contratos
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <BarChart3 size={16} /> Dashboard
            </button>
          </nav>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-[#14532d]">Acciones rápidas</p>

            <div className="space-y-2">
              <a href="#" className="flex items-center justify-between rounded-lg bg-[#166534] px-3 py-2.5 text-xs font-bold text-white">
                Codificar Lote <ExternalLink size={13} />
              </a>

              <a href="#" className="flex items-center justify-between rounded-lg border border-green-200 px-3 py-2.5 text-xs font-bold text-[#14532d]">
                Registrar Movimiento <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <Filter size={14} className="text-[#14532d]" />
              <p className="text-[11px] font-black uppercase tracking-wide text-[#14532d]">Filtros rápidos</p>
            </div>

            <div className="space-y-3">
              <SelectFilter label="Vivero" value={vivero} options={options.viveros} onChange={setVivero} />
              <SelectFilter label="Especie" value={especie} options={options.especies} onChange={setEspecie} />
              <SelectFilter label="Contrato" value={contrato} options={options.contratos} onChange={setContrato} />
              <SelectFilter label="Empresa / EECC" value={empresa} options={options.empresas} onChange={setEmpresa} />
              <SelectFilter label="Fecha" value={fecha} options={options.fechas} onChange={setFecha} />

              <button
                onClick={() => { setVivero(''); setEspecie(''); setContrato(''); setEmpresa(''); setFecha(''); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#14532d] hover:bg-green-50"
              >
                <RotateCcw size={13} /> Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-auto pt-5 text-[11px] text-slate-400">
            SITRAP · Versión 3.1
          </div>
        </aside>

        <section className="p-5 lg:p-7">
          <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#14532d]">
                Bienvenido a SITRAP
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Resumen general de inventario y trazabilidad de plantas
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-slate-100 text-[#14532d]">
              <CalendarClock size={23} />
              <div>
                <p className="text-[11px] text-slate-500">Última actualización</p>
                <p className="text-sm font-bold">
                  {new Date(kpis.fecha_actualizacion).toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>
          </header>

          <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Stock General Inicial" value={calc.stockInicial} subtitle="plantas registradas" icon={Boxes} />
            <KpiCard title="Stock General Actual" value={calc.stockActual} subtitle="plantas disponibles" icon={PackageCheck} />
            <KpiCard title="Stock por Vivero" value={calc.stockViveroSeleccionado} subtitle="según filtro activo" icon={Warehouse} />
            <KpiCard title="Lotes Registrados" value={lotesFiltrados.length} subtitle="registros filtrados" icon={Tag} />
          </div>

          <div className="mb-5 grid gap-5 xl:grid-cols-[1.05fr_1fr]">
            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <SectionHeader title="Stock por Vivero" action="Stock actual" />
              <div className="h-60">
                <ResponsiveContainer>
                  <ReBarChart data={stockPorVivero}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Bar dataKey="value" fill={GREEN} radius={[7, 7, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <SectionHeader title="Stock por Especie" />
              <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-4">
                <div className="relative h-56">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stockPorEspecie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={56}
                        outerRadius={86}
                        paddingAngle={2}
                      >
                        {stockPorEspecie.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xl font-black text-[#14532d]">{fmt(calc.stockActual)}</p>
                    <p className="text-xs text-slate-500">plantas</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {stockPorEspecie.map((e, i) => {
                    const pct = totalEspecies ? (e.value / totalEspecies) * 100 : 0;
                    return (
                      <div key={e.name} className="grid grid-cols-[12px_1fr_auto_auto] items-center gap-2 text-xs">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="truncate text-slate-700">{e.name}</span>
                        <span className="font-semibold text-slate-700">{pct.toFixed(1)}%</span>
                        <span className="font-bold text-[#14532d]">{fmt(e.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 grid gap-4 xl:grid-cols-4">
            <MiniKpi title="Entradas VMA" value={calc.entradasVMA} icon={PackagePlus} />
            <MiniKpi title="Salidas Viveros" value={calc.salidasViveros} icon={PackageMinus} />
            <MiniKpi title="Despachos EECC" value={calc.salidasEECC} icon={Truck} />
            <MiniKpi title="Transformaciones" value={calc.transformaciones} icon={RefreshCw} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.8fr_1fr]">
            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 overflow-x-auto">
              <SectionHeader title="Resumen por Contrato" action="Ver todos" />
              <table className="w-full text-xs">
                <thead className="uppercase text-slate-500">
                  <tr>
                    <th className="py-2 text-left">Contrato</th>
                    <th className="py-2 text-left">Empresa / EECC</th>
                    <th className="py-2 text-right">Movimientos</th>
                  </tr>
                </thead>
                <tbody>
                  {stockPorContrato.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-2.5 font-bold text-[#14532d]">{r.contrato}</td>
                      <td className="py-2.5 text-slate-600">{r.empresa}</td>
                      <td className="py-2.5 text-right font-black">{fmt(r.movimientos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <SectionHeader title="Alertas SITRAP" action="Ver todas" />

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
                  <AlertTriangle className="text-amber-600" size={18} />
                  <div>
                    <p className="text-xs font-bold">Traslados pendientes</p>
                    <p className="text-xs text-slate-500">{fmt(calc.trasladosPendientes)} plantas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
                  <AlertTriangle className="text-red-600" size={18} />
                  <div>
                    <p className="text-xs font-bold">Bajas / pérdidas</p>
                    <p className="text-xs text-slate-500">{fmt(calc.bajas)} plantas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                  <SearchCheck className="text-[#166534]" size={18} />
                  <div>
                    <p className="text-xs font-bold">Lotes registrados</p>
                    <p className="text-xs text-slate-500">{fmt(lotesFiltrados.length)} registros</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 overflow-x-auto">
              <SectionHeader title="Últimos Movimientos" action="Ver todos" />

              <div className="space-y-3">
                {ultimosMovimientos.map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2.5 last:border-b-0">
                    <div>
                      <p className="text-xs font-bold text-[#14532d]">{m.Subtipo_Movimiento || 'Movimiento'}</p>
                      <p className="text-[11px] text-slate-500">
                        {m.Fecha_Movimiento ? new Date(m.Fecha_Movimiento).toLocaleDateString('es-CL') : '-'}
                      </p>
                      <p className="text-[11px] text-slate-400">{m.ID_Final_Lote}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs font-black">{fmt(m.Cantidad)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="mt-5 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
            SITRAP · Sistema de Inventario y Trazabilidad de Plantas
          </footer>
        </section>
      </div>
    </main>
  );
}
