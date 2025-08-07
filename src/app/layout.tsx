import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Logo } from '@/components/logo';
import Link from 'next/link';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Calculadora de Presupuestos | Sidon',
  description: 'Calculadora de presupuestos para Sidon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head />
      <body className="font-body antialiased">
         <div className="flex min-h-screen w-full flex-col max-w-[1440px] mx-auto">
            <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 z-50">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Logo />
              </Link>
            </header>
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {children}
            </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
