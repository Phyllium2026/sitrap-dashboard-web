'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';

const API = '/api/sitrap';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API}?view=movimientos`, { cache: 'no-store' });
        const data = await r.json();
        setMovimientos(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#14532d]">
              Movimientos SITRAP
            </h1>
            <p className="text-sm text-slate-500">
              Historial de movimientos registrados
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

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          {loading ? (
            <p>Cargando movimientos...</p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <ArrowLeftRight size={18} />
                <span className="font-semibold">
                  Total movimientos: {movimientos.length}
                </span>
              </div>

              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Movimiento</th>
                      <th className="p-2 text-left">ID Lote</th>
                      <th className="p-2 text-left">Especie</th>
                      <th className="p-2 text-right">Cantidad</th>
                      <th className="p-2 text-left">Origen</th>
                      <th className="p-2 text-left">Destino</th>
                    </tr>
                  </thead>

                  <tbody>
                    {movimientos.slice(0, 500).map((m, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">
                          {formatDate(m.Fecha_Movimiento || m.Fecha_Registro || m.Timestamp)}
                        </td>

                        <td className="p-2">
                          {m.Subtipo_Movimiento || m.Tipo_Evento || '-'}
                        </td>

                        <td className="p-2">
                          {m.ID_Lote_SITRAP || m.ID_Final_Lote || '-'}
                        </td>

                        <td className="p-2">
                          {m.Especie || m.EspecieMaterial || '-'}
                        </td>

                        <td className="p-2 text-right">
                          {Number(m.Cantidad || 0).toLocaleString('es-CL')}
                        </td>

                        <td className="p-2">
                          {m.Origen || '-'}
                        </td>

                        <td className="p-2">
                          {m.Destino || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-CL');
}
