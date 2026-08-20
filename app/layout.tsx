import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edu AI Builders — Infrastructure for Education",
  description: "An open infrastructure layer for anything you want to build regarding education, centered on the EduOS pedagogical runtime.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
