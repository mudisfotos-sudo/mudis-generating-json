"use client";

import { useMemo, useState } from "react";
import { EntityEditor, EntityEditorValue } from "@/components/entity/EntityEditor";
import type { DataBaseEntityType } from "@/types/database";

type ProjectWorkspaceProps = {
  projectId: string;
  name: string;
  description?: string;
  initialEntities: Array<DataBaseEntityType & { _id: string }>;
};

type EntitySummary = DataBaseEntityType & { _id: string };

type EditorState =
  | { mode: "idle" }
  | { mode: "create" }
  | { mode: "edit"; entityId: string };

export function ProjectWorkspace({ projectId, name, description, initialEntities }: ProjectWorkspaceProps) {
  const [entities, setEntities] = useState<EntitySummary[]>(initialEntities);
  const [state, setState] = useState<EditorState>({ mode: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedEntity: EntitySummary | undefined =
    state.mode === "edit" ? entities.find((entity) => entity._id === state.entityId) : undefined;

  const availableEntities = useMemo(
    () =>
      entities.map((entity) => ({
        id: entity._id,
        entityName: entity.entityName,
        entityNameHumanized: entity.entityNameHumanized,
      })),
    [entities]
  );

  async function refreshEntities() {
    const response = await fetch(`/api/projects/${projectId}/entities`);
    if (response.ok) {
      const payload = await response.json();
      setEntities(payload.entities ?? []);
    }
  }

  async function createEntity(entity: DataBaseEntityType) {
    const response = await fetch(`/api/projects/${projectId}/entities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entity),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message ?? "Não foi possível criar a entidade.");
    }
    const created = await response.json();
    setEntities((prev) => [...prev, created]);
    setState({ mode: "idle" });
    setSuccess(`Entidade "${created.entityNameHumanized ?? created.entityName ?? created._id}" criada.`);
  }

  async function updateEntity(entityId: string, entity: DataBaseEntityType) {
    const response = await fetch(`/api/projects/${projectId}/entities/${entityId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entity),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message ?? "Não foi possível atualizar a entidade.");
    }
    const updated = await response.json();
    setEntities((prev) => prev.map((item) => (item._id === entityId ? updated : item)));
    setState({ mode: "idle" });
    setSuccess(`Entidade "${updated.entityNameHumanized ?? updated.entityName ?? updated._id}" atualizada.`);
  }

  async function deleteEntity(entityId: string) {
    const confirmation = window.confirm("Tem certeza que deseja excluir esta entidade?");
    if (!confirmation) return;
    const response = await fetch(`/api/projects/${projectId}/entities/${entityId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return;
    }
    setEntities((prev) => prev.filter((entity) => entity._id !== entityId));
    setState({ mode: "idle" });
    setSuccess("Entidade removida.");
  }

  async function handleSave(entity: DataBaseEntityType) {
    setError(null);
    setSuccess(null);
    try {
      if (state.mode === "create") {
        await createEntity(entity);
      } else if (state.mode === "edit" && selectedEntity) {
        await updateEntity(selectedEntity._id, entity);
      }
      await refreshEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-2">
        <h2 className="text-2xl font-semibold">{name}</h2>
        <p className="text-slate-600">{description || "Projeto sem descrição."}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="primary-button" onClick={() => setState({ mode: "create" })}>
            Nova entidade
          </button>
          <button type="button" className="secondary-button" onClick={refreshEntities}>
            Atualizar entidades
          </button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-3">
          <div className="card space-y-3">
            <h3 className="text-lg font-semibold">Entidades ({entities.length})</h3>
            <div className="space-y-2">
              {entities.length === 0 ? (
                <p className="text-sm text-slate-600">Nenhuma entidade cadastrada.</p>
              ) : (
                entities.map((entity) => (
                  <button
                    key={entity._id}
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      state.mode === "edit" && state.entityId === entity._id
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    onClick={() => setState({ mode: "edit", entityId: entity._id })}
                  >
                    <span className="block font-semibold">
                      {entity.entityNameHumanized ?? entity.entityName ?? "Sem nome"}
                    </span>
                    <span className="block text-xs text-slate-500">{entity.entityName ?? ""}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
        <section className="space-y-4">
          {state.mode === "idle" ? (
            <div className="card">
              <p className="text-sm text-slate-600">
                Selecione uma entidade ou clique em "Nova entidade" para iniciar o mapeamento.
              </p>
            </div>
          ) : (
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">
                {state.mode === "create"
                  ? "Cadastrar entidade"
                  : `Editar entidade ${
                      selectedEntity?.entityNameHumanized ?? selectedEntity?.entityName ?? ""
                    }`}
              </h3>
              <EntityEditor
                initialValue={selectedEntity as EntityEditorValue | undefined}
                availableEntities={availableEntities}
                onCancel={() => setState({ mode: "idle" })}
                onSave={handleSave}
              />
              {state.mode === "edit" && selectedEntity ? (
                <div className="mt-6 flex justify-end">
                  <button type="button" className="danger-button" onClick={() => deleteEntity(selectedEntity._id)}>
                    Excluir entidade
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
