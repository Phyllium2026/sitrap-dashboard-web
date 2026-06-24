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
    ? `https://quickchart.io/qr?size=420&text=${encodeURIComponent(qrUrl)}`
    : '';

  const cantidad =
    lote?.CantidadInicialP_Corregida ||
    lote?.CantidadInicialP ||
    lote?.StockActual ||
    0;

  const etiquetas = Array.from({ length: 12 });

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between no-print">
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
            Volver
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_500px]">
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
            <div className="no-print mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#14532d]">
                  Vista previa etiqueta A4
                </h2>
                <p className="text-xs text-slate-500">
                  Imprime 12 etiquetas iguales en hoja A4 adhesiva.
                </p>
                {esUltimoLote && (
                  <p className="mt-1 text-xs font-semibold text-green-700">
                    Último lote creado seleccionado automáticamente
                  </p>
                )}
              </div>

              <button
                disabled={!loteId}
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg bg-[#14532d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Printer size={16} />
                Imprimir etiqueta A4
              </button>
            </div>

            {lote ? (
              <>
                <div className="previewWrap">
                  <EtiquetaLote
                    lote={lote}
                    loteId={loteId}
                    qrImage={qrImage}
                    cantidad={cantidad}
                  />
                </div>

                <div className="printSheet">
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

                <div className="no-print mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <div><b>ID:</b> {loteId}</div>
                  <div><b>QR apunta a:</b> {qrUrl}</div>
                  <div className="mt-2">
                    <b>Impresión recomendada:</b> hoja A4, escala 100%, márgenes mínimos.
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
        .previewWrap {
          display: flex;
          justify-content: center;
          padding: 18px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }

        .printSheet {
          display: none;
        }

        .label {
          width: 60mm;
          height: 40mm;
          display: grid;
          grid-template-columns: 24mm 1fr;
          gap: 2mm;
          padding: 2mm;
          background: white;
          border: 1px solid #111;
          color: #000;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
          overflow: hidden;
        }

        .qrBox {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr {
          width: 23mm;
          height: 23mm;
        }

        .labelInfo {
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }

        .brand {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.8px;
        }

        .id {
          margin-top: 2px;
          font-size: 9px;
          font-weight: 900;
          line-height: 1.05;
          word-break: break-word;
        }

        .species {
          margin-top: 3px;
          font-size: 8.5px;
          font-weight: 800;
          line-height: 1.1;
        }

        .meta {
          margin-top: 3px;
          font-size: 8px;
          font-weight: 700;
        }

        .smallMeta {
          margin-top: 2px;
          font-size: 7px;
          font-weight: 700;
        }

        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            margin: 0 !important;
            background: white !important;
          }

          .no-print,
          .previewWrap {
            display: none !important;
          }

          main {
            padding: 0 !important;
            background: white !important;
          }

          .printSheet {
            display: grid !important;
            grid-template-columns: repeat(3, 60mm);
            grid-auto-rows: 40mm;
            gap: 5mm 5mm;
            justify-content: center;
            align-content: start;
            width: 190mm;
            min-height: 277mm;
            margin: 0 auto;
            background: white;
          }

          .label {
            width: 60mm !important;
            height: 40mm !important;
            border: 1px solid #111 !important;
            page-break-inside: avoid;
            break-inside: avoid;
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

      <div className="labelInfo">
        <div className="brand">SITRAP</div>
        <div className="id">{loteId}</div>
        <div className="species">
          {lote.EspecieMaterial || lote.Especie || 'Sin especie'}
        </div>
        <div className="meta">
          {shortVivero(lote.Vivero)} · {fmt(cantidad)} pl.
        </div>
        <div className="smallMeta">
          {lote.Contenedor || lote.TipoContenedor || 'Contenedor s/i'}
        </div>
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
