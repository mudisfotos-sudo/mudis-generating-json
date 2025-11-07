import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bem-vindo ao ERP JSON Designer</h2>
        <p className="text-slate-600">
          Cadastre-se ou faça login para gerenciar projetos e modelar entidades
          que representam as tabelas e interfaces do seu ERP.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/login" className="primary-button">
          Entrar
        </Link>
        <Link href="/register" className="secondary-button">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
