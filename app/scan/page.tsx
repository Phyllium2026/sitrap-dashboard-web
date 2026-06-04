'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, AlertTriangle } from 'lucide-react';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Iniciando cámara...');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let detector: any = null;

    async function start() {
      try {
        if (!('BarcodeDetector' in window)) {
          setError('Este navegador no soporta lectura QR directa. Usa Chrome o la cámara del iPhone.');
          return;
        }

        detector = new (window as any).BarcodeDetector({
          formats: ['qr_code'],
        });

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('Apunta la cámara al QR de la bandeja');

        const scanLoop = async () => {
          if (stopped || !videoRef.current) return;

          try {
            const codes = await detector.detect(videoRef.current);

            if (codes.length > 0) {
              const value = codes[0].rawValue;

              stopped = true;
              stream?.getTracks().forEach((t) => t.stop());

              if (value.includes('/lote?id=')) {
                window.location.href = value;
                return;
              }

              if (value.includes('ID_Lote_SITRAP=')) {
                window.location.href = value;
                return;
              }

              setError('QR leído, pero no corresponde a un lote SITRAP.');
              return;
            }
          } catch {
            // sigue escaneando
          }

          requestAnimationFrame(scanLoop);
        };

        scanLoop();
      } catch {
        setError('No fue posible abrir la cámara. Revisa permisos del navegador.');
      }
    }

    start();

    return () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
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

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-black">
          <video
            ref={videoRef}
            className="h-[420px] w-full object-cover"
            playsInline
            muted
          />
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
          Si no abre la cámara, usa la cámara nativa del iPhone para escanear el QR.
        </p>

      </div>
    </main>
  );
}
