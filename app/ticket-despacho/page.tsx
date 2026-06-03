'use client';

import { useEffect, useState } from 'react';

export default function TicketDespachoPage() {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');

    if (!id) {
      setError('No se indicó ID de despacho');
      setLoading(false);
      return;
    }

    fetch(`/api/sitrap?view=ticket&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok || !data.ticket_encontrado) {
          setError(data.error || 'Ticket no encontrado');
          return;
        }
        setTicket(data.ticket);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Cargando ticket...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  const detalle = ticket.detalle || [];
  const total = ticket.Total_Plantas || 0;

  return (
    <main className="screen">
      <button className="printButton" onClick={() => window.print()}>
        Imprimir ticket
      </button>

      <section className="ticket">
        <div className="center bold">SITRAP - TRIPAN S.A.</div>
        <div className="center title">VIVERO MONTE ARANDA (VMA)</div>
        <div className="sep">==============================</div>

        <div className="center ticketTitle">TICKET DESPACHO A EECC</div>

        <div className="idBox">ID Despacho: {ticket.ID_Despacho}</div>

        <div className="row">▣ Fecha: {formatDate(ticket.Fecha_Movimiento)}</div>
        <div className="row">● Origen: {ticket.Origen}</div>
        <div className="row">▸ Destino: {ticket.Destino}</div>
        <div className="row">● Responsable: {ticket.Responsable}</div>

        <div className="dash">------------------------------</div>
        <div className="center bold">🌱 DETALLE DE DESPACHO 🌱</div>

        <div className="detailHeader">
          <span>Especie</span>
          <span>Cant.</span>
        </div>
        <div className="dash">------------------------------</div>

        {detalle.map((item: any, index: number) => (
          <div key={index} className="item">
            <div className="itemTop">
              <strong>{item.EspecieMaterial || item.Especie || 'Sin especie'}</strong>
              <strong>{formatNumber(item.Cantidad)}</strong>
            </div>
            <div className="lote">
              {item.ID_Lote_SITRAP || item.ID_Final_Lote || 'Sin ID lote'}
            </div>
          </div>
        ))}

        <div className="dash">------------------------------</div>

        <div className="total">
          <span>TOTAL GENERAL</span>
          <span>{formatNumber(total)}</span>
        </div>
        <div className="plantas">plantas</div>

        <div className="dash">------------------------------</div>
        <div className="center bold">🚚 DATOS TRANSPORTE</div>
        <div>Chofer : {ticket.Chofer || '________________'}</div>
        <div>Patente: {ticket.Patente || '________________'}</div>

        <div className="dash">------------------------------</div>
        <div className="center bold">✎ FIRMAS</div>

        <div className="firmas">
          <div>
            <div>Entrega (VMA)</div>
            <br />
            <div>____________</div>
            <div>Nombre:</div>
            <div>Cargo:</div>
          </div>

          <div>
            <div>Recibe (EECC)</div>
            <br />
            <div>____________</div>
            <div>Nombre: {ticket.Recibe || ''}</div>
            <div>Cargo: {ticket.Cargo_Recibe || ''}</div>
          </div>
        </div>

        <div className="dash">------------------------------</div>

        <div className="center bold">ID Despacho: {ticket.ID_Despacho}</div>

        {ticket.QR_Ticket_URL && (
          <div className="center">
            <img className="qr" src={ticket.QR_Ticket_URL} alt="QR Ticket" />
          </div>
        )}

        <div className="center small">Ver trazabilidad completa</div>
        <div className="url">{ticket.URL_Ticket}</div>

        <div className="sep">==============================</div>
      </section>

      <style jsx>{`
        .screen {
          background: #f3f4f6;
          min-height: 100vh;
          padding: 20px 0;
        }

        .printButton {
          display: block;
          margin: 0 auto 12px auto;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          background: #111827;
          color: white;
          font-weight: 700;
        }

        .ticket {
          width: 58mm;
          margin: 0 auto;
          padding: 3mm;
          background: white;
          color: black;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.25;
        }

        .center {
          text-align: center;
        }

        .bold {
          font-weight: 800;
        }

        .title {
          font-size: 13px;
          font-weight: 900;
        }

        .ticketTitle {
          font-size: 13px;
          font-weight: 900;
          margin: 6px 0;
        }

        .sep,
        .dash {
          text-align: center;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
        }

        .idBox {
          background: black;
          color: white;
          border-radius: 4px;
          padding: 4px;
          text-align: center;
          font-weight: 800;
          margin: 5px 0 8px 0;
        }

        .row {
          margin: 3px 0;
        }

        .detailHeader,
        .itemTop,
        .total {
          display: flex;
          justify-content: space-between;
          gap: 6px;
        }

        .item {
          margin: 5px 0;
        }

        .lote {
          font-size: 10px;
          word-break: break-word;
        }

        .total {
          font-size: 14px;
          font-weight: 900;
          margin-top: 5px;
        }

        .plantas {
          text-align: right;
          font-size: 10px;
          font-weight: 700;
        }

        .firmas {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 9px;
          margin-top: 6px;
        }

        .qr {
          width: 34mm;
          height: 34mm;
          margin-top: 6px;
        }

        .small {
          font-size: 9px;
          font-weight: 700;
        }

        .url {
          font-size: 8px;
          text-align: center;
          word-break: break-all;
        }

        @media print {
          .screen {
            background: white;
            padding: 0;
          }

          .printButton {
            display: none;
          }

          .ticket {
            margin: 0;
            width: 58mm;
            padding: 2mm;
          }

          @page {
            size: 58mm auto;
            margin: 0;
          }
        }
      `}</style>
    </main>
  );
}

function formatDate(value: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-CL');
}

function formatNumber(value: any) {
  const n = Number(value || 0);
  return n.toLocaleString('es-CL');
}
