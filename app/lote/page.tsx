'use client';

import { useEffect, useState } from 'react';

type Lote = {
  ID_Lote_SITRAP?: string;
  EspecieMaterial?: string;
  Vivero?: string;
  CantidadInicialP?: number | string;
  StockActual?: number | string;
  Stock?: number | string;
  Calidad?: string;
  CalidadInicial?: string;
};

export default function LotePage() {
  const [id, setId] = useState('');
  const [lote, setLote] = useState<Lote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loteId = params.get('id') || '';

    if (!loteId) {
      setError('No se recibió ID_Lote_SITRAP.');
      setLoading(false);
      return;
    }

    setId(loteId);

    async function fetchLote() {
      try {
        const res = await fetch(
          `/api/sitrap?view=lote&id=${encodeURIComponent(loteId)}`,
          { cache: 'no-store' }
        );

        const data = await res.json();

        if (!data.ok || !data.lote) {
          throw new Error('No se encontró información del lote.');
        }

        setLote(data.lote);
      } catch {
        setError('No fue posible cargar la ficha del lote.');
      } finally {
        setLoading(false);
      }
    }

    fetchLote();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="text-slate-600">Cargando lote...</p>
      </main>
    );
  }

  if (error || !lote) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-red-700">Error</h1>
          <p className="mt-2 text-slate-600">{error}</p>
        </div>
      </main>
    );
  }

  const loteId = lote.ID_Lote_SITRAP || id;
  const stock = lote.StockActual ?? lote.Stock ?? lote.CantidadInicialP ?? 'Sin dato';
  const calidad = lote.Calidad ?? lote.CalidadInicial ?? 'Sin dato';

  return (
    <main className="min-h-screen bg-slate-50 p-5">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            SITRAP · Ficha rápida de lote
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {lote.EspecieMaterial || 'Especie sin dato'}
          </h1>
        </div>

        <div className="space-y-3 text-sm">
          <Info label="Especie" value={lote.EspecieMaterial || 'Sin dato'} />
          <Info label="Vivero" value={lote.Vivero || 'Sin dato'} />
          <Info label="Stock" value={String(stock)} />
          <Info label="Calidad" value={String(calidad)} />
          <Info label="ID_Lote_SITRAP" value={loteId || 'Sin dato'} />
        </div>

        <div className="mt-6 space-y-3">
          <a
            href={`/movimiento?id=${encodeURIComponent(loteId)}`}
            className="block w-full rounded-2xl bg-emerald-700 px-4 py-3 text-center font-semibold text-white shadow-sm"
          >
            Registrar movimiento
          </a>

          <a
            href={`/ficha-lote?id=${encodeURIComponent(loteId)}`}
            className="block w-full rounded-2xl border border-emerald-700 px-4 py-3 text-center font-semibold text-emerald-800"
          >
            Ver ficha del lote
          </a>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
