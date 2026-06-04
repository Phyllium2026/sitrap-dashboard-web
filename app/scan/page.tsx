'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, AlertTriangle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Iniciando cámara...');

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            if (!mounted) return;

            setStatus('QR leído. Abriendo lote...');

            try {
              await scanner.stop();
              await scanner.clear();
            } catch {}

            if (decodedText.includes('/lote?id=')) {
              window.location.href = decodedText;
              return;
            }

            const loteId = extractLoteId(decodedText);

            if (loteId) {
              window.location.href = `/lote?id=${encodeURIComponent(loteId)}`;
              return;
            }

            setError('QR leído, pero no corresponde a un lote SITRAP.');
          },
          () => {
            // lectura fallida normal, no mostrar error
          }
        );

        setStatus('Apunta la cámara al QR de la bandeja');
      } catch (err) {
        setError('No fue posible abrir la cámara. Revisa permisos del navegador.');
      }
    }

    startScanner();

    return () => {
      mounted = false;

      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">Escanear QR</h1>
            <p className="text-sm text-slate-300">Bandejas SITRAP</p>
          </div>

          <Link
            href="/"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft size={16} className="inline" /> Inicio
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-black p-2">
          <div id="qr-reader" className="w-full" />
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 p-4">
          <div className="flex items-center gap-2">
            {error ? <AlertTriangle size={18} /> : <Camera size={18} />}
            <p className="font-bold">{error ? 'Error' : 'Estado'}</p>
          </div>

          <p className="mt-2 text-sm text-slate-200">
            {error || status}
          </p>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Permite acceso a la cámara cuando el navegador lo solicite.
        </p>
      </div>
    </main>
  );
}

function extractLoteId(value: string) {
  try {
    const url = new URL(value);
    return url.searchParams.get('id') || '';
  } catch {}

  if (value.includes('ID_Lote_SITRAP=')) {
    return value.split('ID_Lote_SITRAP=')[1]?.split('&')[0] || '';
  }

  if (value.includes('id=')) {
    return value.split('id=')[1]?.split('&')[0] || '';
  }

  return '';
}
