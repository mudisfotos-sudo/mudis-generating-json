import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card space-y-6 max-w-6xl">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Bem-vindo ao Mudis ERP</h2>
        <p className="text-slate-600">
          Crie projetos, modele entidades complexas, organize relacionamentos e gere descrições em JSON para
          acelerar a implementação do seu ERP. Tudo em uma interface moderna e colaborativa.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
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
