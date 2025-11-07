"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DataBaseEntityType } from "@/types/database";

type ProjectSummary = {
  id: string;
  name: string;
  description?: string;
  entities: Array<DataBaseEntityType & { _id: string }>;
  updatedAt?: string;
  createdAt?: string;
};

type DashboardClientProps = {
  initialProjects: ProjectSummary[];
  userEmail: string;
};

type ProjectDraft = {
  name: string;
  description?: string;
};

export function DashboardClient({ initialProjects, userEmail }: DashboardClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>(initialProjects);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProjectDraft>({ name: "" });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function refreshProjects() {
    const response = await fetch("/api/projects");
    if (response.ok) {
      const data = await response.json();
      setProjects(data);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, entities: [] }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "Não foi possível criar o projeto.");
      }
      const created = await response.json();
      setProjects((prev) => [created, ...prev]);
      setDraft({ name: "", description: "" });
      setFeedback("Projeto criado com sucesso.");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Falha ao criar projeto.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(projectId: string) {
    const confirmation = window.confirm("Tem certeza que deseja excluir este projeto?");
    if (!confirmation) return;
    const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (response.ok) {
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      setFeedback("Projeto removido.");
    }
  }

  async function handleUpdate(project: ProjectSummary) {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: project.name,
        description: project.description,
        entities: project.entities ?? [],
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message ?? "Não foi possível atualizar o projeto.");
    }
    const updated = await response.json();
    setProjects((prev) => prev.map((item) => (item.id === project.id ? updated : item)));
    setEditingProjectId(null);
    setFeedback("Projeto atualizado.");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-semibold">Projetos</h2>
            <p className="text-sm text-slate-600">
              Autenticado como <span className="font-medium">{userEmail}</span>.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="secondary-button" onClick={refreshProjects}>
              Recarregar
            </button>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleCreate}>
          <div>
            <label>Nome do projeto</label>
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              required
              placeholder="ERP Cliente X"
            />
          </div>
          <div className="md:col-span-2">
            <label>Descrição</label>
            <input
              value={draft.description ?? ""}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Modelagem das entidades principais"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="primary-button" disabled={creating}>
              {creating ? "Criando..." : "Criar projeto"}
            </button>
          </div>
        </form>
        {createError ? (
          <p className="text-sm text-red-600">{createError}</p>
        ) : null}
        {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="card">
            <p className="text-sm text-slate-600">Nenhum projeto cadastrado até o momento.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="card space-y-4">
              {editingProjectId === project.id ? (
                <ProjectEditForm
                  project={project}
                  onCancel={() => setEditingProjectId(null)}
                  onSubmit={async (payload) => {
                    await handleUpdate(payload);
                  }}
                />
              ) : (
                <ProjectCard
                  project={project}
                  onEdit={() => setEditingProjectId(project.id)}
                  onDelete={() => handleDelete(project.id)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

type ProjectCardProps = {
  project: ProjectSummary;
  onEdit: () => void;
  onDelete: () => void;
};

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <p className="text-sm text-slate-600">{project.description || "Sem descrição"}</p>
          <p className="text-xs text-slate-500">
            {project.entities?.length ?? 0} entidades definidas
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${project.id}`} className="primary-button">
            Abrir
          </Link>
          <button type="button" className="secondary-button" onClick={onEdit}>
            Editar
          </button>
          <button type="button" className="danger-button" onClick={onDelete}>
            Excluir
          </button>
        </div>
      </div>
      {project.entities?.length ? (
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-slate-700">Entidades principais</p>
          <div className="grid gap-2 md:grid-cols-2">
            {project.entities.slice(0, 6).map((entity) => (
              <div key={entity.entityName ?? entity.entityNameHumanized ?? entity._id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-medium">{entity.entityNameHumanized ?? entity.entityName ?? "Sem nome"}</p>
                <p className="text-xs text-slate-500">{entity.entityName ?? "Sem identificador"}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ProjectEditFormProps = {
  project: ProjectSummary;
  onCancel: () => void;
  onSubmit: (project: ProjectSummary) => Promise<void>;
};

function ProjectEditForm({ project, onCancel, onSubmit }: ProjectEditFormProps) {
  const [draft, setDraft] = useState<ProjectSummary>(project);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o projeto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label>Nome do projeto</label>
          <input
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div>
          <label>Descrição</label>
          <input
            value={draft.description ?? ""}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
