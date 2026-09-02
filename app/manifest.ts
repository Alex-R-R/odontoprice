import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FTG Odontologia — Gestão & Precificação Odontológica',
    short_name: 'FTG Odontologia',
    description: 'Gestão & Precificação Odontológica da Dra. Fernanda T. Gonçalves.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff7fa',
    theme_color: '#bd587f',
    lang: 'pt-BR',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }],
  };
}

