import "./globals.css";
import {
  Big_Shoulders_Display,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import Nav from "@/components/Nav";

const display = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Solar Glider — Project Log",
  description: "Live engineering log for the solar FPV glider project.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-blueprint-900 bg-blueprint-grid bg-grid font-body text-ink">
        <Nav />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
