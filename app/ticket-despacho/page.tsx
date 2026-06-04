'use client';

import { useEffect, useState } from 'react';

export default function TicketDespachoPage() {
  const [ticket, setTicket] = useState<any>(null);
  const [idUsado, setIdUsado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    async function cargarTicket() {
      try {
        setLoading(true);

        const params = new URLSearchParams(window.location.search);
        let id = params.get('id');

        if (!id) {
          const ultimo = await fetch('/api/sitrap?view=ultimo-ticket', { cache: 'no-store' }).then((r) => r.json());

          if (!ultimo.ok || !ultimo.id) {
            setError(ultimo.error || 'No se encontró último ticket generado');
            return;
          }

          id = ultimo.id;
        }

        setIdUsado(id);

        const data = await fetch(`/api/sitrap?view=ticket&id=${encodeURIComponent(id)}`, {
          cache: 'no-store',
        }).then((r) => r.json());

        if (!data.ok || !data.ticket_encontrado) {
          setError(data.error || 'Ticket no encontrado');
          return;
        }

        setTicket(data.ticket);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    cargarTicket();
  }, []);

  const copiar = async (texto: string, tipo: string) => {
    await navigator.clipboard.writeText(texto || '');
    setCopied(tipo);
    setTimeout(() => setCopied(''), 2500);
  };

  if (loading) {
    return <main className="screen">Cargando último ticket...</main>;
  }

  if (error) {
    return <main className="screen error">{error}</main>;
  }

  const detalle = ticket?.detalle || [];
  const textoPOS = construirTextoPOS(ticket);
  const urlQr = ticket?.URL_Ticket || `https://sitrap-dashboard-web-73p9.vercel.app/ticket-despacho?id=${idUsado}`;
  const qrImage = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(urlQr)}`;
  return (
    <main className="screen">
      <div className="topNav">
  <a href="/" className="homeBtn">← Volver al menú</a>
</div>

<div className="actions">
        <button onClick={() => copiar(textoPOS, 'ticket POS')}>Copiar ticket POS</button>
        <button onClick={() => copiar(urlQr, 'URL QR')}>Copiar URL QR</button>
        {copied && <div className="ok">Copiado: {copied}</div>}
      </div>

      <section className="ticket">
        <div className="center bold">SITRAP - TRIPAN S.A.</div>
        <div className="center title">VIVERO MONTE ARANDA (VMA)</div>
        <div className="sep">==============================</div>

        <div className="center ticketTitle">TICKET DESPACHO A EECC</div>
        <div className="idBox">ID Despacho: {ticket.ID_Despacho}</div>

        <div>Fecha: {formatDate(ticket.Fecha_Movimiento)}</div>
        <div>Origen: {ticket.Origen}</div>
        <div>Destino: {ticket.Destino}</div>
        <div>Empresa: {ticket.Empresa_EECC}</div>
        <div>Contrato: {ticket.Contrato}</div>
        <div>Responsable: {ticket.Responsable}</div>

        <div className="dash">------------------------------</div>
        <div className="center bold">DETALLE DE DESPACHO</div>

        {detalle.map((item: any, i: number) => (
          <div key={i} className="item">
            <div className="itemTop">
              <strong>{item.EspecieMaterial || item.Especie || 'Sin especie'}</strong>
              <strong>{formatNumber(item.Cantidad)}</strong>
            </div>
            <div className="lote">{item.ID_Lote_SITRAP || item.ID_Final_Lote}</div>
          </div>
        ))}

        <div className="dash">------------------------------</div>

        <div className="total">
          <span>TOTAL GENERAL</span>
          <span>{formatNumber(ticket.Total_Plantas)}</span>
        </div>
        <div className="plantas">plantas</div>

        <div className="dash">------------------------------</div>
        <div className="center bold">DATOS TRANSPORTE</div>
        <div>Chofer : {ticket.Chofer || ''}</div>
        <div>Patente: {ticket.Patente || ''}</div>

        <div className="dash">------------------------------</div>
        <div className="center bold">FIRMAS RECEPCIÓN</div>
        <br />
        <div>Entrega VMA: __________________</div>
        <br />
        <div>Recibe EECC: __________________</div>
        <div>Nombre: {ticket.Recibe || ''}</div>
        <div>Cargo : {ticket.Cargo_Recibe || ''}</div>

        <div className="dash">------------------------------</div>
        <div className="center bold">QR TRAZABILIDAD DEL DESPACHO</div>
<div className="qrBox">
  <img src={qrImage} alt="QR trazabilidad despacho" />
</div>
<div className="center small">Ver trazabilidad completa</div>
<div className="center small">{ticket.ID_Despacho}</div>
<div className="center small">sitrap-dashboard-web-73p9.vercel.app</div>
      </section>

      <style jsx>{`
        .screen {
          background: #f3f4f6;
          min-height: 100vh;
          padding: 18px 0;
          font-family: Arial, sans-serif;
        }

        .error {
          color: red;
          padding: 20px;
          font-weight: 700;
        }
.topNav {
  width: 58mm;
  margin: 0 auto 10px auto;
}

.homeBtn {
  display: block;
  background: #14532d;
  color: white;
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}
        .actions {
          width: 58mm;
          margin: 0 auto 12px auto;
          display: grid;
          gap: 8px;
        }

        button {
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #111827;
          color: white;
          font-weight: 800;
          font-size: 14px;
        }

        .ok {
          text-align: center;
          font-weight: 700;
          color: #166534;
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

        .center { text-align: center; }
        .bold { font-weight: 900; }
        .title { font-size: 13px; font-weight: 900; }
        .ticketTitle { font-size: 13px; font-weight: 900; margin: 6px 0; }
        .sep, .dash { text-align: center; font-weight: 700; white-space: nowrap; overflow: hidden; }

        .idBox {
          background: black;
          color: white;
          border-radius: 4px;
          padding: 4px;
          text-align: center;
          font-weight: 800;
          margin: 5px 0 8px 0;
        }

        .item { margin: 6px 0; }

        .itemTop, .total {
          display: flex;
          justify-content: space-between;
          gap: 6px;
        }

        .lote {
          font-size: 10px;
          word-break: break-word;
        }

        .total {
          font-size: 14px;
          font-weight: 900;
        }

        .plantas {
          text-align: right;
          font-size: 10px;
          font-weight: 700;
        }

        .url {
          font-size: 8px;
          text-align: center;
          word-break: break-all;
        }
        .qrBox {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.qrBox img {
  width: 40mm;
  height: 40mm;
}

.small {
  font-size: 9px;
  font-weight: 700;
}
      `}</style>
    </main>
  );
}

function construirTextoPOS(ticket: any) {
  const detalle = ticket?.detalle || [];
  const lineas: string[] = [];

  lineas.push('SITRAP - TRIPAN S.A.');
  lineas.push('VIVERO MONTE ARANDA (VMA)');
  lineas.push('==============================');
  lineas.push('TICKET DESPACHO A EECC');
  lineas.push('');
  lineas.push('ID Despacho:');
  lineas.push(ticket.ID_Despacho || '');
  lineas.push('');
  lineas.push('Fecha: ' + formatDate(ticket.Fecha_Movimiento));
  lineas.push('Origen:');
  lineas.push(ticket.Origen || '');
  lineas.push('Destino: ' + (ticket.Destino || ''));
  lineas.push('Empresa: ' + (ticket.Empresa_EECC || ''));
  lineas.push('Contrato: ' + (ticket.Contrato || ''));
  lineas.push('Responsable:');
  lineas.push(ticket.Responsable || '');
  lineas.push('------------------------------');
  lineas.push('DETALLE DE DESPACHO');
  lineas.push('');

  detalle.forEach((item: any) => {
    lineas.push(item.EspecieMaterial || item.Especie || 'Sin especie');
    lineas.push(item.ID_Lote_SITRAP || item.ID_Final_Lote || 'Sin ID lote');
    lineas.push('Cantidad: ' + formatNumber(item.Cantidad) + ' plantas');
    lineas.push('------------------------------');
  });

  lineas.push('TOTAL GENERAL: ' + formatNumber(ticket.Total_Plantas));
  lineas.push('plantas');
  lineas.push('------------------------------');
  lineas.push('DATOS TRANSPORTE');
  lineas.push('Chofer : ' + (ticket.Chofer || ''));
  lineas.push('Patente: ' + (ticket.Patente || ''));
  lineas.push('------------------------------');
  lineas.push('FIRMAS);
  lineas.push('');
  lineas.push('Entrega VMA:');
  lineas.push('______________________________');
  lineas.push('');
  lineas.push('Recibe EECC:');
  lineas.push('______________________________');
  lineas.push('Nombre: ' + (ticket.Recibe || ''));
  lineas.push('Cargo : ' + (ticket.Cargo_Recibe || ''));
  lineas.push('------------------------------');
  lineas.push('QR DESPACHO');
  lineas.push('Ver ticket en SITRAP:');
  lineas.push('sitrap.app/ticket');
  lineas.push(ticket.ID_Despacho || '');
  lineas.push('==============================');

  return lineas.join('\n');
}

function formatDate(value: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-CL');
}

function formatNumber(value: any) {
  const num = Number(value || 0);
  return num.toLocaleString('es-CL');
}
