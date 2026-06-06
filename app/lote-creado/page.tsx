'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle,
  ImageDown,
  Share2,
} from 'lucide-react';

const BASE_URL = 'https://sitrap-dashboard-web-73p9.vercel.app';

export default function LoteCreadoPage() {
  const [id, setId] = useState('');
  const [lote, setLote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search);
        const loteId = params.get('id') || '';

        if (!loteId) {
          setError('No se recibió ID_Lote_SITRAP.');
          return;
        }

        setId(loteId);

        const r = await fetch(`/api/sitrap?view=lote&id=${encodeURIComponent(loteId)}`, {
          cache: 'no-store',
        });

        const data = await r.json();

        if (!data.ok || !data.lote) {
          setError('No se encontró información del lote.');
          return;
        }

        setLote(data.lote);
      } catch {
        setError('No fue posible cargar el lote creado.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function generarPNGDataUrl() {
    const etiqueta = document.querySelector('#etiqueta-zebra') as HTMLElement;
    if (!etiqueta) return null;

    const { toPng } = await import('html-to-image');

    return await toPng(etiqueta, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    });
  }

  async function descargarPNG() {
    const dataUrl = await generarPNGDataUrl();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `Etiqueta-${id}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function compartirEtiqueta() {
    try {
      const dataUrl = await generarPNGDataUrl();
      if (!dataUrl) return;

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const file = new File([blob], `Etiqueta-${id}.png`, {
        type: 'image/png',
      });

      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
        share?: (data: {
          files?: File[];
          title?: string;
          text?: string;
        }) => Promise<void>;
      };

      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: `Etiqueta SITRAP ${id}`,
          text: `Etiqueta QR del lote ${id}`,
        });
        return;
      }

      const link = document.createElement('a');
      link.download = `Etiqueta-${id}.png`;
      link.href = dataUrl;
      link.click();

      alert('Este dispositivo no permite compartir directamente. Se descargó el PNG.');
    } catch (error) {
      console.error(error);
      alert('No fue posible compartir la etiqueta.');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-5">
        <p>Cargando lote creado...</p>
      </main>
    );
  }

  if (error || !lote) {
    return (
      <main className="min-h-screen bg-slate-50 p-5">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-red-700">Error</h1>
          <p className="mt-2 text-slate-600">{error}</p>

          <Link
            href="/"
            className="mt-5 block rounded-2xl bg-[#14532d] px-4 py-3 text-center font-bold text-white"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const loteId = lote.ID_Lote_SITRAP || id;
  const especie = lote.EspecieMaterial || 'Sin especie';
  const vivero = lote.Vivero || 'Sin vivero';
  const cantidad =
    lote.CantidadInicialP_Corregida ||
    lote.CantidadInicialP ||
    lote.StockActual ||
    lote.Stock ||
    0;

  const loteUrl = `${BASE_URL}/lote?id=${encodeURIComponent(loteId)}`;
  const qrImage = `https://quickchart.io/qr?size=260&text=${encodeURIComponent(loteUrl)}`;

  return (
    <main className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#14532d]">
              <CheckCircle size={22} />
              <span className="text-sm font-black uppercase">Lote creado</span>
            </div>

            <h1 className="text-2xl font-black text-[#14532d]">QR del lote</h1>

            <p className="text-sm text-slate-500">
              Etiqueta lista para imprimir y pegar en bandeja
            </p>
          </div>

          <Link href="/" className="rounded-xl border bg-white px-4 py-2 text-sm font-bold">
            <ArrowLeft size={16} className="inline" /> Inicio
          </Link>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">
              ID_Lote_SITRAP
            </p>
            <p className="mt-1 break-words text-lg font-black text-[#14532d]">
              {loteId}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 text-sm">
            <Info label="Especie" value={especie} />
            <Info label="Vivero" value={vivero} />
            <Info
              label="Cantidad"
              value={`${Number(cantidad || 0).toLocaleString('es-CL')} plantas`}
            />
          </div>

          <div className="mb-5 flex justify-center">
            <img
              src={qrImage}
              alt="QR lote SITRAP"
              className="h-52 w-52 rounded-2xl border bg-white p-2"
            />
          </div>

          <div id="etiqueta-zebra" className="label">
            <div className="qrBox">
              <img src={qrImage} alt="QR etiqueta" className="qr" />
            </div>

            <div className="labelInfo">
              <div className="brand">SITRAP</div>
              <div className="id">{loteId}</div>
              <div className="species">{especie}</div>
              <div className="meta">
                {shortVivero(vivero)} · {Number(cantidad || 0).toLocaleString('es-CL')} pl.
              </div>
            </div>
          </div>

          <div className="no-print mt-5 grid gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#14532d] px-4 py-3 font-bold text-white"
            >
              <Printer size={18} />
              Imprimir etiqueta
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#14532d] px-4 py-3 font-bold text-[#14532d]"
            >
              <Download size={18} />
              Descargar PDF etiqueta
            </button>

            <button
              onClick={descargarPNG}
              className="flex items-center justify-center gap-2 rounded-2xl border border-blue-600 px-4 py-3 font-bold text-blue-600"
            >
              <ImageDown size={18} />
              Descargar PNG Zebra
            </button>

            <button
              onClick={compartirEtiqueta}
              className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-600 px-4 py-3 font-bold text-emerald-600"
            >
              <Share2 size={18} />
              Compartir etiqueta
            </button>

            <Link
              href="/"
              className="rounded-2xl bg-slate-100 px-4 py-3 text-center font-bold text-slate-700"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>

      <style jsx>{`
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

        @media print {
          body {
            margin: 0;
            background: white;
          }

          .no-print,
          main > div > div,
          section > div:not(.label) {
            display: none !important;
          }

          main {
            padding: 0 !important;
            background: white !important;
          }

          .label {
            width: 60mm;
            height: 40mm;
            border: none;
            page-break-after: always;
          }

          @page {
            size: 60mm 40mm;
            margin: 0;
          }
        }
      `}</style>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-base font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function shortVivero(value: any) {
  const v = String(value || '').trim();

  if (v.includes('Monte Aranda')) return 'VMA';
  if (v.includes('Sagrada Familia')) return 'VSF';
  if (v.includes('Quilimarí')) return 'VQ';

  return v || '-';
}
