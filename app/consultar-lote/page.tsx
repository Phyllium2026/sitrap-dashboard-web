'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, PackageCheck, Tag } from 'lucide-react';

const API = '/api/sitrap';

export default function ConsultarLotePage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const r = await fetch(`${API}?view=lotes`, { cache: 'no-store' });
      const data = await r.json();
      setLotes(Array.isArray(data) ? data : []);
      setLoading(false);
    }

    load();
  }, []);

  const resultados = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return lotes.slice(0, 30);

    return lotes
      .filter((l) => {
        const id = String(l.ID_Lote_SITRAP || '').toLowerCase();
        const especie = String(l.EspecieMaterial || '').toLowerCase();
        const vivero = String(l.Vivero || '').toLowerCase();

        return id.includes(q) || especie.includes(q) || vivero.includes(q);
      })
      .slice(0, 50);
  }, [lotes, query]);

  return (
    <main className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#14532d]">
              Consultar lote
            </h1>
            <p className="text-sm text-slate-500">
              Buscar lote, consultar ficha o reimprimir etiqueta QR
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border bg-white px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft size={16} className="inline" /> Inicio
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none"
            placeholder="Buscar ID, especie o vivero..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-slate-500">Cargando lotes...</p>
        ) : (
          <div className="space-y-3">
            {resultados.map((l, i) => {
              const id = l.ID_Lote_SITRAP || '';
              const especie = l.EspecieMaterial || 'Sin especie';
              const vivero = l.Vivero || 'Sin vivero';
              const stock =
                l.StockActual ||
                l.Stock ||
                l.CantidadInicialP_Corregida ||
                l.CantidadInicialP ||
                0;

              return (
                <div
                  key={i}
                  className="rounded-3xl border bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#14532d]">
                      <PackageCheck size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-black text-slate-900">
                        {especie}
                      </h2>
                      <p className="truncate text-xs font-bold text-[#14532d]">
                        {id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {vivero} · {Number(stock || 0).toLocaleString('es-CL')} plantas
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Link
                      href={`/lote?id=${encodeURIComponent(id)}`}
                      className="rounded-2xl bg-[#14532d] px-3 py-3 text-center text-sm font-bold text-white"
                    >
                      Ficha rápida
                    </Link>

                    <Link
                      href={`/ficha-lote?id=${encodeURIComponent(id)}`}
                      className="rounded-2xl border border-[#14532d] px-3 py-3 text-center text-sm font-bold text-[#14532d]"
                    >
                      Ficha completa
                    </Link>

                    <Link
                      href={`/lote-creado?id=${encodeURIComponent(id)}`}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-emerald-50 px-3 py-3 text-center text-sm font-bold text-emerald-700"
                    >
                      <Tag size={16} />
                      Reimprimir etiqueta
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
