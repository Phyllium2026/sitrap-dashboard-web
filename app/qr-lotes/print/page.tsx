'use client';

import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function PrintQrLotesPage() {
  const searchParams = useSearchParams();
  const [qrOk, setQrOk] = useState(false);

  const id = searchParams.get('id') || '';
  const especie = searchParams.get('especie') || 'Sin especie';
  const vivero = searchParams.get('vivero') || '-';
  const cantidad = searchParams.get('cantidad') || '0';
  const contenedor = searchParams.get('contenedor') || 'Contenedor s/i';
  const url = searchParams.get('url') || '';

  const qrImage = useMemo(() => {
    if (!url) return '';
    return `https://quickchart.io/qr?size=520&margin=1&text=${encodeURIComponent(url)}`;
  }, [url]);

  const etiquetas = Array.from({ length: 6 });

  function imprimir() {
    window.print();
  }

  return (
    <main className="printRoot">
      <div className="toolbar">
        <button type="button" onClick={imprimir} disabled={!qrOk}>
          <Printer size={18} />
          Imprimir hoja A4
        </button>
        <span>
          Recomendado: A4 · escala 100% · márgenes mínimos · sin encabezado/pie.
        </span>
      </div>

      <section className="sheet" aria-label="Hoja A4 etiquetas QR SITRAP">
        <div className="labelsGrid">
          {etiquetas.map((_, index) => (
            <article className="label" key={index}>
              <div className="qrWrap">
                {qrImage && (
                  <img
                    src={qrImage}
                    alt=""
                    className="qr"
                    onLoad={() => setQrOk(true)}
                  />
                )}
              </div>
              <div className="line" />
              <div className="brand">SITRAP</div>
              <div className="lotId">{id}</div>
              <div className="species">{especie}</div>
              <div className="meta">{vivero} - {cantidad} pl.</div>
              <div className="containerText">{contenedor}</div>
            </article>
          ))}
        </div>

        <footer className="instructions">
          <div className="iconBox">▣</div>
          <div className="instructionText">
            <div className="title">INSTRUCCIONES DE IMPRESIÓN</div>
            <div className="row">✓ Papel: A4</div>
            <div className="row">✓ Escala: 100% / Tamaño real</div>
            <div className="row">✓ Márgenes: mínimos</div>
            <div className="row">✓ Se recomienda papel adhesivo A4 y cortar después de imprimir.</div>
          </div>
          <div className="diagram">
            <div className="measureTop">60 mm</div>
            <div className="miniLabel">Etiqueta<br />60 x 40 mm</div>
            <div className="measureSide">40 mm</div>
          </div>
        </footer>
      </section>

      <style jsx>{`
        .printRoot {
          min-height: 100vh;
          background: #e5e7eb;
          padding: 24px;
          font-family: Arial, Helvetica, sans-serif;
          color: #000;
        }

        .toolbar {
          max-width: 210mm;
          margin: 0 auto 16px auto;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #475569;
          font-size: 14px;
        }

        .toolbar button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          border-radius: 10px;
          background: #14532d;
          color: white;
          padding: 12px 18px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .toolbar button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .sheet {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: white;
          box-sizing: border-box;
          padding: 8mm 10mm 6mm 10mm;
          border: 1px solid #cbd5e1;
          overflow: hidden;
        }

        .labelsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: repeat(3, 68mm);
          column-gap: 9mm;
          row-gap: 4mm;
        }

        .label {
          height: 68mm;
          box-sizing: border-box;
          border: 1.25px solid #111;
          border-radius: 6mm;
          padding: 4mm 4mm 3mm 4mm;
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
          height: 38mm;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .qr {
          width: 38mm;
          height: 38mm;
          display: block;
          object-fit: contain;
        }

        .line {
          width: 100%;
          border-top: 1px solid #111;
          margin: 2mm 0 2mm 0;
        }

        .brand {
          font-size: 15px;
          font-weight: 900;
          line-height: 1;
          text-align: center;
        }

        .lotId {
          margin-top: 1.2mm;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.05;
          text-align: center;
          max-width: 100%;
          word-break: break-word;
        }

        .species,
        .meta,
        .containerText {
          margin-top: 1mm;
          font-size: 12.5px;
          font-weight: 700;
          line-height: 1.05;
          text-align: center;
        }

        .instructions {
          height: 30mm;
          margin-top: 5mm;
          box-sizing: border-box;
          border: 1.25px solid #111;
          border-radius: 5mm;
          padding: 4mm 6mm;
          display: grid;
          grid-template-columns: 11mm 1fr 58mm;
          gap: 5mm;
          align-items: center;
          overflow: hidden;
        }

        .iconBox {
          font-size: 22px;
          font-weight: 900;
          text-align: center;
        }

        .title {
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 2mm;
        }

        .row {
          font-size: 10.5px;
          font-weight: 700;
          line-height: 1.35;
        }

        .diagram {
          position: relative;
          height: 22mm;
        }

        .measureTop {
          position: absolute;
          top: 0;
          left: 12mm;
          width: 33mm;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          border-bottom: 1px solid #111;
        }

        .miniLabel {
          position: absolute;
          left: 13mm;
          top: 6mm;
          width: 32mm;
          height: 15mm;
          border: 1px solid #111;
          border-radius: 2mm;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.1;
        }

        .measureSide {
          position: absolute;
          left: 48mm;
          top: 10mm;
          font-size: 10px;
          font-weight: 700;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          .printRoot {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          .toolbar {
            display: none !important;
          }

          .sheet {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 8mm 10mm 6mm 10mm !important;
            border: none !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
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
