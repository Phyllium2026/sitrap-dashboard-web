'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Home, Printer } from 'lucide-react';

type PrintData = {
  id: string;
  especie: string;
  vivero: string;
  cantidad: string;
  contenedor: string;
  url: string;
};

const EMPTY_DATA: PrintData = {
  id: '',
  especie: 'Sin especie',
  vivero: '-',
  cantidad: '0',
  contenedor: 'Contenedor s/i',
  url: '',
};

export default function PrintQrLotesPage() {
  const [data, setData] = useState<PrintData>(EMPTY_DATA);
  const [qrReady, setQrReady] = useState(false);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setData({
      id: params.get('id') || '',
      especie: params.get('especie') || 'Sin especie',
      vivero: params.get('vivero') || '-',
      cantidad: params.get('cantidad') || '0',
      contenedor: params.get('contenedor') || 'Contenedor s/i',
      url: params.get('url') || '',
    });
  }, []);

  const qrImage = useMemo(() => {
    if (!data.url) return '';
    return `https://quickchart.io/qr?format=svg&size=900&margin=1&text=${encodeURIComponent(data.url)}`;
  }, [data.url]);

  const labels = Array.from({ length: 6 });

  function imprimir() {
    window.print();
  }

  return (
    <main className="root">
      <nav className="toolbar" aria-label="Acciones de impresión">
        <div className="toolbarLeft">
          <Link href="/qr-lotes" className="toolbarLink">
            <ArrowLeft size={17} />
            Volver a QR Lotes
          </Link>

          <Link href="/" className="toolbarLink secondary">
            <Home size={17} />
            Inicio
          </Link>
        </div>

        <button type="button" onClick={imprimir} disabled={!data.id || !qrReady || qrError}>
          <Printer size={18} />
          Imprimir hoja A4
        </button>
      </nav>

      {!qrReady && !qrError && data.id && (
        <div className="screenNotice">
          Cargando QR. Cuando el QR esté visible, se habilitará el botón imprimir.
        </div>
      )}

      {qrError && (
        <div className="screenNotice error">
          No se pudo cargar el QR. Revisa conexión o vuelve a abrir esta hoja desde QR Lotes.
        </div>
      )}

      <section className="sheet" aria-label="Hoja A4 de etiquetas QR SITRAP">
        <div className="labelsGrid">
          {labels.map((_, index) => (
            <article className="label" key={index}>
              <div className="qrWrap">
                {qrImage && (
                  <img
                    src={qrImage}
                    alt="QR Lote SITRAP"
                    className="qr"
                    onLoad={() => setQrReady(true)}
                    onError={() => {
                      setQrReady(false);
                      setQrError(true);
                    }}
                  />
                )}
              </div>

              <div className="divider" />
              <div className="brand">SITRAP</div>
              <div className="id">{data.id}</div>
              <div className="species">{data.especie}</div>
              <div className="meta">{data.vivero} · {data.cantidad} pl.</div>
              <div className="containerText">{data.contenedor}</div>
            </article>
          ))}
        </div>

        <footer className="instructions">
          <div className="printerMark">▣</div>

          <div>
            <div className="instructionTitle">INSTRUCCIONES DE IMPRESIÓN</div>
            <div className="instructionRow">✓ Papel: A4</div>
            <div className="instructionRow">✓ Escala: 100% / Tamaño real</div>
            <div className="instructionRow">✓ Márgenes: mínimos</div>
            <div className="instructionRow">✓ Papel adhesivo A4. Cortar cada etiqueta después de imprimir.</div>
          </div>

          <div className="diagram" aria-hidden="true">
            <div className="topMeasure">90 mm</div>
            <div className="miniLabel">Etiqueta<br />90 x 58 mm</div>
            <div className="sideMeasure">58 mm</div>
          </div>
        </footer>
      </section>

      <style jsx>{`
        :global(html),
        :global(body) {
          margin: 0;
          padding: 0;
          background: #e5e7eb;
        }

        .root {
          min-height: 100vh;
          padding: 14px;
          box-sizing: border-box;
          background: #e5e7eb;
          color: #000;
          font-family: Arial, Helvetica, sans-serif;
        }

        .toolbar {
          width: min(100%, 210mm);
          margin: 0 auto 12px auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbarLeft {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .toolbarLink,
        .toolbar button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          border-radius: 10px;
          padding: 0 15px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          box-sizing: border-box;
        }

        .toolbarLink {
          background: white;
          color: #14532d;
          border: 1px solid #cbd5e1;
        }

        .toolbarLink.secondary {
          color: #334155;
        }

        .toolbar button {
          border: 0;
          background: #14532d;
          color: white;
          cursor: pointer;
        }

        .toolbar button:disabled {
          opacity: 0.45;
          cursor: wait;
        }

        .screenNotice {
          width: min(100%, 210mm);
          margin: 0 auto 10px auto;
          color: #92400e;
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: 10px;
          padding: 10px 12px;
          box-sizing: border-box;
          font-size: 13px;
          font-weight: 700;
        }

        .screenNotice.error {
          color: #991b1b;
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .sheet {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #cbd5e1;
          box-sizing: border-box;
          padding: 8mm 8mm 7mm 8mm;
          overflow: hidden;
        }

        .labelsGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(3, 58mm);
          column-gap: 8mm;
          row-gap: 5mm;
        }

        .label {
          height: 58mm;
          border: 1.35px solid #111;
          border-radius: 6mm;
          box-sizing: border-box;
          padding: 3mm 4mm 2.5mm 4mm;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .qrWrap {
          width: 100%;
          height: 34mm;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .qr {
          width: 34mm;
          height: 34mm;
          object-fit: contain;
          display: block;
        }

        .divider {
          width: 100%;
          border-top: 1.15px solid #111;
          margin: 1.8mm 0 1.2mm 0;
          flex: 0 0 auto;
        }

        .brand {
          font-size: 12.5px;
          font-weight: 900;
          line-height: 1;
          text-align: center;
        }

        .id {
          margin-top: 0.8mm;
          max-width: 100%;
          font-size: 11.5px;
          font-weight: 900;
          line-height: 1.05;
          text-align: center;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .species,
        .meta,
        .containerText {
          margin-top: 0.55mm;
          max-width: 100%;
          font-size: 10.5px;
          font-weight: 700;
          line-height: 1.05;
          text-align: center;
          overflow-wrap: anywhere;
        }

        .instructions {
          height: 31mm;
          margin-top: 6mm;
          border: 1.35px solid #111;
          border-radius: 5mm;
          box-sizing: border-box;
          padding: 3.2mm 6mm;
          display: grid;
          grid-template-columns: 10mm 1fr 56mm;
          gap: 5mm;
          align-items: center;
          overflow: hidden;
        }

        .printerMark {
          font-size: 20px;
          font-weight: 900;
          text-align: center;
        }

        .instructionTitle {
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 1.5mm;
          line-height: 1;
        }

        .instructionRow {
          font-size: 10.5px;
          font-weight: 800;
          line-height: 1.35;
        }

        .diagram {
          position: relative;
          height: 22mm;
        }

        .miniLabel {
          position: absolute;
          left: 6mm;
          top: 5mm;
          width: 36mm;
          height: 15mm;
          border: 1.2px solid #111;
          border-radius: 2mm;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 10.5px;
          font-weight: 900;
          line-height: 1.15;
        }

        .topMeasure {
          position: absolute;
          left: 6mm;
          top: 0;
          width: 36mm;
          border-top: 1px solid #111;
          text-align: center;
          font-size: 9.5px;
          font-weight: 800;
          line-height: 1.4;
        }

        .sideMeasure {
          position: absolute;
          right: 2mm;
          top: 8mm;
          font-size: 9.5px;
          font-weight: 800;
        }

        @media screen and (max-width: 820px) {
          .root {
            overflow-x: auto;
            padding: 10px;
          }

          .sheet {
            margin-left: 0;
            margin-right: 0;
          }
        }

        @page {
          size: A4 portrait;
          margin: 6mm;
        }

        @media print {
          :global(html),
          :global(body) {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          .root {
            width: 198mm;
            height: 285mm;
            min-height: 0;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          .toolbar,
          .screenNotice {
            display: none !important;
          }

          .sheet {
            width: 198mm !important;
            height: 285mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: hidden !important;
            page-break-before: avoid;
            page-break-after: avoid;
          }

          .labelsGrid {
            grid-template-rows: repeat(3, 58mm) !important;
            column-gap: 8mm !important;
            row-gap: 5mm !important;
          }

          .label,
          .instructions {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}
