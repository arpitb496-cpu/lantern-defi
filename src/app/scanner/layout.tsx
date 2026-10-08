import type { Metadata } from "next";
import en from "@/i18n/en.json";

export const metadata: Metadata = en.metadata.scanner;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
