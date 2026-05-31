import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SITRAP',
  description: 'Sistema de Inventario y Trazabilidad de Plantas',
  manifest: '/manifest.json',
  icons: {
    icon: '/sitrap-app-icon.png.png',
    apple: '/sitrap-app-icon.png.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
