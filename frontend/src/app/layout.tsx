import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";


const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV-ConVos | Creá tu CV Profesional con IA",
  description: "Transformá tu experiencia laboral en un currículum impactante. Subí tus archivos y dejá que nuestra IA construya tu historia profesional.",
  keywords: ["cv", "curriculum", "resume", "ia", "inteligencia artificial", "trabajo", "empleo"],
  authors: [{ name: "CV-ConVos" }],
  openGraph: {
    title: "CV-ConVos | Creá tu CV Profesional con IA",
    description: "Transformá tu experiencia laboral en un currículum impactante.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  );
}
