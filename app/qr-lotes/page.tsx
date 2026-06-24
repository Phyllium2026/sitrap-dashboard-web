'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer, Search } from 'lucide-react';

const API = '/api/sitrap';
const BASE_URL = 'https://sitrap-dashboard-web-73p9.vercel.app';

export default function QrLotesPage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API}?view=altas`, { cache: 'no-store' });
        const data = await r.json();
        setLotes(Array.isArray(data) ? data : []);
      } catch {
        setLotes([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtrados = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return lotes.slice(0, 80);

    return lotes
      .filter((l) => {
        const id = String(l.ID_Lote_SITRAP || '').toLowerCase();
        const especie = String(l.EspecieMaterial || l.Especie || '').toLowerCase();
        const vivero = String(l.Vivero || '').toLowerCase();

        return id.includes(q) || especie.includes(q) || vivero.includes(q);
      })
      .slice(0, 80);
  }, [lotes, query]);

  const lote = selected || filtrados[0];

  const ultimoLoteId = lotes[0]?.ID_Lote_SITRAP || '';
  const esUltimoLote = lote?.ID_Lote_SITRAP === ultimoLoteId;

  const loteId = lote?.ID_Lote_SITRAP || '';
  const qrUrl = loteId ? `${BASE_URL}/lote?id=${encodeURIComponent(loteId)}` : '';
  const qrImage = loteId
    ? `https://quickchart.io/qr?size=500&text=${encodeURIComponent(qrUrl)}`
    : '';

  const cantidad =
    lote?.CantidadInicialP_Corregida ||
    lote?.CantidadInicialP ||
    lote?.StockActual ||
    0;

  const etiquetas = Array.from({ length: 6 });

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="no-print mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#14532d]">
              QR de Lotes SITRAP
            </h1>
            <p className="text-sm text-slate-500">
              Búsqueda, visualización e impresión de etiquetas en papel adhesivo A4.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Volver al menú
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_680px]">
          <section className="no-print rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 rounded-lg border px-3 py-2">
              <Search size={18} className="text-slate-400" />
              <input
                className="w-full outline-none"
                placeholder="Pegar o buscar ID_Lote_SITRAP, especie o vivero..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                }}
              />
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Cargando lotes...</p>
            ) : filtrados.length === 0 ? (
              <p className="text-sm text-red-600">
                No se encontró ningún lote con ese criterio.
              </p>
            ) : (
              <div className="max-h-[70vh] overflow-auto rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">ID Lote</th>
                      <th className="p-2 text-left">Especie</th>
                      <th className="p-2 text-left">Vivero</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtrados.map((l, i) => {
                      const id = l.ID_Lote_SITRAP || '-';
                      const active = lote?.ID_Lote_SITRAP === id;

                      return (
                        <tr
                          key={`${id}-${i}`}
                          className={`cursor-pointer border-t hover:bg-green-50 ${
                            active ? 'bg-green-50' : ''
                          }`}
                          onClick={() => setSelected(l)}
                        >
                          <td className="p-2 font-semibold text-[#14532d]">
                            {id}
                          </td>
                          <td className="p-2">
                            {l.EspecieMaterial || l.Especie || '-'}
                          </td>
                          <td className="p-2">
                            {l.Vivero || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="no-print mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#14532d]">
                  Vista previa etiquetas A4
                </h2>
                <p className="text-xs text-slate-500">
                  Se imprimirán 6 etiquetas iguales en una hoja A4.
                </p>

                {esUltimoLote && (
                  <p className="mt-2 inline-block rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                    Último lote creado seleccionado automáticamente
                  </p>
                )}
              </div>

              <button
                disabled={!loteId}
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg bg-[#14532d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Printer size={17} />
                Imprimir etiqueta A4
              </button>
            </div>

            {lote ? (
              <>
                <div className="sheetPreview">
                  {etiquetas.map((_, i) => (
                    <EtiquetaLote
                      key={i}
                      lote={lote}
                      loteId={loteId}
                      qrImage={qrImage}
                      cantidad={cantidad}
                    />
                  ))}
                </div>

                <div className="no-print mt-4 rounded-lg border bg-slate-50 p-3 text-xs text-slate-600">
                  <div>
                    <b>QR apunta a:</b> {qrUrl}
                  </div>
                </div>

                <div className="no-print mt-3 rounded-xl border bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                    <Printer size={18} />
                    INSTRUCCIONES DE IMPRESIÓN
                  </div>
                  <div className="grid gap-1 text-sm text-slate-700">
                    <div>✅ Papel: A4</div>
                    <div>✅ Escala: 100% / tamaño real</div>
                    <div>✅ Márgenes: mínimos</div>
                    <div>✅ Papel recomendado: adhesivo A4 mate o vinilo adhesivo A4</div>
                    <div>✅ Cortar después de imprimir</div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Selecciona un lote para generar la etiqueta.
              </p>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .sheetPreview {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, 90mm);
          grid-auto-rows: 80mm;
          gap: 6mm;
          justify-content: center;
          padding: 10mm 4mm;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        }

        .label {
          width: 90mm;
          height: 80mm;
          padding: 5mm;
          background: white;
          border: 1.5px solid #111;
          border-radius: 12px;
          color: #000;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .qrBox {
          height: 42mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr {
          width: 42mm;
          height: 42mm;
          display: block;
        }

        .divider {
          width: 100%;
          border-top: 1px solid #555;
          margin: 3mm 0 2.5mm 0;
        }

        .brand {
          font-size: 14px;
          font-weight: 900;
          color: #14532d;
          line-height: 1.1;
          text-align: center;
        }

        .id {
          margin-top: 1.5mm;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.15;
          text-align: center;
          word-break: break-word;
        }

        .species {
          margin-top: 1.5mm;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.15;
          text-align: center;
        }

        .meta {
          margin-top: 1.5mm;
          font-size: 12.5px;
          font-weight: 800;
          line-height: 1.15;
          text-align: center;
        }

        .containerText {
          margin-top: 1.5mm;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.15;
          text-align: center;
        }

        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            min-height: auto !important;
          }

          main > div {
            max-width: none !important;
            width: auto !important;
            margin: 0 !important;
          }

          section {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          .sheetPreview {
            width: 194mm !important;
            height: 281mm !important;
            display: grid !important;
            grid-template-columns: repeat(2, 90mm) !important;
            grid-template-rows: repeat(3, 80mm) !important;
            gap: 6mm 8mm !important;
            justify-content: center !important;
            align-content: start !important;
            padding: 0 !important;
            margin: 0 auto !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
          }

          .label {
            width: 90mm !important;
            height: 80mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </main>
  );
}

function EtiquetaLote({
  lote,
  loteId,
  qrImage,
  cantidad,
}: {
  lote: any;
  loteId: string;
  qrImage: string;
  cantidad: any;
}) {
  return (
    <div className="label">
      <div className="qrBox">
        {qrImage && (
          <img src={qrImage} alt="QR Lote SITRAP" className="qr" />
        )}
      </div>

      <div className="divider" />

      <div className="brand">SITRAP</div>

      <div className="id">{loteId}</div>

      <div className="species">
        {lote.EspecieMaterial || lote.Especie || 'Sin especie'}
      </div>

      <div className="meta">
        {shortVivero(lote.Vivero)} • {fmt(cantidad)} plantas
      </div>

      <div className="containerText">
        {lote.Contenedor || lote.TipoContenedor || 'Contenedor s/i'}
      </div>
    </div>
  );
}

function fmt(value: any) {
  return Number(value || 0).toLocaleString('es-CL');
}

function shortVivero(value: any) {
  const v = String(value || '').trim();

  if (v.includes('Monte Aranda')) return 'VMA';
  if (v.includes('Sagrada Familia')) return 'VSF';
  if (v.includes('Quilimarí')) return 'VQ';

  return v || '-';
}
