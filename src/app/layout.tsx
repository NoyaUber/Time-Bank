import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimeBank — Bank Waktu",
  description: "Ubah waktu offline menjadi koin dan bangun duniamu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
