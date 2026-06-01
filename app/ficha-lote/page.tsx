'use client';

import { useEffect, useState } from 'react';

type Lote = {
  ID_Lote_SITRAP?: string;
  ID_Final_Lote?: string;
  EspecieMaterial?: string;
  Vivero?: string;
  Responsable?: string;
  CantidadInicialP?: number | string;
  CantidadInicial?: number | string;
  StockActual?: number | string;
  Stock?: number | string;
  TipoContenedorInicial?: string;
  CodContenedor?: string;
  Categoria_Lote?: string;
  Tipo_Lote?: string;
  OrigenMaterial?: string;
  OrigenMaterial1?: string;
  Localidad_MAYUS?: string;
  CodOrigen?: string;
  FechaColecta?: string;
  FechaSiembra?: string;
  FechaRegistro?: string;
  Timestamp?: string;
  Nivel_Trazabilidad?: string;
  Observaciones?: string;
};

export default function FichaLotePage() {
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
        setError('No fue posible cargar la ficha completa del lote.');
      } finally {
        setLoading(false);
      }
    }

    fetchLote();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="text-slate-600">Cargando ficha del lote...</p>
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

  const loteId = lote.ID_Lote_SITRAP || lote.ID_Final_Lote || id;
  const stock = lote.StockActual ?? lote.Stock ?? lote.CantidadInicialP ?? 'Sin dato';
  const cantidadInicial =
    lote.CantidadInicialP ?? lote.CantidadInicial ?? lote.StockActual ?? 'Sin dato';

  const movimientoFormUrl = `https://docs.google.com/forms/d/e/1FAIpQLSfQ3yuIk_Z2I_jvzhBX33sr8rNf_iF-vNwiqujYJRaZFU8YKw/viewform?usp=pp_url&entry.999239179=${encodeURIComponent(
    loteId
  )}`;

  return (
    <main className="min-h-screen bg-slate-50 p-5">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            SITRAP · Ficha completa del lote
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {lote.EspecieMaterial || 'Especie sin dato'}
          </h1>

          <p className="mt-2 break-words text-sm font-medium text-slate-500">
            {loteId}
          </p>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <Info label="Especie" value={lote.EspecieMaterial || 'Sin dato'} />
          <Info label="Vivero" value={lote.Vivero || 'Sin dato'} />
          <Info label="Stock actual" value={String(stock)} />
          <Info label="Cantidad inicial" value={String(cantidadInicial)} />
          <Info label="Tipo contenedor" value={lote.TipoContenedorInicial || 'Sin dato'} />
          <Info label="Código contenedor" value={lote.CodContenedor || 'Sin dato'} />
          <Info label="Tipo de lote" value={lote.Categoria_Lote || lote.Tipo_Lote || 'Sin dato'} />
          <Info label="Origen material" value={lote.OrigenMaterial || lote.OrigenMaterial1 || 'Sin dato'} />
          <Info label="Localidad origen" value={lote.Localidad_MAYUS || 'Sin dato'} />
          <Info label="Código origen" value={lote.CodOrigen || 'Sin dato'} />
          <Info label="Fecha colecta" value={formatDate(lote.FechaColecta)} />
          <Info label="Fecha siembra" value={formatDate(lote.FechaSiembra)} />
          <Info label="Fecha registro" value={formatDate(lote.FechaRegistro || lote.Timestamp)} />
          <Info label="Responsable" value={lote.Responsable || 'Sin dato'} />
          <Info label="Nivel trazabilidad" value={lote.Nivel_Trazabilidad || 'Sin dato'} />
          <Info label="ID_Lote_SITRAP" value={loteId || 'Sin dato'} />
        </div>

        <div className="mt-4">
          <Info label="Observaciones" value={lote.Observaciones || 'Sin observaciones'} />
        </div>

        <div className="mt-6 space-y-3">
          <a
            href={movimientoFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl bg-emerald-700 px-4 py-3 text-center font-semibold text-white shadow-sm"
          >
            Registrar movimiento
          </a>

          <a
            href={`/lote?id=${encodeURIComponent(loteId)}`}
            className="block w-full rounded-2xl border border-emerald-700 px-4 py-3 text-center font-semibold text-emerald-800"
          >
            Volver a ficha rápida
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

function formatDate(value?: string) {
  if (!value) return 'Sin dato';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-CL');
}
