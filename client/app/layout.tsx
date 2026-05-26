import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b1720'
};

export const metadata: Metadata = {
  title: '台股處置風險雷達',
  description: '每日彙整上市股票的處置風險、多空傾向、產業分類與異常交易訊號。',
  applicationName: '台股處置風險雷達',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg'
  },
  appleWebApp: {
    capable: true,
    title: '台股處置風險雷達',
    statusBarStyle: 'default'
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}