'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API = '/api/sitrap';
const BASE_URL = 'https://sitrap-dashboard-web-73p9.vercel.app';

export default function PrintQrLotePage() {
  return (
    <Suspense fallback={<div className="loading">Preparando hoja A4...</div>}>
      <PrintQrLoteContent />
    </Suspense>
  );
}

function PrintQrLoteContent() {
  const searchParams = useSearchParams();
  const loteIdParam = searchParams.get('id') || '';

  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [printed, setPrinted] = useState(false);

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

  const lote = useMemo(() => {
    if (!lotes.length) return null;

    return (
      lotes.find((l) => String(l.ID_Lote_SITRAP || '') === loteIdParam) ||
      lotes[0] ||
      null
    );
  }, [lotes, loteIdParam]);

  const loteId = lote?.ID_Lote_SITRAP || loteIdParam || '';
  const qrUrl = loteId ? `${BASE_URL}/lote?id=${encodeURIComponent(loteId)}` : '';
  const qrImage = loteId
    ? `https://quickchart.io/qr?size=900&margin=1&text=${encodeURIComponent(qrUrl)}`
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

  useEffect(() => {
    if (!loading && lote && qrLoaded && !printed) {
      setPrinted(true);
      const timer = window.setTimeout(() => window.print(), 500);
      return () => window.clearTimeout(timer);
    }
  }, [loading, lote, qrLoaded, printed]);

  const etiquetas = Array.from({ length: 6 });

  if (loading) {
    return <div className="loading">Preparando hoja A4...</div>;
  }

  if (!lote) {
    return (
      <div className="loading">
        No se encontró el lote solicitado.
      </div>
    );
  }

  return (
    <>
      <div className="screenToolbar">
        <button onClick={() => window.print()}>
          Imprimir hoja A4
        </button>
        <span>
          Recomendado: A4 · escala 100% · márgenes mínimos · sin encabezado/pie.
        </span>
      </div>

      <main className="pageWrap">
        <section className="sheet">
          <div className="sheetBorder">
            <div className="labelGrid">
              {etiquetas.map((_, i) => (
                <article className="labelCard" key={i}>
                  <div className="qrArea">
                    {qrImage && (
                      <img
                        src={qrImage}
                        alt="QR Lote SITRAP"
                        onLoad={() => setQrLoaded(true)}
                      />
                    )}
                  </div>

                  <div className="divider" />

                  <div className="labelText">
                    <div className="brand">SITRAP</div>
                    <div className="id">{loteId}</div>
                    <div className="species">{especie}</div>
                    <div className="meta">{vivero} - {cantidad} pl.</div>
                    <div className="container">{contenedor}</div>
                  </div>
                </article>
              ))}
            </div>

            <section className="instructions">
              <div className="leftIcon" aria-hidden="true">▣</div>

              <div className="instructionText">
                <div className="instructionTitle">INSTRUCCIONES DE IMPRESIÓN</div>
                <div className="instructionLine"><span>✓</span> Papel: A4</div>
                <div className="instructionLine"><span>✓</span> Escala: 100% (Tamaño real)</div>
                <div className="instructionLine"><span>✓</span> Márgenes: Mínimos</div>
                <div className="instructionLine"><span>✓</span> Se recomienda papel adhesivo A4 (cortar después de imprimir).</div>
              </div>

              <div className="diagram">
                <div className="diagramTop">60 mm</div>
                <div className="diagramBox">
                  <div>Etiqueta</div>
                  <strong>60 x 40 mm</strong>
                </div>
                <div className="diagramSide">40 mm</div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #e5e7eb;
          font-family: Arial, Helvetica, sans-serif;
        }

        .loading {
          padding: 24px;
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
        }

        .screenToolbar {
          width: 210mm;
          margin: 16px auto 10px auto;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .screenToolbar button {
          border: 0;
          border-radius: 8px;
          background: #14532d;
          color: white;
          font-weight: 800;
          padding: 10px 14px;
          cursor: pointer;
        }

        .screenToolbar span {
          font-size: 12px;
          color: #334155;
        }

        .pageWrap {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 24px auto;
        }

        .sheet {
          width: 210mm;
          height: 297mm;
          background: white;
          overflow: hidden;
          padding: 5mm;
        }

        .sheetBorder {
          width: 200mm;
          height: 287mm;
          border: 0.35mm solid #c9c9c9;
          padding: 6mm 7mm 5mm 7mm;
          overflow: hidden;
          background: white;
        }

        .labelGrid {
          display: grid;
          grid-template-columns: 86mm 86mm;
          grid-template-rows: 58mm 58mm 58mm;
          column-gap: 12mm;
          row-gap: 4mm;
          width: 184mm;
          margin: 0 auto;
        }

        .labelCard {
          width: 86mm;
          height: 58mm;
          border: 0.35mm solid #111;
          border-radius: 5mm;
          overflow: hidden;
          padding: 3mm 3mm 2.3mm 3mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
          color: #000;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .qrArea {
          width: 100%;
          height: 33mm;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .qrArea img {
          width: 33mm;
          height: 33mm;
          display: block;
          image-rendering: pixelated;
        }

        .divider {
          width: 100%;
          border-top: 0.32mm solid #111;
          margin: 1.6mm 0 1.3mm 0;
          flex: 0 0 auto;
        }

        .labelText {
          width: 100%;
          text-align: center;
          line-height: 1.08;
          flex: 1 1 auto;
          overflow: hidden;
        }

        .brand {
          font-size: 11pt;
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        .id {
          margin-top: 1mm;
          font-size: 10.5pt;
          font-weight: 900;
          line-height: 1.05;
          white-space: nowrap;
        }

        .species {
          margin-top: 1mm;
          font-size: 9.6pt;
          font-weight: 700;
          line-height: 1.05;
        }

        .meta {
          margin-top: 0.8mm;
          font-size: 9.6pt;
          font-weight: 700;
          line-height: 1.05;
        }

        .container {
          margin-top: 0.8mm;
          font-size: 9.3pt;
          font-weight: 700;
          line-height: 1.05;
        }

        .instructions {
          width: 184mm;
          height: 28mm;
          margin: 5mm auto 0 auto;
          border: 0.35mm solid #111;
          border-radius: 5mm;
          display: grid;
          grid-template-columns: 12mm 1fr 56mm;
          align-items: center;
          padding: 3mm 5mm;
          color: #000;
          background: white;
          overflow: hidden;
        }

        .leftIcon {
          font-size: 18pt;
          font-weight: 900;
          line-height: 1;
          text-align: center;
        }

        .instructionTitle {
          font-size: 11pt;
          font-weight: 900;
          margin-bottom: 2mm;
        }

        .instructionLine {
          font-size: 8.3pt;
          font-weight: 700;
          line-height: 1.25;
          white-space: nowrap;
        }

        .instructionLine span {
          color: #15803d;
          font-weight: 900;
          margin-right: 1.5mm;
        }

        .diagram {
          position: relative;
          width: 52mm;
          height: 22mm;
        }

        .diagramTop {
          position: absolute;
          top: 0;
          left: 8mm;
          width: 31mm;
          text-align: center;
          font-size: 9pt;
          font-weight: 800;
          border-bottom: 0.25mm solid #111;
          padding-bottom: 1mm;
        }

        .diagramTop::before,
        .diagramTop::after {
          content: '';
          position: absolute;
          bottom: -1.4mm;
          width: 0;
          height: 0;
          border-top: 1.2mm solid transparent;
          border-bottom: 1.2mm solid transparent;
        }

        .diagramTop::before {
          left: -0.5mm;
          border-right: 1.8mm solid #111;
        }

        .diagramTop::after {
          right: -0.5mm;
          border-left: 1.8mm solid #111;
        }

        .diagramBox {
          position: absolute;
          left: 8mm;
          bottom: 0;
          width: 32mm;
          height: 15mm;
          border: 0.35mm solid #111;
          border-radius: 2mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 8.5pt;
          line-height: 1.15;
        }

        .diagramBox strong {
          font-size: 10pt;
        }

        .diagramSide {
          position: absolute;
          right: 2mm;
          bottom: 0;
          height: 15mm;
          display: flex;
          align-items: center;
          font-size: 9pt;
          font-weight: 800;
          border-left: 0.25mm solid #111;
          padding-left: 2mm;
        }

        .diagramSide::before,
        .diagramSide::after {
          content: '';
          position: absolute;
          left: -1.25mm;
          width: 0;
          height: 0;
          border-left: 1.2mm solid transparent;
          border-right: 1.2mm solid transparent;
        }

        .diagramSide::before {
          top: -0.3mm;
          border-bottom: 1.8mm solid #111;
        }

        .diagramSide::after {
          bottom: -0.3mm;
          border-top: 1.8mm solid #111;
        }

        @media print {
          html,
          body {
            width: 210mm;
            height: 297mm;
            background: white !important;
            overflow: hidden !important;
          }

          .screenToolbar {
            display: none !important;
          }

          .pageWrap {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          .sheet {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
    </>
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
