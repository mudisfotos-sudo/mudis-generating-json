"use client";

import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthCard
      title="Acesse sua conta"
      subtitle="Gerencie projetos e entidades do seu ERP"
      submitLabel="Entrar"
      alternativeAction={{ label: "Ainda não possui conta?", href: "/register" }}
      onSubmit={async (formData) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message ?? "Falha ao realizar login");
        }

        router.replace("/dashboard");
      }}
    />
  );
}
