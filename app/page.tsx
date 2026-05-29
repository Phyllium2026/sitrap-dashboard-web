'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Boxes, CalendarClock, PackageCheck, PackageMinus,
  PackagePlus, RefreshCw, Search, Truck, Warehouse,
} from 'lucide-react';

type Kpis = Record<string, any>;
type Lote = Record<string, any>;
type Movimiento = Record<string, any>;

const API = '/api/sitrap';
const GREEN = '#1f6b3a';
const GREEN_DARK = '#14532d';
const PALE = '#eef7ec';
const COLORS = ['#1f6b3a', '#4CAF50', '#86C65A', '#334155', '#9CA3AF'];

const n = (v: any) => {
  if (v === null || v === undefined || v === '') return 0;
  const x = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(x) ? 0 : x;
};

const txt = (v: any) => String(v || '').trim();
const fmt = (v: any) => new Intl.NumberFormat('es-CL').format(n(v));

function KpiCard({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-green-100 flex items-center gap-4 min-h-[105px]">
      <div className="text-[#1f6b3a]">
        <Icon size={42} strokeWidth={1.7} />
      </div>
      <div className="flex-1 text-center">
        <p className="text-xs font-bold uppercase text-[#1f6b3a]">{title}</p>
        <p className="mt-1 text-3xl font-bold text-[#1f6b3a]">{fmt(value)}</p>
        <p className="text-xs text-slate-500">Plantas</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: any) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="bg-white px-2 py-1 text-xl font-black uppercase text-[#1f6b3a]">
        {children}
      </div>
      <div className="h-px flex-1 bg-slate-400" />
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }: any) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border border-green-100">
      <label className="mb-1 block text-xs font-bold text-[#1f6b3a]">{label}</label>
      <select
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none"
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
  const [query, setQuery] = useState('');

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
    lotes.forEach(l => {
      const v = txt(l.Vivero) || 'Sin vivero';
      data[v] = (data[v] || 0) + n(l.CantidadInicialP);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [lotes]);

  const movimientosPorTipo = useMemo(() => {
    const data: Record<string, number> = {};
    movimientosFiltrados.forEach(m => {
      const tipo = txt(m.Subtipo_Movimiento) || 'Sin subtipo';
      data[tipo] = (data[tipo] || 0) + n(m.Cantidad);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [movimientosFiltrados]);

  const busqueda = useMemo(() => {
    const q = query.toUpperCase().trim();
    if (!q) return [];
    return lotes.filter(l =>
      [l.ID_Final_Lote, l.EspecieMaterial, l.Vivero, l.OrigenMaterial]
        .join(' ')
        .toUpperCase()
        .includes(q)
    ).slice(0, 6);
  }, [query, lotes]);

  if (loading || !kpis) {
    return <main className="min-h-screen bg-[#edf6eb] p-8 text-[#1f6b3a] font-bold">Cargando SITRAP...</main>;
  }

  return (
    <main className="min-h-screen bg-[#edf6eb]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[190px_1fr]">
        <aside className="bg-white p-4 border-r border-green-100">
       <Image
  <Image
  src="/sitrap-logo.png"
  alt="SITRAP"
  width={150}
  height={150}
  className="mx-auto mb-6 object-contain"
/>
  alt="SITRAP"
  width={120}
  height={120}
  className="mx-auto mb-4 object-contain"
/>
<div className="mb-6 space-y-2">
  <button className="w-full rounded-lg bg-[#14532d] px-3 py-2.5 text-left text-sm font-semibold text-white">
    Inicio
  </button>

  <button className="w-full rounded-lg border border-green-100 bg-white px-3 py-2.5 text-left text-sm font-semibold text-[#14532d]">
    Inventario
  </button>

  <button className="w-full rounded-lg border border-green-100 bg-white px-3 py-2.5 text-left text-sm font-semibold text-[#14532d]">
    Movimientos
  </button>

  <button className="w-full rounded-lg border border-green-100 bg-white px-3 py-2.5 text-left text-sm font-semibold text-[#14532d]">
    Dashboard
  </button>
</div>


          <div className="space-y-4">
            <SelectFilter label="Vivero" value={vivero} options={options.viveros} onChange={setVivero} />
            <SelectFilter label="EspecieMaterial" value={especie} options={options.especies} onChange={setEspecie} />
            <SelectFilter label="Contrato_Final" value={contrato} options={options.contratos} onChange={setContrato} />
            <SelectFilter label="Empresa / EECC" value={empresa} options={options.empresas} onChange={setEmpresa} />
            <SelectFilter label="Fecha_Registro" value={fecha} options={options.fechas} onChange={setFecha} />

            <button
              onClick={() => { setVivero(''); setEspecie(''); setContrato(''); setEmpresa(''); setFecha(''); }}
              className="w-full rounded-xl bg-[#1f6b3a] px-3 py-2 text-xs font-bold text-white"
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        <section className="p-5 lg:p-8">
          <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
  <div>
    <h1 className="text-5xl font-black text-[#14532d]">
      SITRAP
    </h1>

    <p className="mt-2 text-xl text-slate-600">
      Sistema de Inventario y Trazabilidad de Plantas
    </p>
  </div>

  <div className="rounded-xl bg-white px-5 py-4 shadow-sm flex items-center gap-3 text-[#1f6b3a]">
    <CalendarClock />
    <div>
      <p className="text-xs text-slate-500">Última actualización</p>
      <p className="font-bold">
        {new Date(kpis.fecha_actualizacion).toLocaleDateString('es-CL')}
      </p>
    </div>
  </div>
</header>

          <SectionTitle>Stock</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <KpiCard title="Stock general inicial" value={calc.stockInicial} icon={Boxes} />
            <KpiCard title="Stock general actual" value={calc.stockActual} icon={PackageCheck} />
            <KpiCard title="Stock por vivero seleccionado" value={calc.stockViveroSeleccionado} icon={Warehouse} />
          </div>

          <SectionTitle>Movimientos operacionales</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <KpiCard title="Entradas a VMA" value={calc.entradasVMA} icon={PackagePlus} />
            <KpiCard title="Salidas de viveros" value={calc.salidasViveros} icon={PackageMinus} />
            <KpiCard title="Traslados pendientes" value={calc.trasladosPendientes} icon={Truck} />
          </div>

          <SectionTitle>Movimientos del sistema</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <KpiCard title="Despachos a EECC" value={calc.salidasEECC} icon={Truck} />
            <KpiCard title="Bajas / pérdidas" value={calc.bajas} icon={PackageMinus} />
            <KpiCard title="Transformaciones lote" value={calc.transformaciones} icon={RefreshCw} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2 mb-8">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-black text-[#14532d]">Stock por vivero</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={stockPorVivero}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Bar dataKey="value" fill={GREEN} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-black text-[#14532d]">Movimientos por subtipo</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={movimientosPorTipo} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                      {movimientosPorTipo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-black text-[#14532d]"><Search size={18} /> Buscador de lote</h2>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar lote, especie, vivero..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
              <div className="mt-4 space-y-2">
                {busqueda.map(l => (
                  <div key={l.ID_Final_Lote} className="rounded-xl bg-[#edf6eb] p-3 text-sm">
                    <p className="font-bold text-[#14532d]">{l.ID_Final_Lote}</p>
                    <p>{l.EspecieMaterial}</p>
                    <p className="text-xs text-slate-500">{l.Vivero}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm overflow-x-auto">
              <h2 className="mb-4 font-black text-[#14532d]">Últimos movimientos</h2>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 text-left">Fecha</th>
                    <th className="py-2 text-left">Lote</th>
                    <th className="py-2 text-left">Movimiento</th>
                    <th className="py-2 text-left">Origen</th>
                    <th className="py-2 text-left">Destino</th>
                    <th className="py-2 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosFiltrados.slice(0, 12).map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2">{m.Fecha_Movimiento ? new Date(m.Fecha_Movimiento).toLocaleDateString('es-CL') : '-'}</td>
                      <td className="py-2 font-semibold">{m.ID_Final_Lote}</td>
                      <td className="py-2">{m.Subtipo_Movimiento}</td>
                      <td className="py-2">{m.Origen}</td>
                      <td className="py-2">{m.Destino}</td>
                      <td className="py-2 text-right font-bold">{fmt(m.Cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
