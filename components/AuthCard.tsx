"use client";

import Link from "next/link";
import { useState } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  alternativeAction: {
    label: string;
    href: string;
  };
  onSubmit: (formData: { email: string; password: string }) => Promise<void>;
};

export function AuthCard({
  title,
  subtitle,
  submitLabel,
  alternativeAction,
  onSubmit,
}: AuthCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível concluir a operação."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md w-full">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-slate-600">{subtitle}</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
          <p className="help-text">Use ao menos 6 caracteres.</p>
        </div>
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <button type="submit" className="primary-button w-full" disabled={loading}>
          {loading ? "Enviando..." : submitLabel}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {alternativeAction.label}{" "}
        <Link href={alternativeAction.href} className="text-indigo-600">
          Clique aqui
        </Link>
      </p>
    </div>
  );
}
