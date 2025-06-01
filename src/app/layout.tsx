
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected import name
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/LanguageContext'; // Added import

const geistSans = Geist({ // Corrected variable name
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected variable name
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fwlazy',
  description: 'Your local online marketplace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Initial lang and dir are set here. LanguageProvider will update them client-side.
    <html lang="en" dir="ltr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <LanguageProvider> {/* Wrapped application with LanguageProvider */}
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
