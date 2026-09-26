import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bank Marketing Predictor",
  description: "Machine learning prediction for bank marketing campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}