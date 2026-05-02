import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthInitializer } from '@/components/shared/AuthInitializer';
import { LanguageProvider } from '@/components/shared/LanguageProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MazdoorPing - Connect Workers with Employers',
  description: 'Pakistan\'s premier platform connecting skilled workers with employers. Find jobs, hire talent, and build your workforce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans bg-mesh min-h-screen antialiased`}
        style={{ fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif' }}
      >
        <LanguageProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </LanguageProvider>
      </body>
    </html>
  );
}
