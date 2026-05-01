import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthInitializer } from '@/components/shared/AuthInitializer';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-mesh min-h-screen antialiased`}>
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
