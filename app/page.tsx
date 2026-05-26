'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Activity, Boxes, ClipboardList, PackageCheck, Search, Truck, Warehouse } from 'lucide-react';

type Kpis = {
  ok: boolean;
  fecha_actualizacion: string;
  stock_inicial: number;
  salidas_origen: number;
  ingresos_destino: number;
  movimientos_netos_viveros: number;
  stock_actual_viveros: number;
  despachos_a_vma: number;
  recepciones_vma: number;
  lotes_en_transito: number;
  salidas_eecc: number;
  devoluciones_eecc: number;
  ajustes_suma: number;
  ajustes_resta: number;
  stock_controlado_total: number;
  total_lotes: number;
  total_movimientos: number;
};

type Movimiento = Record<string, any>;
type Lote = Record<string, any>;

const formatNumber = (value: number | string | undefined) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat('es-CL').format(n);
};

const normalize = (value: any) => String(value || '').trim();

function KpiCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-sitrap-graphite">{formatNumber(value)}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className="rounded-2xl bg-sitrap-pale p-3 text-sitrap-dark">
          <Icon size={26} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [kpiRes, movRes, lotRes] = await Promise.all([
        fetch('/api/sitrap?view=kpis').then((r) => r.json()),
        fetch('/api/sitrap?view=movimientos').then((r) => r.json()),
        fetch('/api/sitrap?view=lotes').then((r) => r.json()),
      ]);
      setKpis(kpiRes);
      setMovimientos(Array.isArray(movRes) ? movRes : []);
      setLotes(Array.isArray(lotRes) ? lotRes : []);
      setLoading(false);
    }
    loadData();
  }, []);

  const movimientosPorTipo = useMemo(() => {
    const counts: Record<string, number> = {};
    movimientos.forEach((m) => {
      const tipo = normalize(m.Subtipo_Movimiento) || 'Sin subtipo';
      counts[tipo] = (counts[tipo] || 0) + Number(m.Cantidad || 0);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [movimientos]);

  const lotesPorCategoria = useMemo(() => {
    const counts: Record<string, number> = {};
    lotes.forEach((l) => {
      const categoria = normalize(l.Categoria_Lote) || 'Sin categoría';
      counts[categoria] = (counts[categoria] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [lotes]);

  const topEspecies = useMemo(() => {
    const sums: Record<string, number> = {};
    lotes.forEach((l) => {
      const especie = normalize(l.EspecieMaterial) || 'Sin especie';
      sums[especie] = (sums[especie] || 0) + Number(l.CantidadInicialP || 0);
    });
    return Object.entries(sums)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [lotes]);

  const movimientosRecientes = useMemo(() => {
    return [...movimientos]
      .sort((a, b) => new Date(b.Timestamp || 0).getTime() - new Date(a.Timestamp || 0).getTime())
      .slice(0, 10);
  }, [movimientos]);

  const resultadosBusqueda = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return [];
    return lotes
      .filter((l) =>
        [l.ID_Final_Lote, l.EspecieMaterial, l.Vivero, l.OrigenMaterial]
          .join(' ')
          .toUpperCase()
          .includes(q)
      )
      .slice(0, 8);
  }, [lotes, query]);

  const stockData = kpis
    ? [
        { name: 'Actual viveros', value: kpis.stock_actual_viveros },
        { name: 'En tránsito', value: kpis.lotes_en_transito },
        { name: 'Controlado', value: kpis.stock_controlado_total },
      ]
    : [];

  const chartColors = ['#2E7D32', '#4CAF50', '#86C65A', '#1E1E1E', '#9CA3AF', '#D9E8D9'];

  return (
    <main className="min-h-screen bg-[#f6f8f6] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Image src="/phyllium-logo.jpg" alt="Phyllium Consultores" width={165} height={70} className="rounded-xl object-contain" />
              <div className="hidden h-12 w-px bg-slate-200 md:block" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sitrap-dark">SITRAP Web Dashboard</p>
                <h1 className="text-2xl font-bold text-sitrap-graphite md:text-3xl">Inventario y Trazabilidad de Plantas</h1>
                <p className="text-sm text-slate-500">Dashboard operativo conectado a Forms + Sheets mediante API Apps Script</p>
              </div>
            </div>
            <Image src="/sitrap-logo.png" alt="Logo SITRAP" width={130} height={130} className="object-contain" />
          </div>
        </header>

        {loading || !kpis ? (
          <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">Cargando datos SITRAP...</div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard title="Stock controlado total" value={kpis.stock_controlado_total} subtitle="Viveros + tránsito" icon={PackageCheck} />
              <KpiCard title="Stock actual en viveros" value={kpis.stock_actual_viveros} subtitle="Existencia física disponible" icon={Warehouse} />
              <KpiCard title="Lotes en tránsito" value={kpis.lotes_en_transito} subtitle="Despachados no recepcionados" icon={Truck} />
              <KpiCard title="Lotes codificados" value={kpis.total_lotes} subtitle="BD_SITRAP_LOTES" icon={Boxes} />
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-sitrap-graphite">Stock operacional</h2>
                  <span className="text-xs text-slate-400">Actualización: {new Date(kpis.fecha_actualizacion).toLocaleString('es-CL')}</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v: any) => formatNumber(v)} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#2E7D32" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <h2 className="mb-4 text-lg font-bold text-sitrap-graphite">Movimientos por subtipo</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={movimientosPorTipo} dataKey="value" nameKey="name" outerRadius={95} innerRadius={55}>
                        {movimientosPorTipo.map((_, index) => (
                          <Cell key={index} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatNumber(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <h2 className="mb-4 text-lg font-bold text-sitrap-graphite">Top especies por stock inicial</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topEspecies} layout="vertical" margin={{ left: 90 }}>
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip formatter={(v: any) => formatNumber(v)} />
                      <Bar dataKey="value" fill="#4CAF50" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <h2 className="mb-4 text-lg font-bold text-sitrap-graphite">Lotes por categoría</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lotesPorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2E7D32" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 lg:col-span-1">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-sitrap-graphite"><Search size={20} /> Buscador de lote</h2>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sitrap-green"
                  placeholder="Buscar ID, especie, vivero u origen..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="mt-4 space-y-3">
                  {resultadosBusqueda.map((l) => (
                    <div key={l.ID_Final_Lote} className="rounded-xl bg-sitrap-pale p-3 text-sm">
                      <p className="font-bold text-sitrap-graphite">{l.ID_Final_Lote}</p>
                      <p className="text-slate-600">{l.EspecieMaterial}</p>
                      <p className="text-xs text-slate-500">{l.Vivero} · {l.OrigenMaterial}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 lg:col-span-2">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-sitrap-graphite"><Activity size={20} /> Últimos movimientos registrados</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-slate-500">
                      <tr>
                        <th className="py-2">Fecha</th>
                        <th className="py-2">Lote</th>
                        <th className="py-2">Subtipo</th>
                        <th className="py-2">Origen</th>
                        <th className="py-2">Destino</th>
                        <th className="py-2 text-right">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosRecientes.map((m, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="py-2 text-slate-600">{m.Fecha_Movimiento ? new Date(m.Fecha_Movimiento).toLocaleDateString('es-CL') : '-'}</td>
                          <td className="py-2 font-medium text-sitrap-graphite">{m.ID_Final_Lote}</td>
                          <td className="py-2">{m.Subtipo_Movimiento}</td>
                          <td className="py-2 text-slate-600">{m.Origen}</td>
                          <td className="py-2 text-slate-600">{m.Destino}</td>
                          <td className="py-2 text-right font-semibold">{formatNumber(m.Cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <footer className="pb-6 text-center text-xs text-slate-400">
              SITRAP · Sistema de Inventario y Trazabilidad de Plantas · Colaboración Phyllium Consultores
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
