import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ERP JSON Designer",
  description: "Modela entidades de ERP e gera descrições em JSON",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <h1 className="text-lg font-semibold">ERP JSON Designer</h1>
              <span className="text-sm text-slate-500">
                Defina estruturas completas de entidades para o seu ERP
              </span>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} ERP JSON Designer
          </footer>
        </div>
      </body>
    </html>
  );
}
