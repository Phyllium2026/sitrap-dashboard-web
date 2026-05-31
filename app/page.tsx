'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Home as HomeIcon,
  Boxes,
  PackageCheck, PackagePlus, PackageMinus, Truck, Warehouse,
  CalendarClock, RefreshCw, ClipboardList, ArrowLeftRight, BarChart3,
  Filter, AlertTriangle, ExternalLink, RotateCcw, SearchCheck,
} from 'lucide-react';

type Kpis = Record<string, any>;
type Lote = Record<string, any>;
type Movimiento = Record<string, any>;

const API = '/api/sitrap';
const GREEN = '#166534';
const GREEN_DARK = '#14532d';
const BG = '#f6f8f5';

const n = (v: any) => {
  if (v === null || v === undefined || v === '') return 0;
  const x = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(x) ? 0 : x;
};

const txt = (v: any) => String(v || '').trim();
const fmt = (v: any) => new Intl.NumberFormat('es-CL').format(n(v));

function KpiCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-h-[118px]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#166534]">
        <Icon size={30} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="mt-1 text-3xl font-black text-[#14532d]">{fmt(value)}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <select
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
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
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-black text-[#14532d]">{title}</h2>
      {action && <span className="text-xs font-semibold text-[#166534]">{action}</span>}
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
      .slice(0, 6);
  }, [lotesFiltrados]);

  const stockPorContrato = useMemo(() => {
    const data: Record<string, { contrato: string; empresa: string; stock: number; movimientos: number }> = {};

    movimientosFiltrados.forEach(m => {
      const c = txt(m.Contrato_Final || m.Contrato) || 'Sin contrato';
      const e = txt(m.Empresa_EECC_Final || m.Empresa_EECC) || '-';
      if (!data[c]) data[c] = { contrato: c, empresa: e, stock: 0, movimientos: 0 };
      data[c].movimientos += n(m.Cantidad);
    });

    lotesFiltrados.forEach(l => {
      const c = txt(l.Contrato_Final || l.Contrato) || 'Sin contrato';
      if (!data[c]) data[c] = { contrato: c, empresa: '-', stock: 0, movimientos: 0 };
      data[c].stock += n(l.CantidadInicialP);
    });

    return Object.values(data).sort((a, b) => b.movimientos - a.movimientos).slice(0, 6);
  }, [movimientosFiltrados, lotesFiltrados]);

  const ultimosMovimientos = useMemo(() => {
    return [...movimientosFiltrados].slice(0, 6);
  }, [movimientosFiltrados]);

  if (loading || !kpis) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] p-8 text-[#14532d] font-bold">
        Cargando SITRAP...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="bg-white border-r border-slate-200 p-6 flex flex-col">
          <div className="mb-8">
            <Image
              src="/sitrap-logo.png"
              alt="SITRAP"
              width={160}
              height={120}
              className="object-contain"
            />
          </div>

          <nav className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-xl bg-[#14532d] px-4 py-3 text-left text-sm font-bold text-white">
              <HomeIcon size={18} /> Inicio
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <Boxes size={18} /> Inventario
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <ArrowLeftRight size={18} /> Movimientos
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <ClipboardList size={18} /> Contratos
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-green-50">
              <BarChart3 size={18} /> Dashboard
            </button>
          </nav>

          <div className="mt-8">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#14532d]">Acciones rápidas</p>

            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center justify-between rounded-xl bg-[#166534] px-4 py-3 text-sm font-bold text-white"
              >
                Codificar Lote <ExternalLink size={15} />
              </a>

              <a
                href="#"
                className="flex items-center justify-between rounded-xl border border-green-200 px-4 py-3 text-sm font-bold text-[#14532d]"
              >
                Registrar Movimiento <ExternalLink size={15} />
              </a>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <Filter size={16} className="text-[#14532d]" />
              <p className="text-xs font-black uppercase tracking-wide text-[#14532d]">Filtros rápidos</p>
            </div>

            <div className="space-y-4">
              <SelectFilter label="Vivero" value={vivero} options={options.viveros} onChange={setVivero} />
              <SelectFilter label="Especie" value={especie} options={options.especies} onChange={setEspecie} />
              <SelectFilter label="Contrato" value={contrato} options={options.contratos} onChange={setContrato} />
              <SelectFilter label="Empresa / EECC" value={empresa} options={options.empresas} onChange={setEmpresa} />
              <SelectFilter label="Fecha" value={fecha} options={options.fechas} onChange={setFecha} />

              <button
                onClick={() => { setVivero(''); setEspecie(''); setContrato(''); setEmpresa(''); setFecha(''); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#14532d] hover:bg-green-50"
              >
                <RotateCcw size={15} /> Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8 text-xs text-slate-400">
            SITRAP · Versión 3.0
          </div>
        </aside>

        <section className="p-6 lg:p-10">
          <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#14532d]">
                Bienvenido a SITRAP
              </h1>
              <p className="mt-1 text-slate-600">
                Resumen general de inventario y trazabilidad de plantas
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-100 text-[#14532d]">
              <CalendarClock size={28} />
              <div>
                <p className="text-xs text-slate-500">Última actualización</p>
                <p className="font-bold">
                  {new Date(kpis.fecha_actualizacion).toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>
          </header>

          <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Stock General Inicial" value={calc.stockInicial} subtitle="plantas registradas" icon={Boxes} />
            <KpiCard title="Stock General Actual" value={calc.stockActual} subtitle="plantas disponibles" icon={PackageCheck} />
            <KpiCard title="Stock por Vivero" value={calc.stockViveroSeleccionado} subtitle="según filtro activo" icon={Warehouse} />
            <KpiCard title="Traslados Pendientes" value={calc.trasladosPendientes} subtitle="plantas en tránsito" icon={Truck} />
          </div>

          <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <SectionHeader title="Stock por Vivero" action="Stock actual" />
              <div className="h-80">
                <ResponsiveContainer>
                  <ReBarChart data={stockPorVivero}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Bar dataKey="value" fill={GREEN} radius={[8, 8, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <SectionHeader title="Indicadores Operacionales" />
              <div className="grid gap-4 md:grid-cols-2">
                <KpiCard title="Entradas a VMA" value={calc.entradasVMA} subtitle="plantas" icon={PackagePlus} />
                <KpiCard title="Salidas de Viveros" value={calc.salidasViveros} subtitle="plantas" icon={PackageMinus} />
                <KpiCard title="Despachos EECC" value={calc.salidasEECC} subtitle="plantas" icon={Truck} />
                <KpiCard title="Transformaciones" value={calc.transformaciones} subtitle="plantas" icon={RefreshCw} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr_1fr]">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 overflow-x-auto">
              <SectionHeader title="Resumen por Contrato" action="Ver todos" />
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 text-left">Contrato</th>
                    <th className="py-3 text-left">Empresa / EECC</th>
                    <th className="py-3 text-right">Movimientos</th>
                  </tr>
                </thead>
                <tbody>
                  {stockPorContrato.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-3 font-bold text-[#14532d]">{r.contrato}</td>
                      <td className="py-3 text-slate-600">{r.empresa}</td>
                      <td className="py-3 text-right font-black">{fmt(r.movimientos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <SectionHeader title="Alertas SITRAP" action="Ver todas" />

              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
                  <AlertTriangle className="text-amber-600" size={20} />
                  <div>
                    <p className="text-sm font-bold">Traslados pendientes</p>
                    <p className="text-xs text-slate-500">{fmt(calc.trasladosPendientes)} plantas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3">
                  <AlertTriangle className="text-red-600" size={20} />
                  <div>
                    <p className="text-sm font-bold">Bajas / pérdidas</p>
                    <p className="text-xs text-slate-500">{fmt(calc.bajas)} plantas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3">
                  <SearchCheck className="text-[#166534]" size={20} />
                  <div>
                    <p className="text-sm font-bold">Lotes registrados</p>
                    <p className="text-xs text-slate-500">{fmt(lotesFiltrados.length)} registros</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 overflow-x-auto">
              <SectionHeader title="Últimos Movimientos" action="Ver todos" />

              <div className="space-y-4">
                {ultimosMovimientos.map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0">
                    <div>
                      <p className="text-sm font-bold text-[#14532d]">{m.Subtipo_Movimiento || 'Movimiento'}</p>
                      <p className="text-xs text-slate-500">
                        {m.Fecha_Movimiento ? new Date(m.Fecha_Movimiento).toLocaleDateString('es-CL') : '-'}
                      </p>
                      <p className="text-xs text-slate-400">{m.ID_Final_Lote}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-black">{fmt(m.Cantidad)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-400">
            SITRAP · Sistema de Inventario y Trazabilidad de Plantas
          </footer>
        </section>
      </div>
    </main>
  );
}
