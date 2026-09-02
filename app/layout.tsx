import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FTG Odontologia — Gestão & Precificação Odontológica',
  description: 'Gestão & Precificação Odontológica para a Dra. Fernanda T. Gonçalves.',
  applicationName: 'FTG Odontologia',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  themeColor: '#bd587f',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

