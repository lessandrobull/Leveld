import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReadingHub',
  description: 'Plataforma de leitura e escuta guiada de inglês.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}