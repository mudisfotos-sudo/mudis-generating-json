"use client";

import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <AuthCard
      title="Crie sua conta"
      subtitle="Organize projetos e entidades completas de ERP"
      submitLabel="Cadastrar"
      alternativeAction={{ label: "Já possui cadastro?", href: "/login" }}
      onSubmit={async (formData) => {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message ?? "Falha ao criar usuário");
        }

        router.replace("/dashboard");
      }}
    />
  );
}
