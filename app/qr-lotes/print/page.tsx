'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Home, Printer } from 'lucide-react';

const BASE_URL = 'https://sitrap-dashboard-web-73p9.vercel.app';

type PrintData = {
  id: string;
  especie: string;
  vivero: string;
  cantidad: string;
  contenedor: string;
  url: string;
};

export default function PrintQrLotesPage() {
  const [data, setData] = useState<PrintData>({
    id: '',
    especie: '',
    vivero: '',
    cantidad: '',
    contenedor: '',
    url: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const id = params.get('id') || '';
    const especie = params.get('especie') || 'Sin especie';
    const vivero = params.get('vivero') || '-';
    const cantidad = params.get('cantidad') || '0';
    const contenedorParam = params.get('contenedor') || '';
    const contenedor = normalizaContenedorPrint(contenedorParam, id);
    const urlFromParams = params.get('url') || '';

    setData({
      id,
      especie,
      vivero,
      cantidad,
      contenedor,
      url: urlFromParams || (id ? `${BASE_URL}/lote?id=${encodeURIComponent(id)}` : ''),
    });
  }, []);

  const qrImage = useMemo(() => {
    if (!data.url) return '';
    return `https://quickchart.io/qr?size=900&margin=1&text=${encodeURIComponent(data.url)}`;
  }, [data.url]);

  const labels = Array.from({ length: 6 });

  return (
    <main className="root">
      <div className="screenBar">
        <div className="actions">
          <Link href="/qr-lotes" className="btn secondary">
            <ArrowLeft size={17} />
            Volver a QR Lotes
          </Link>

          <Link href="/" className="btn secondary">
            <Home size={17} />
            Inicio
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn primary"
            disabled={!data.id}
          >
            <Printer size={17} />
            Imprimir hoja A4
          </button>
        </div>

        <p className="hint">
          A4 · escala 100% · márgenes mínimos · sin encabezado/pie si el equipo lo permite.
        </p>
      </div>

      <section className="sheet">
        <div className="grid">
          {labels.map((_, index) => (
            <article className="label" key={index}>
              <div className="qrBox">
                {qrImage ? (
                  <img src={qrImage} alt="QR Lote SITRAP" className="qr" />
                ) : (
                  <div className="qrEmpty">QR</div>
                )}
              </div>

              <div className="line" />

              <div className="textBlock">
                <div className="brand">SITRAP</div>
                <div className="id">{data.id || 'ID_Lote_SITRAP'}</div>
                <div className="species">{data.especie}</div>
                <div className="meta">
                  {data.vivero} - {data.cantidad} pl.
                </div>
                <div className="container">{data.contenedor}</div>
              </div>
            </article>
          ))}
        </div>

        <footer className="instructions">
          <div className="info">
            <div className="icon">▣</div>

            <div>
              <div className="title">INSTRUCCIONES DE IMPRESIÓN</div>
              <div className="item"><span>✓</span> Papel: A4</div>
              <div className="item"><span>✓</span> Escala: 100% / Tamaño real</div>
              <div className="item"><span>✓</span> Márgenes: mínimos</div>
              <div className="item"><span>✓</span> Papel adhesivo A4. Cortar cada etiqueta después de imprimir.</div>
            </div>
          </div>

          <div className="diagram">
            <div className="topMeasure">82 mm</div>
            <div className="diagramBox">
              <div>Etiqueta</div>
              <strong>82 x 58 mm</strong>
            </div>
            <div className="sideMeasure">58 mm</div>
          </div>
        </footer>
      </section>

      <style jsx>{`
        .root {
          min-height: 100vh;
          background: #f1f5f9;
          padding: 16px;
          color: #000;
          font-family: Arial, Helvetica, sans-serif;
        }

        .screenBar {
          width: min(190mm, calc(100vw - 24px));
          margin: 0 auto 14px auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          min-height: 42px;
          border-radius: 10px;
          padding: 0 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .primary {
          background: #14532d;
          border-color: #14532d;
          color: white;
        }

        .secondary {
          background: white;
          color: #0f172a;
        }

        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .hint {
          margin: 0;
          color: #475569;
          font-size: 13px;
        }

        .sheet {
          width: 190mm;
          height: 267mm;
          margin: 0 auto;
          box-sizing: border-box;
          background: white;
          border: 1px solid #d0d0d0;
          padding: 7mm 8mm;
          overflow: hidden;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 82mm);
          grid-template-rows: repeat(3, 58mm);
          column-gap: 10mm;
          row-gap: 4mm;
          justify-content: center;
        }

        .label {
          width: 82mm;
          height: 58mm;
          box-sizing: border-box;
          border: 1.5px solid #111;
          border-radius: 6mm;
          padding: 3.2mm 4mm 4mm 4mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .qrBox {
          width: 33mm;
          height: 29mm;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .qr {
          width: 29mm;
          height: 29mm;
          object-fit: contain;
          display: block;
        }

        .qrEmpty {
          width: 29mm;
          height: 29mm;
          border: 1px solid #ddd;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }

        .line {
          width: 100%;
          border-top: 1.25px solid #111;
          margin: 1.5mm 0 1.4mm 0;
        }

        .textBlock {
          width: 100%;
          text-align: center;
          padding-bottom: 1.5mm;
        }

        .brand {
          font-size: 10.5px;
          font-weight: 900;
          line-height: 1.05;
          margin-bottom: 0.7mm;
        }

        .id {
          font-size: 10px;
          font-weight: 900;
          line-height: 1.05;
          margin-bottom: 0.7mm;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .species,
        .meta,
        .container {
          font-size: 9.5px;
          font-weight: 800;
          line-height: 1.08;
          margin-bottom: 0.55mm;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .instructions {
          height: 29mm;
          margin-top: 5mm;
          border: 1.5px solid #111;
          border-radius: 5mm;
          box-sizing: border-box;
          padding: 3.2mm 6mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 7mm;
          overflow: hidden;
        }

        .info {
          display: flex;
          gap: 4mm;
          align-items: flex-start;
        }

        .icon {
          width: 9mm;
          height: 9mm;
          border: 1.3px solid #111;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          margin-top: 2mm;
        }

        .title {
          font-size: 12.5px;
          font-weight: 900;
          margin-bottom: 1.8mm;
        }

        .item {
          font-size: 9.6px;
          font-weight: 800;
          line-height: 1.28;
        }

        .item span {
          display: inline-flex;
          width: 12px;
          height: 12px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #14803c;
          color: white;
          font-size: 8px;
          margin-right: 4px;
        }

        .diagram {
          width: 45mm;
          height: 21mm;
          position: relative;
          flex: 0 0 auto;
        }

        .topMeasure {
          text-align: center;
          font-size: 9px;
          font-weight: 900;
          border-bottom: 1.2px solid #111;
          margin-bottom: 1.4mm;
        }

        .diagramBox {
          width: 32mm;
          height: 14mm;
          border: 1.2px solid #111;
          border-radius: 2mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          margin-left: 4mm;
        }

        .diagramBox strong {
          font-size: 9.5px;
        }

        .sideMeasure {
          position: absolute;
          right: 0;
          top: 9mm;
          font-size: 9px;
          font-weight: 900;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .screenBar {
            display: none !important;
          }

          .root {
            width: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .sheet {
            width: 190mm !important;
            height: 267mm !important;
            margin: 0 auto !important;
            padding: 7mm 8mm !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
    </main>
  );
}

function normalizaContenedorPrint(value: string, loteId: string) {
  const limpio = String(value || '').trim();

  if (
    limpio &&
    limpio.toLowerCase() !== 'contenedor s/i' &&
    limpio.toLowerCase() !== 's/i'
  ) {
    return limpio;
  }

  const partes = String(loteId || '').split('-').filter(Boolean);
  const desdeId = partes.length >= 2 ? partes[partes.length - 2] : '';

  return desdeId || 'Contenedor s/i';
}
