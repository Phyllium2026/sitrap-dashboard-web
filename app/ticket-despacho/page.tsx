'use client';

import { useEffect, useState } from 'react';

export default function TicketDespachoPage() {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setError('No se indicó ID de ticket');
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
      .catch((err) => {
        setError(String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Cargando ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '58mm',
        margin: '0 auto',
        padding: '4mm',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#000',
        background: '#fff',
      }}
    >
      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
        SITRAP
      </div>

      <div style={{ textAlign: 'center' }}>
        TRIPAN S.A.
      </div>

      <hr />

      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
        TICKET DESPACHO A EECC
      </div>

      <hr />

      <div>
        <strong>ID:</strong>
      </div>

      <div>{ticket['ID_Despacho']}</div>

      <br />

      <div>
        <strong>Fecha:</strong>
      </div>

      <div>
        {new Date(ticket['Fecha_Movimiento']).toLocaleDateString('es-CL')}
      </div>

      <br />

      <div>
        <strong>Origen:</strong>
      </div>

      <div>{ticket['Origen']}</div>

      <br />

      <div>
        <strong>Destino:</strong>
      </div>

      <div>{ticket['Destino']}</div>

      <br />

      <div>
        <strong>Empresa:</strong>
      </div>

      <div>{ticket['Empresa_EECC']}</div>

      <br />

      <div>
        <strong>Contrato:</strong>
      </div>

      <div>{ticket['Contrato']}</div>

      <hr />

      <div>
        <strong>Especie:</strong>
      </div>

      <div>{ticket['EspecieMaterial']}</div>

      <br />

      <div>
        <strong>ID Lote:</strong>
      </div>

      <div>{ticket['ID_Lote_SITRAP']}</div>

      <br />

      <div>
        <strong>Cantidad:</strong>
      </div>

      <div>{ticket['Cantidad']} plantas</div>

      <hr />

      <div>
        <strong>Chofer:</strong>
      </div>

      <div>{ticket['Chofer']}</div>

      <br />

      <div>
        <strong>Patente:</strong>
      </div>

      <div>{ticket['Patente']}</div>

      <hr />

      <div>
        <strong>Recibe:</strong>
      </div>

      <div>{ticket['Recibe']}</div>

      <br />

      <div>
        <strong>Cargo:</strong>
      </div>

      <div>{ticket['Cargo_Recibe']}</div>

      <hr />

      {ticket['Observaciones'] && (
        <>
          <div>
            <strong>Observaciones:</strong>
          </div>

          <div>{ticket['Observaciones']}</div>

          <hr />
        </>
      )}

      <div style={{ textAlign: 'center' }}>
        QR TRAZABILIDAD
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '10px',
          wordBreak: 'break-all',
          fontSize: '10px',
        }}
      >
        {window.location.href}
      </div>

      <hr />

      <div style={{ marginTop: '15px' }}>
        Firma Entrega:
      </div>

      <br />
      <br />

      ______________________

      <br />
      <br />

      <div>
        Firma Recepción:
      </div>

      <br />
      <br />

      ______________________

      <br />
      <br />

      <div style={{ textAlign: 'center' }}>
        Documento generado por SITRAP
      </div>
    </div>
  );
}
