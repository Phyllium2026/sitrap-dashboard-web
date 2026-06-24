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
                    <div className="printInstrLeft">
                      <div className="printInstrHeader">
                        <Printer size={18} />
                        <span>INSTRUCCIONES DE IMPRESIÓN</span>
                      </div>
                      <div>✓ Papel: A4</div>
                      <div>✓ Escala: 100% (Tamaño real)</div>
                      <div>✓ Márgenes: Mínimos</div>
                      <div>✓ Se recomienda papel adhesivo A4 (cortar después de imprimir).</div>
                    </div>

                    <div className="printInstrDiagram">
                      <div className="dimTop">60 mm</div>
                      <div className="miniLabel">
                        <div>Etiqueta</div>
                        <strong>60 x 40 mm</strong>
                      </div>
                      <div className="dimSide">40 mm</div>
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
            margin: 7mm;
          }

          html,
          body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          .screenPreview {
            display: none !important;
          }

          main {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          main > div,
          main > div > div,
          section {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          section:first-of-type {
            display: none !important;
          }

          .printSheet {
            display: block !important;
            width: 190mm;
            height: 283mm;
            margin: 0 auto !important;
            padding: 4mm 0 0 0;
            box-sizing: border-box;
            background: white !important;
            overflow: hidden !important;
            page-break-after: avoid;
            page-break-before: avoid;
          }

          .printGrid {
            display: grid !important;
            grid-template-columns: repeat(2, 82mm);
            grid-template-rows: repeat(3, 52mm);
            column-gap: 14mm;
            row-gap: 4mm;
            justify-content: center;
            align-content: start;
          }

          .printLabel {
            width: 82mm;
            height: 52mm;
            box-sizing: border-box;
            border: 1.3px solid #111;
            border-radius: 5mm;
            padding: 3mm 2mm 2.2mm 2mm;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            overflow: hidden;
            break-inside: avoid;
            page-break-inside: avoid;
            font-family: Arial, sans-serif;
            color: #000;
            background: white;
          }

          .printQrBox {
            width: 100%;
            height: 28mm;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
          }

          .printQrBox img {
            width: 28mm;
            height: 28mm;
            display: block;
          }

          .printLine {
            width: 100%;
            border-top: 1px solid #555;
            margin: 1.4mm 0 1.1mm 0;
            flex: 0 0 auto;
          }

          .printBrand {
            font-size: 10.5pt;
            font-weight: 900;
            line-height: 1.05;
            text-align: center;
          }

          .printId {
            margin-top: 0.6mm;
            font-size: 10.5pt;
            font-weight: 900;
            line-height: 1.05;
            text-align: center;
            word-break: break-word;
          }

          .printSpecies {
            margin-top: 0.6mm;
            font-size: 9.5pt;
            font-weight: 700;
            line-height: 1.05;
            text-align: center;
          }

          .printMeta {
            margin-top: 0.6mm;
            font-size: 9.5pt;
            font-weight: 700;
            line-height: 1.05;
            text-align: center;
          }

          .printContainer {
            margin-top: 0.6mm;
            font-size: 9.5pt;
            font-weight: 700;
            line-height: 1.05;
            text-align: center;
          }

          .printInstructions {
            width: 164mm;
            height: 29mm;
            margin: 6mm auto 0 auto;
            padding: 3.5mm 6mm;
            box-sizing: border-box;
            border: 1.2px solid #111;
            border-radius: 5mm;
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            gap: 8mm;
            font-family: Arial, sans-serif;
            color: #000;
            background: white;
            overflow: hidden;
          }

          .printInstrLeft {
            font-size: 8.6pt;
            font-weight: 700;
            line-height: 1.28;
          }

          .printInstrHeader {
            display: flex;
            align-items: center;
            gap: 3mm;
            margin-bottom: 1.8mm;
            font-size: 10pt;
            font-weight: 900;
          }

          .printInstrHeader svg {
            width: 6mm;
            height: 6mm;
            stroke-width: 3;
          }

          .printInstrDiagram {
            position: relative;
            width: 47mm;
            height: 22mm;
            flex: 0 0 47mm;
            font-family: Arial, sans-serif;
            color: #000;
          }

          .miniLabel {
            position: absolute;
            left: 6mm;
            top: 5mm;
            width: 32mm;
            height: 14mm;
            border: 1px solid #111;
            border-radius: 2mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 7.8pt;
            line-height: 1.15;
            text-align: center;
          }

          .dimTop {
            position: absolute;
            left: 6mm;
            top: 0;
            width: 32mm;
            text-align: center;
            font-size: 8pt;
            font-weight: 700;
            border-bottom: 1px solid #111;
            padding-bottom: 0.5mm;
          }

          .dimSide {
            position: absolute;
            right: 0;
            top: 8mm;
            height: 10mm;
            font-size: 8pt;
            font-weight: 700;
            display: flex;
            align-items: center;
            border-left: 1px solid #111;
            padding-left: 1.5mm;
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
