import Link from "next/link";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mudis ERP",
  description: "Modelagem visual de entidades ERP com geração automática de JSON.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="app-body">
        <div className="app-shell">
          <header className="app-header">
            <Link href="/" className="app-brand" aria-label="Início Mudis ERP">
              <img src="/mudis-logo.svg" alt="Logotipo Mudis ERP" className="app-brand__logo" />
              <div className="app-brand__text">
                <span className="app-brand__title">Mudis ERP</span>
                <span className="app-brand__subtitle">Design de dados inteligente</span>
              </div>
            </Link>
            <p className="app-header__caption">
              Construa estruturas de entidades, relacionamentos e visões em minutos.
            </p>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            © {new Date().getFullYear()} Mudis ERP. Todos os direitos reservados.
          </footer>
        </div>
      </body>
    </html>
  );
}
