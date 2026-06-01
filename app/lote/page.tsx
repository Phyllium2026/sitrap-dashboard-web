import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  FileSearch,
  Leaf,
  QrCode,
} from 'lucide-react';

const FORM_E2_BASE =
  'https://docs.google.com/forms/d/e/1FAIpQLSfQ3yuIk_Z2I_jvzhBX33sr8rNf_iFvNwiqujYJRaZFU8YKw/viewform?usp=pp_url&entry.999239179=';

function clean(value: string | string[] | undefined) {
  if (!value) return '';
  if (Array.isArray(value)) return value[0] || '';
  return value;
}

export default function LotePage({
  searchParams,
}: {
  searchParams?: { lote?: string | string[]; id?: string | string[] };
}) {
  const lote = clean(searchParams?.lote || searchParams?.id);
  const formMovimiento = `${FORM_E2_BASE}${encodeURIComponent(lote)}`;

  return (
    <main className="min-h-screen bg-[#f7f9f6] px-4 py-5 text-slate-900">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col">
        <header className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#14532d] shadow-sm ring-1 ring-slate-100"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>

          <div className="flex items-center gap-2 rounded-full bg-[#14532d] px-3 py-2 text-sm font-black text-white">
            <Leaf size={16} />
            SITRAP
          </div>
        </header>

        <section className="rounded-[30px] bg-gradient-to-br from-[#14532d] via-[#166534] to-[#0b3d22] p-5 text-white shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12">
            <QrCode size={30} />
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-green-100">
            QR leído correctamente
          </p>

          <h1 className="mt-2 text-2xl font-black leading-tight">
            Menú del lote
          </h1>

          <div className="mt-4 rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wide text-green-100">
              ID_Lote_SITRAP
            </p>
            <p className="mt-1 break-words text-lg font-black">
              {lote || 'Sin lote detectado'}
            </p>
          </div>
        </section>

        {!lote && (
          <section className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            No se recibió parámetro de lote en la URL. El QR debe apuntar a:
            <br />
            <span className="font-black">/lote?lote=ID_LOTE_SITRAP</span>
          </section>
        )}

        <section className="mt-4 space-y-3">
          <a
            href={formMovimiento}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between rounded-2xl p-4 shadow-sm ${
              lote
                ? 'bg-white text-slate-900 ring-1 ring-slate-100'
                : 'pointer-events-none bg-slate-100 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-[#166534]">
                <ClipboardList size={22} />
              </div>
              <div>
                <p className="text-[15px] font-black">Registrar movimiento</p>
                <p className="text-[12px] text-slate-500">
                  Abre E2 con el lote precargado
                </p>
              </div>
            </div>
            <span className="text-xl font-black text-[#14532d]">›</span>
          </a>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left text-slate-900 shadow-sm ring-1 ring-slate-100"
            disabled
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <FileSearch size={22} />
              </div>
              <div>
                <p className="text-[15px] font-black">Ver ficha del lote</p>
                <p className="text-[12px] text-slate-500">
                  Reservado para Sprint ficha técnica
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
              Próximo
            </span>
          </button>
        </section>

        <footer className="mt-auto pt-5 text-center text-[11px] font-semibold text-slate-400">
          SITRAP · Sistema de Inventario y Trazabilidad de Plantas
        </footer>
      </section>
    </main>
  );
}
