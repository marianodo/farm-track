// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '../i18nClient';
import { I18nProvider } from "./I18nProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

// import { SidebarProvider } from "@/components/ui/sidebar"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Dashboard BD Metrics",
//   description: "Aplication for measure",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
