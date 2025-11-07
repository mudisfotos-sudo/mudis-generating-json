"use client";

import { useMemo, useState } from "react";
import { EntityEditor, EntityEditorValue } from "@/components/entity/EntityEditor";
import type { DataBaseEntityType } from "@/types/database";

type ProjectWorkspaceProps = {
  projectId: string;
  name: string;
  description?: string;
  initialEntities: Array<DataBaseEntityType & { _id: string }>;
  userEmail: string;
};

type EntitySummary = DataBaseEntityType & { _id: string };

type EditorState =
  | { mode: "idle" }
  | { mode: "create" }
  | { mode: "edit"; entityId: string };

export function ProjectWorkspace({
  projectId,
  name,
  description,
  initialEntities,
  userEmail,
}: ProjectWorkspaceProps) {
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

  function startCreate() {
    setError(null);
    setSuccess(null);
    setState({ mode: "create" });
  }

  function openEntity(entityId: string) {
    setError(null);
    setSuccess(null);
    setState({ mode: "edit", entityId });
  }

  return (
    <div className="workspace-shell">
      <div className="workspace">
        <aside className="workspace-sidebar" aria-label="Entidades do projeto">
          <div className="workspace-sidebar-header">
            <div>
              <p className="workspace-sidebar-title">Entidades ({entities.length})</p>
              <span className="workspace-sidebar-subtitle">
                Estruture coleções, relacionamentos e visões personalizadas.
              </span>
            </div>
            <div className="workspace-sidebar-actions">
              <button type="button" className="secondary-button" onClick={refreshEntities}>
                Recarregar
              </button>
            </div>
          </div>
          <div className="workspace-entity-list">
            {entities.length === 0 ? (
              <p className="workspace-empty">
                Nenhuma entidade cadastrada. Clique em "Nova entidade" para começar a desenhar o modelo.
              </p>
            ) : (
              entities.map((entity) => (
                <button
                  key={entity._id}
                  type="button"
                  className={`workspace-entity-button${
                    state.mode === "edit" && state.entityId === entity._id ? " active" : ""
                  }`}
                  onClick={() => openEntity(entity._id)}
                >
                  <span className="block text-sm font-semibold text-slate-700">
                    {entity.entityNameHumanized ?? entity.entityName ?? "Sem nome"}
                  </span>
                  <span className="block text-xs text-slate-500">{entity.entityName ?? ""}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="workspace-area">
          <header className="workspace-topbar">
            <div className="workspace-topbar-info">
              <div className="workspace-topbar-brand">
                <img src="/mudis-logo.svg" alt="Logotipo Mudis ERP" className="workspace-brand-logo" />
                <div>
                  <span className="workspace-brand-name">Mudis ERP</span>
                  <span className="workspace-brand-subtitle">Modelagem de dados unificada</span>
                </div>
              </div>
              <div className="workspace-project-meta">
                <span className="workspace-project-label">Projeto selecionado</span>
                <h1 className="workspace-project-name">{name}</h1>
                <p className="workspace-project-description">{description || "Projeto sem descrição."}</p>
              </div>
            </div>
            <div className="workspace-topbar-actions">
              <button type="button" className="primary-button workspace-topbar-button" onClick={startCreate}>
                Nova entidade
              </button>
              <div className="workspace-user">
                <span className="workspace-user-label">Usuário autenticado</span>
                <span className="workspace-user-email">{userEmail}</span>
              </div>
            </div>
          </header>

          <div className="workspace-main">
            {error ? <div className="alert alert--error">{error}</div> : null}
            {success ? <div className="alert alert--success">{success}</div> : null}

            {state.mode === "idle" ? (
              <div className="workspace-panel workspace-empty">
                <p>
                  Selecione uma entidade existente ao lado ou clique em "Nova entidade" para iniciar o mapeamento
                  do seu domínio de ERP.
                </p>
              </div>
            ) : (
              <div className="workspace-panel space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">
                    {state.mode === "create"
                      ? "Cadastrar entidade"
                      : `Editar entidade ${
                          selectedEntity?.entityNameHumanized ?? selectedEntity?.entityName ?? ""
                        }`}
                  </h2>
                  {state.mode === "edit" && selectedEntity ? (
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => deleteEntity(selectedEntity._id)}
                    >
                      Excluir entidade
                    </button>
                  ) : null}
                </div>
                <EntityEditor
                  initialValue={selectedEntity as EntityEditorValue | undefined}
                  availableEntities={availableEntities}
                  onCancel={() => {
                    setState({ mode: "idle" });
                    setError(null);
                    setSuccess(null);
                  }}
                  onSave={handleSave}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
