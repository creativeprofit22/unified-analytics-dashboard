import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { SectionFilterProvider } from "@/contexts/SectionFilterContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unified Analytics Dashboard",
  description: "Multi-platform analytics dashboard for GoHighLevel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <SettingsProvider>
            <FilterProvider>
              <SectionFilterProvider>{children}</SectionFilterProvider>
            </FilterProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
