import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Assuming default font or similar
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Section Store MVP",
  description: "Shopify Theme Section Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
