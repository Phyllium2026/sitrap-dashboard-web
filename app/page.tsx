'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Home as HomeIcon,
  Boxes,
  PackageCheck,
  PackagePlus,
  PackageMinus,
  Truck,
  Warehouse,
  CalendarClock,
  RefreshCw,
  ClipboardList,
  ArrowLeftRight,
  BarChart3,
  Filter,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  SearchCheck,
  Tag,
} from 'lucide-react';

type Kpis = Record<string, any>;
type Lote = Record<string, any>;
type Movimiento = Record<string, any>;

const API = '/api/sitrap';
const GREEN = '#166534';
const COLORS = ['#166534', '#3f7f34', '#77a86c', '#adc7a7', '#d1d8dc'];

const n = (v: any) => {
  if (v === null || v === undefined || v === '') return 0;
  const x = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(x) ? 0 : x;
};

const txt = (v: any) => String(v || '').trim();

const fmt = (v: any) =>
  new Intl.NumberFormat('es-CL').format(n(v));

const short = (v: any, max = 18) => {
  const s = txt(v);
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
};

function SidebarTitle({ children }: any) {
  return (
    <div className="mb-1 rounded-md bg-[#14532d] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
      {children}
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="mb-0.5 block text-[7.5px] font-black uppercase tracking-wide text-[#14532d]">
        {label}
      </label>
      <select
        className="w-full rounded-md border border-green-200 bg-white px-2 py-1 text-[9.5px] font-semibold text-slate-800 outline-none focus:border-[#166534]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todas</option>
        {options.map((x: string) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionHeader({ title, action }: any) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[15px] font-black leading-none text-[#14532d]">
        {title}
      </h2>
      {action && (
        <span className="text-[9px] font-bold text-[#166534]">
          {action}
        </span>
      )}
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
          <p className="truncate text-[10px] font-black leading-tight text-slate-800">
            {title}
          </p>
          <p className="text-[8.5px] leading-tight text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <p className="pl-3 text-right text-[17px] font-black leading-none text-[#14532d]">
        {fmt(value)}
      </p>
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
    const uniq = (arr: string[]) =>
      Array.from(new Set(arr.filter(Boolean))).sort();

    return {
      viveros: uniq(lotes.map((x) => txt(x.Vivero))),
      especies: uniq(lotes.map((x) => txt(x.EspecieMaterial))),
      contratos: uniq(
        movimientos.map((x) => txt(x.Contrato_Final || x.Contrato))
      ),
      empresas: uniq(
        movimientos.map((x) => txt(x.Empresa_EECC_Final || x.Empresa_EECC))
      ),
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
    () => new Set(lotesFiltrados.map((l) => txt(l.ID_Final_Lote))),
    [lotesFiltrados]
  );

  const movimientosFiltrados = useMemo(() => {
    const now = new Date();

    return movimientos.filter((m) => {
      const id = txt(m.ID_Final_Lote);
      if (idsFiltrados.size && id && !idsFiltrados.has(id)) return false;

      if (contrato && txt(m.Contrato_Final || m.Contrato) !== contrato) {
        return false;
      }

      if (empresa && txt(m.Empresa_EECC_Final || m.Empresa_EECC) !== empresa) {
        return false;
      }

      if (vivero) {
        const origen = txt(m.Origen);
        const destino = txt(m.Destino);
        if (origen !== vivero && destino !== vivero) return false;
      }

      if (fecha) {
        const f = new Date(
          m.Fecha_Movimiento || m.Fecha_Registro || m.Timestamp || ''
        );

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
    const stockInicial = lotesFiltrados.reduce(
      (s, l) => s + n(l.CantidadInicialP),
      0
    );

    let entradasVMA = 0;
    let salidasViveros = 0;
    let salidasEECC = 0;
    let bajas = 0;
    let transformaciones = 0;
    let ingresos = 0;
    let egresos = 0;

    movimientosFiltrados.forEach((m) => {
      const subtipo = txt(m.Subtipo_Movimiento);
      const tipo = txt(m.Tipo_Evento);
      const cantidad = n(m.Cantidad);

      if (
        subtipo === 'Recepción en VMA' ||
        subtipo === 'Ingreso a VMA' ||
        subtipo === 'Ingreso a vivero'
      ) {
        entradasVMA += cantidad;
        ingresos += cantidad;
      }

      if (
        subtipo === 'Despacho a VMA' ||
        subtipo === 'Traslado entre viveros'
      ) {
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
      const inicialVivero = lotesFiltrados.reduce(
        (s, l) => s + n(l.CantidadInicialP),
        0
      );

      let movVivero = 0;

      movimientosFiltrados.forEach((m) => {
        const cantidad = n(m.Cantidad);
        const subtipo = txt(m.Subtipo_Movimiento);
        const origen = txt(m.Origen);
        const destino = txt(m.Destino);

        if (
          origen === vivero &&
          ['Despacho a VMA', 'Traslado entre viveros', 'Salida a EECC'].includes(
            subtipo
          )
        ) {
          movVivero -= cantidad;
        }

        if (
          destino === vivero &&
          [
            'Recepción en VMA',
            'Ingreso a VMA',
            'Ingreso a vivero',
            'Devolución desde EECC',
            'Devolución',
          ].includes(subtipo)
        ) {
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

    lotesFiltrados.forEach((l) => {
      const v = txt(l.Vivero) || 'Sin vivero';
      data[v] = (data[v] || 0) + n(l.CantidadInicialP);
    });

    return Object.entries(data)
      .map(([name, value]) => ({
        name: short(name, 14),
        fullName: name,
        value,
      }))
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
    const data: Record<
      string,
      { contrato: string; empresa: string; movimientos: number }
    > = {};

    movimientosFiltrados.forEach((m) => {
      const c = txt(m.Contrato_Final || m.Contrato) || 'Sin contrato';
      const e = txt(m.Empresa_EECC_Final || m.Empresa_EECC) || '-';

      if (!data[c]) {
        data[c] = { contrato: c, empresa: e, movimientos: 0 };
      }

      data[c].movimientos += n(m.Cantidad);
    });

    return Object.values(data)
      .sort((a, b) => b.movimientos - a.movimientos)
      .slice(0, 5);
  }, [movimientosFiltrados]);

  const maxContrato = Math.max(
    ...stockPorContrato.map((x) => x.movimientos),
    1
  );

  const totalEspecies = stockPorEspecie.reduce((s, x) => s + x.value, 0);

  if (loading || !kpis) {
    return (
      <main className="min-h-screen bg-[#f7f9f6] p-8 font-bold text-[#14532d]">
        Cargando SITRAP...
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-[#f7f9f6] text-slate-900">
      <div className="grid h-screen grid-cols-1 lg:grid-cols-[205px_1fr]">
        <aside className="h-screen overflow-hidden border-r border-slate-200 bg-white px-2.5 py-1.5">
          <div className="mb-1 flex justify-center">
            <Image
              src="/sitrap-logo.png"
              alt="SITRAP"
              width={106}
              height={70}
              className="object-contain"
              priority
            />
          </div>

          <SidebarTitle>Inicio</SidebarTitle>

          <nav className="space-y-0 text-[10.5px]">
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 text-left font-bold text-[#14532d] hover:bg-green-50">
              <HomeIcon size={12} /> Inicio
            </button>

            <button className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 text-left font-semibold text-slate-700 hover:bg-green-50">
              <Boxes size={12} /> Inventario
            </button>

            <button className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 text-left font-semibold text-slate-700 hover:bg-green-50">
              <ArrowLeftRight size={12} /> Movimientos
            </button>

            <button className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 text-left font-semibold text-slate-700 hover:bg-green-50">
              <ClipboardList size={12} /> Contratos
            </button>

            <button className="flex w-full items-center gap-2 rounded-md px-2 py-0.5 text-left font-semibold text-slate-700 hover:bg-green-50">
              <BarChart3 size={12} /> Dashboard
            </button>
          </nav>

          <div className="mt-1.5">
            <SidebarTitle>Acciones rápidas</SidebarTitle>

            <div className="space-y-1">
              <a
                href="#"
                className="flex items-center justify-between rounded-md border border-green-200 bg-white px-2 py-1 text-[9px] font-bold text-[#14532d]"
              >
                Codificar Lote <ExternalLink size={10} />
              </a>

              <a
                href="#"
                className="flex items-center justify-between rounded-md border border-green-200 bg-white px-2 py-1 text-[9px] font-bold text-[#14532d]"
              >
                Registrar Movimiento <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div className="mt-1.5">
            <SidebarTitle>
              <span className="flex items-center gap-1.5">
                <Filter size={10} />
                Filtros rápidos
              </span>
            </SidebarTitle>

            <div className="space-y-1">
              <SelectFilter
                label="Vivero"
                value={vivero}
                options={options.viveros}
                onChange={setVivero}
              />

              <SelectFilter
                label="Especie"
                value={especie}
                options={options.especies}
                onChange={setEspecie}
              />

              <SelectFilter
                label="Contrato"
                value={contrato}
                options={options.contratos}
                onChange={setContrato}
              />

              <SelectFilter
                label="Empresa / EECC"
                value={empresa}
                options={options.empresas}
                onChange={setEmpresa}
              />

              <SelectFilter
                label="Fecha"
                value={fecha}
                options={options.fechas}
                onChange={setFecha}
              />

              <button
                onClick={() => {
                  setVivero('');
                  setEspecie('');
                  setContrato('');
                  setEmpresa('');
                  setFecha('');
                }}
                className="flex w-full items-center justify-center gap-1 rounded-md border border-green-200 px-2 py-1 text-[9.5px] font-bold text-[#14532d] hover:bg-green-50"
              >
                <RotateCcw size={10} />
                Limpiar filtros
              </button>
            </div>
          </div>
        </aside>

        <section className="flex h-screen flex-col overflow-hidden p-3 pb-0">
          <header className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-black leading-tight text-[#14532d]">
                Bienvenido a SITRAP
              </h1>
              <p className="mt-0.5 text-xs text-slate-600">
                Resumen ejecutivo de inventario y trazabilidad de plantas
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-[#14532d] shadow-sm">
              <CalendarClock size={16} />
              <div>
                <p className="text-[9px] text-slate-500">
                  Última actualización
                </p>
                <p className="text-xs font-black">
                  {new Date(kpis.fecha_actualizacion).toLocaleDateString(
                    'es-CL'
                  )}
                </p>
              </div>
            </div>
          </header>

          <div className="mb-2 grid gap-2 xl:grid-cols-[1fr_1.08fr_0.98fr]">
            <div className="h-[290px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <SectionHeader title="Stock por Vivero" action="Stock actual" />

              <div className="h-[248px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={stockPorVivero}
                    margin={{ top: 8, right: 4, bottom: 26, left: 26 }}
                    barCategoryGap="4%"
                    barGap={2}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 8 }}
                      interval={0}
                      height={34}
                      tickLine={false}
                      angle={0}
                      textAnchor="middle"
                    />

                    <YAxis
                      width={42}
                      tick={{ fontSize: 8 }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                    />

                    <Tooltip
                      formatter={(v: any) => fmt(v)}
                      labelFormatter={(_, payload: any) =>
                        payload?.[0]?.payload?.fullName || ''
                      }
                    />

                    <Bar
                      dataKey="value"
                      fill={GREEN}
                      radius={[7, 7, 0, 0]}
                      maxBarSize={70}
                    />
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
                      <Pie
                        data={stockPorEspecie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={36}
                        outerRadius={52}
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
                    <p className="text-sm font-black text-[#14532d]">
                      {fmt(calc.stockActual)}
                    </p>
                    <p className="text-[9px] text-slate-500">plantas</p>
                  </div>
                </div>

                <div className="space-y-1.5 overflow-hidden pr-1">
                  {stockPorEspecie.map((e, i) => {
                    const pct = totalEspecies ? (e.value / totalEspecies) * 100 : 0;

                    return (
                      <div
                        key={e.name}
                        className="grid grid-cols-[8px_minmax(0,1fr)_32px_46px] items-center gap-1.5 text-[9.3px]"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />

                        <span className="truncate text-slate-700" title={e.name}>
                          {short(e.name, 15)}
                        </span>

                        <span className="font-semibold text-slate-700">
                          {pct.toFixed(1)}%
                        </span>

                        <span className="text-right font-black text-[#14532d]">
                          {fmt(e.value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-[290px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <SectionHeader title="Indicadores Clave (KPI)" />

              <div className="grid gap-1.5">
                <CompactKpi
                  title="Stock General Inicial"
                  value={calc.stockInicial}
                  subtitle="plantas registradas"
                  icon={Boxes}
                />

                <CompactKpi
                  title="Stock General Actual"
                  value={calc.stockActual}
                  subtitle="plantas disponibles"
                  icon={PackageCheck}
                />

                <CompactKpi
                  title="Stock por Vivero (según filtro)"
                  value={calc.stockViveroSeleccionado}
                  subtitle="plantas"
                  icon={Warehouse}
                />

                <CompactKpi
                  title="Lotes Registrados"
                  value={lotesFiltrados.length}
                  subtitle="registros filtrados"
                  icon={Tag}
                />

                <CompactKpi
                  title="Entradas VMA"
                  value={calc.entradasVMA}
                  subtitle="plantas"
                  icon={PackagePlus}
                />
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
                        <td className="py-1 font-black text-[#14532d]">
                          {r.contrato}
                        </td>

                        <td className="py-1 text-slate-600">
                          {r.empresa}
                        </td>

                        <td className="min-w-[100px] py-1">
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-[#166534]"
                              style={{ width: `${Math.max(pct, 5)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-1 text-right font-black">
                          {fmt(r.movimientos)}
                        </td>
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
                    <p className="text-[10px] font-black">
                      Traslados pendientes
                    </p>
                    <p className="text-[9px] text-slate-500">
                      {fmt(calc.trasladosPendientes)} plantas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-red-50 p-2.5">
                  <AlertTriangle className="text-red-600" size={14} />
                  <div>
                    <p className="text-[10px] font-black">Bajas / pérdidas</p>
                    <p className="text-[9px] text-slate-500">
                      {fmt(calc.bajas)} plantas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-green-50 p-2.5">
                  <SearchCheck className="text-[#166534]" size={14} />
                  <div>
                    <p className="text-[10px] font-black">Lotes registrados</p>
                    <p className="text-[9px] text-slate-500">
                      {fmt(lotesFiltrados.length)} registros
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[230px] overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <SectionHeader title="Indicadores Operacionales" />

              <div className="grid gap-1.5">
                <CompactKpi
                  title="Salidas Viveros"
                  value={calc.salidasViveros}
                  subtitle="plantas"
                  icon={PackageMinus}
                />

                <CompactKpi
                  title="Despachos EECC"
                  value={calc.salidasEECC}
                  subtitle="plantas"
                  icon={Truck}
                />

                <CompactKpi
                  title="Transformaciones"
                  value={calc.transformaciones}
                  subtitle="plantas"
                  icon={RefreshCw}
                />

                <CompactKpi
                  title="Traslados Pendientes"
                  value={calc.trasladosPendientes}
                  subtitle="plantas"
                  icon={Warehouse}
                />
              </div>
            </div>
          </div>

          <footer className="-mx-3 mt-2 flex h-8 items-center justify-center bg-[#14532d] px-4 text-[11px] font-semibold text-white">
            <span>SITRAP · Sistema de Inventario y Trazabilidad de Plantas</span>
            <span className="absolute right-4">Versión 3.14</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
