'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';

const API = '/api/sitrap';

export default function InventarioPage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API}?view=lotes`);
        const data = await r.json();

        setLotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
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
              Inventario SITRAP
            </h1>

            <p className="text-sm text-slate-500">
              Lotes registrados en el sistema
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
            <p>Cargando inventario...</p>
          ) : (
            <>

              <div className="mb-4 flex items-center gap-2">
                <Package size={18} />
                <span className="font-semibold">
                  Total lotes: {lotes.length}
                </span>
              </div>

              <div className="overflow-auto">

                <table className="min-w-full text-sm">

                  <thead className="bg-slate-100">

                    <tr>
                      <th className="p-2 text-left">ID SITRAP</th>
                      <th className="p-2 text-left">Especie</th>
                      <th className="p-2 text-left">Vivero</th>
                      <th className="p-2 text-right">Cantidad</th>
                    </tr>

                  </thead>

                  <tbody>

                    {lotes.slice(0, 500).map((lote, i) => (
                      <tr key={i} className="border-t">

                        <td className="p-2">
                          {lote.ID_Lote_SITRAP ||
                            lote.ID_Final_Lote ||
                            '-'}
                        </td>

                        <td className="p-2">
                          {lote.EspecieMaterial || '-'}
                        </td>

                        <td className="p-2">
                          {lote.Vivero || '-'}
                        </td>

                        <td className="p-2 text-right">
                          {Number(
                            lote.CantidadInicialP_Corregida ||
                            lote.CantidadInicialP ||
                            0
                          ).toLocaleString('es-CL')}
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
