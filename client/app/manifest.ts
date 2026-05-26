import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '台股處置風險雷達',
    short_name: '處置雷達',
    description: '每日彙整上市股票的處置風險、多空傾向、制度規則與事件交易觀察。',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4efe5',
    theme_color: '#0b1720',
    lang: 'zh-Hant',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };
}
