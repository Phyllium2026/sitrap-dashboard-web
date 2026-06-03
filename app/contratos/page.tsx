'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';

const API = '/api/sitrap';

export default function ContratosPage() {
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

  const contratos = useMemo(() => {
    const data: Record<string, { contrato: string; empresa: string; movimientos: number }> = {};

    movimientos.forEach((m) => {
      const contrato = txt(m.Contrato_Final || m.Contrato) || 'Sin contrato';
      const empresa = txt(m.Empresa_EECC_Final || m.Empresa_EECC) || '-';
      const cantidad = Number(m.Cantidad || 0);

      if (!data[contrato]) {
        data[contrato] = { contrato, empresa, movimientos: 0 };
      }

      data[contrato].movimientos += cantidad;
    });

    return Object.values(data).sort((a, b) => b.movimientos - a.movimientos);
  }, [movimientos]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#14532d]">
              Contratos SITRAP
            </h1>
            <p className="text-sm text-slate-500">
              Resumen de movimientos por contrato y empresa EECC
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
            <p>Cargando contratos...</p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList size={18} />
                <span className="font-semibold">
                  Total contratos: {contratos.length}
                </span>
              </div>

              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">Contrato</th>
                      <th className="p-2 text-left">Empresa / EECC</th>
                      <th className="p-2 text-right">Movimientos</th>
                    </tr>
                  </thead>

                  <tbody>
                    {contratos.map((c, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 font-semibold text-[#14532d]">
                          {c.contrato}
                        </td>

                        <td className="p-2">
                          {c.empresa}
                        </td>

                        <td className="p-2 text-right font-semibold">
                          {c.movimientos.toLocaleString('es-CL')}
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

function txt(value: any) {
  return String(value || '').trim();
}
