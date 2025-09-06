import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import SEOHead from "@/components/SEOHead";

export const metadata: Metadata = {
  title: "Luxe Staycations",
  description: "Villa bookings made effortless",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SEOHead />
      <body
        className="font-nunito antialiased"
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Providers>
          <Navbar />
          <main className="pt-16 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
