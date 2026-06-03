'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Package,
  Truck,
  Boxes,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

const API = '/api/sitrap';

export default function DashboardEjecutivoPage() {
  const [kpis, setKpis] = useState<any>({});
  const [lotes, setLotes] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [k, l, m] = await Promise.all([
          fetch(`${API}?view=kpis`, { cache: 'no-store' }).then((r) => r.json()),
          fetch(`${API}?view=lotes`, { cache: 'no-store' }).then((r) => r.json()),
          fetch(`${API}?view=movimientos`, { cache: 'no-store' }).then((r) => r.json()),
        ]);

        setKpis(k);
        setLotes(Array.isArray(l) ? l : []);
        setMovimientos(Array.isArray(m) ? m : []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const topEspecies = useMemo(() => {
    const data: Record<string, number> = {};
    lotes.forEach((l) => {
      const especie = txt(l.EspecieMaterial) || 'Sin especie';
      data[especie] = (data[especie] || 0) + n(l.CantidadInicialP_Corregida || l.CantidadInicialP);
    });
    return Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [lotes]);

  const topContratos = useMemo(() => {
    const data: Record<string, number> = {};
    movimientos.forEach((m) => {
      const contrato = txt(m.Contrato_Final || m.Contrato) || 'Movimientos internos';
      data[contrato] = (data[contrato] || 0) + n(m.Cantidad);
    });
    return Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [movimientos]);

  const topEmpresas = useMemo(() => {
    const data: Record<string, number> = {};
    movimientos.forEach((m) => {
      const empresa = txt(m.Empresa_EECC_Final || m.Empresa_EECC) || 'Sin empresa';
      data[empresa] = (data[empresa] || 0) + n(m.Cantidad);
    });
    return Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [movimientos]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p>Cargando dashboard ejecutivo...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#14532d]">
              Dashboard Ejecutivo SITRAP
            </h1>
            <p className="text-sm text-slate-500">
              Indicadores consolidados para gestión y control operacional
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Kpi title="Stock Inicial" value={kpis.stockGeneralInicial} icon={<Package />} />
          <Kpi title="Stock Actual" value={kpis.stockActual} icon={<Boxes />} />
          <Kpi title="Lotes" value={kpis.totalLotes} icon={<ClipboardList />} />
          <Kpi title="Entradas VMA" value={kpis.entradasVMA} icon={<Package />} />
          <Kpi title="Salidas Viveros" value={kpis.salidasViveros} icon={<Truck />} />
          <Kpi title="Despachos EECC" value={kpis.despachosEECC} icon={<Truck />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Ranking title="Top especies" data={topEspecies} />
          <Ranking title="Top contratos" data={topContratos} />
          <Ranking title="Top empresas EECC" data={topEmpresas} />
        </div>

        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-bold text-[#14532d]">
            <AlertTriangle size={18} />
            Alertas ejecutivas
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Alert label="Traslados pendientes" value={kpis.trasladosPendientes} />
            <Alert label="Bajas / pérdidas" value={kpis.bajasPerdidas || 0} />
            <Alert label="Transformaciones" value={kpis.transformacionesLote || 0} />
          </div>
        </div>

      </div>
    </main>
  );
}

function Kpi({ title, value, icon }: any) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[#14532d]">
        <span className="h-5 w-5">{icon}</span>
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <div className="text-2xl font-bold text-[#14532d]">
        {fmt(value)}
      </div>
    </div>
  );
}

function Ranking({ title, data }: { title: string; data: [string, number][] }) {
  const max = Math.max(...data.map((d) => d[1]), 1);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-bold text-[#14532d]">
        <BarChart3 size={18} />
        {title}
      </div>

      <div className="space-y-3">
        {data.map(([name, value]) => (
          <div key={name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="truncate pr-3">{name}</span>
              <strong>{fmt(value)}</strong>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[#14532d]"
                style={{ width: `${Math.max((value / max) * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Alert({ label, value }: any) {
  return (
    <div className="rounded-lg bg-amber-50 p-4">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-1 text-xl font-bold text-[#14532d]">{fmt(value)}</div>
    </div>
  );
}

function n(value: any) {
  return Number(value || 0);
}

function txt(value: any) {
  return String(value || '').trim();
}

function fmt(value: any) {
  return Number(value || 0).toLocaleString('es-CL');
}
