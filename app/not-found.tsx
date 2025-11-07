import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card space-y-4 text-center">
      <h2 className="text-2xl font-semibold">Conteúdo não encontrado</h2>
      <p className="text-slate-600">
        O recurso solicitado pode ter sido removido ou você não possui permissão de acesso.
      </p>
      <div className="flex justify-center gap-2">
        <Link href="/dashboard" className="primary-button">
          Voltar para o painel
        </Link>
        <Link href="/" className="secondary-button">
          Página inicial
        </Link>
      </div>
    </div>
  );
}
