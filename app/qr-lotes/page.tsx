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

  const especie = lote?.EspecieMaterial || lote?.Especie || 'Sin especie';
  const vivero = shortVivero(lote?.Vivero);
  const cantidad = fmt(
    lote?.CantidadInicialP_Corregida ||
    lote?.CantidadInicialP ||
    lote?.StockActual ||
    0
  );
  const contenedor = lote?.Contenedor || lote?.TipoContenedor || 'Contenedor s/i';

  const etiquetas = Array.from({ length: 6 });

  const etiquetaPrint = (i: number) => (
    <div className="printLabel" key={i}>
      <div className="printQrBox">
        {qrImage && <img src={qrImage} alt="QR Lote SITRAP" />}
      </div>
      <div className="printLine" />
      <div className="printBrand">SITRAP</div>
      <div className="printId">{loteId}</div>
      <div className="printSpecies">{especie}</div>
      <div className="printMeta">{vivero} · {cantidad} pl.</div>
      <div className="printContainer">{contenedor}</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#14532d]">
              QR de Lotes SITRAP
            </h1>
            <p className="text-sm text-slate-500">
              Módulo paralelo seguro para buscar, visualizar e imprimir etiquetas A4.
            </p>
          </div>

          <Link
            href="/"
            className="no-print flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_430px]">
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
                  Vista previa etiqueta
                </h2>
                <p className="text-xs text-slate-500">
                  Compatible con impresión en papel adhesivo A4.
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
                Imprimir
              </button>
            </div>

            {lote ? (
              <>
                <div className="screenPreview">
                  <div className="label">
                    <div className="qrBox">
                      {qrImage && (
                        <img src={qrImage} alt="QR Lote SITRAP" className="qr" />
                      )}
                    </div>

                    <div className="labelInfo">
                      <div className="brand">SITRAP</div>
                      <div className="id">{loteId}</div>
                      <div className="species">{especie}</div>
                      <div className="meta">
                        {vivero} · {cantidad} pl.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="printSheet">
                  <div className="printGrid">
                    {etiquetas.map((_, i) => etiquetaPrint(i))}
                  </div>

                  <div className="printInstructions">
                    <div className="printIcon" aria-hidden="true">▣</div>

                    <div className="printText">
                      <div className="printTitle">INSTRUCCIONES DE IMPRESIÓN</div>
                      <div className="printCheck">Papel: A4</div>
                      <div className="printCheck">Escala: 100% (Tamaño real)</div>
                      <div className="printCheck">Márgenes: mínimos</div>
                      <div className="printCheck">Se recomienda papel adhesivo A4 (cortar después de imprimir).</div>
                    </div>

                    <div className="printDiagram" aria-hidden="true">
                      <div className="dimTop">60 mm</div>
                      <div className="diagramRow">
                        <div className="diagramBox">
                          <div>Etiqueta</div>
                          <strong>60 x 40 mm</strong>
                        </div>
                        <div className="dimSide">40 mm</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="no-print mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <div><b>ID:</b> {loteId}</div>
                  <div><b>QR apunta a:</b> {qrUrl}</div>
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
        .screenPreview {
          display: block;
        }

        .label {
          width: 60mm;
          height: 40mm;
          display: grid;
          grid-template-columns: 25mm 1fr;
          gap: 2mm;
          padding: 2mm;
          background: white;
          border: 1px solid #111;
          color: #000;
          font-family: Arial, sans-serif;
        }

        .qrBox {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr {
          width: 24mm;
          height: 24mm;
        }

        .labelInfo {
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }

        .brand {
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.5px;
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
          font-size: 8px;
          font-weight: 700;
          line-height: 1.1;
        }

        .meta {
          margin-top: 3px;
          font-size: 7px;
          font-weight: 700;
        }

        .printSheet {
          display: none;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .printSheet,
          .printSheet * {
            visibility: visible !important;
          }

          .printSheet {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 7mm 11mm 6mm 11mm !important;
            box-sizing: border-box !important;
            background: white !important;
            overflow: hidden !important;
            font-family: Arial, Helvetica, sans-serif !important;
            color: #000 !important;
          }

          .no-print,
          .screenPreview {
            display: none !important;
          }

          main,
          main > div,
          section {
            display: block !important;
            width: auto !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          .printGrid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: repeat(3, 57mm) !important;
            column-gap: 9mm !important;
            row-gap: 4mm !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          .printLabel {
            width: 100% !important;
            height: 57mm !important;
            box-sizing: border-box !important;
            border: 1.2px solid #111 !important;
            border-radius: 5mm !important;
            padding: 3mm 3mm 2.5mm 3mm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            background: white !important;
            color: #000 !important;
          }

          .printQrBox {
            width: 100% !important;
            height: 32mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: 0 0 auto !important;
          }

          .printQrBox img {
            width: 32mm !important;
            height: 32mm !important;
            display: block !important;
            object-fit: contain !important;
          }

          .printLine {
            width: 100% !important;
            border-top: 1px solid #333 !important;
            margin: 2mm 0 1.3mm 0 !important;
            height: 0 !important;
            flex: 0 0 auto !important;
          }

          .printBrand {
            font-size: 12px !important;
            font-weight: 900 !important;
            line-height: 1.05 !important;
            text-align: center !important;
            margin: 0 !important;
          }

          .printId {
            margin: 0.8mm 0 0 0 !important;
            font-size: 12px !important;
            font-weight: 900 !important;
            line-height: 1.05 !important;
            text-align: center !important;
            word-break: break-word !important;
            max-width: 100% !important;
          }

          .printSpecies,
          .printMeta,
          .printContainer {
            margin: 0.6mm 0 0 0 !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 1.05 !important;
            text-align: center !important;
            max-width: 100% !important;
          }

          .printInstructions {
            width: 100% !important;
            height: 28mm !important;
            margin: 5mm 0 0 0 !important;
            padding: 3.2mm 6mm !important;
            box-sizing: border-box !important;
            border: 1.2px solid #111 !important;
            border-radius: 5mm !important;
            display: grid !important;
            grid-template-columns: 10mm 1fr 58mm !important;
            column-gap: 4mm !important;
            align-items: center !important;
            background: white !important;
            color: #000 !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .printIcon {
            font-size: 19px !important;
            font-weight: 900 !important;
            line-height: 1 !important;
            text-align: center !important;
          }

          .printText {
            min-width: 0 !important;
          }

          .printTitle {
            font-size: 13px !important;
            font-weight: 900 !important;
            line-height: 1.1 !important;
            margin: 0 0 2mm 0 !important;
            letter-spacing: 0.1px !important;
          }

          .printCheck {
            font-size: 10.5px !important;
            font-weight: 700 !important;
            line-height: 1.2 !important;
            margin: 0.7mm 0 0 0 !important;
            white-space: nowrap !important;
          }

          .printCheck::before {
            content: '✓';
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 3mm !important;
            height: 3mm !important;
            margin-right: 1mm !important;
            border-radius: 50% !important;
            background: #2f9e44 !important;
            color: white !important;
            font-size: 8px !important;
            font-weight: 900 !important;
            line-height: 1 !important;
          }

          .printDiagram {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
          }

          .dimTop {
            width: 38mm !important;
            text-align: center !important;
            padding-bottom: 1.5mm !important;
            border-bottom: 1px solid #111 !important;
            position: relative !important;
            margin-bottom: 1.5mm !important;
          }

          .diagramRow {
            display: flex !important;
            align-items: center !important;
            gap: 2mm !important;
          }

          .diagramBox {
            width: 38mm !important;
            height: 19mm !important;
            border: 1px solid #111 !important;
            border-radius: 2mm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 10px !important;
            line-height: 1.15 !important;
          }

          .diagramBox strong {
            font-size: 11px !important;
            font-weight: 900 !important;
            margin-top: 1mm !important;
          }

          .dimSide {
            height: 19mm !important;
            display: flex !important;
            align-items: center !important;
            padding-left: 2mm !important;
            border-left: 1px solid #111 !important;
            font-size: 10px !important;
            white-space: nowrap !important;
          }
        }
      `}</style>
    </main>
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
