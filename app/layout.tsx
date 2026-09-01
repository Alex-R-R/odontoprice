import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OdontoPrice — Precificação inteligente',
  description: 'Gestão de custos e precificação para atendimentos odontológicos.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
