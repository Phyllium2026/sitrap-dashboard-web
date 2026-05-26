import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SITRAP Dashboard Web',
  description: 'Sistema de Inventario y Trazabilidad de Plantas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
