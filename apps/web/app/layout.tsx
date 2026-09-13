import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "LLD Arena — Low-Level Design Practice & Evaluation Gym",
  description: "Interactive deliberate practice platform for Low-Level Design with dual-tier deterministic and AI rubric evaluations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Buio guide-line overlay */}
        <div className="guide-lines" aria-hidden="true">
          <div className="guide-lines-inner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}
