"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DataBaseEntityField,
  DataBaseEntityRelationship,
  DataBaseEntityShowFieldsComponent,
  DataBaseEntityType,
  DataBaseEntityView,
  DataBaseEntityViewDetails,
  DataBaseEntityViewFilterLayout,
  DataBaseEntityViewFormLayout,
  DataBaseEntityViewTableComponent,
  DataBaseEntityViewTableFilter,
  DataBaseEntityViewTableLayout,
  DataBaseEntityViewViewLayout,
  FieldSpecialTypeList,
  FieldTypeList,
  RelFieldTypeList,
} from "@/types/database";

const FIELD_TYPE_OPTIONS = Object.values(FieldTypeList);
const REL_FIELD_TYPE_OPTIONS = Object.values(RelFieldTypeList);
const FIELD_SPECIAL_TYPE_OPTIONS = Object.values(FieldSpecialTypeList);

const TABS = ["Geral", "Campos", "Relacionamentos", "Visões"] as const;

export type EntityEditorValue = DataBaseEntityType & { _id?: string };

type EntityEditorProps = {
  initialValue?: EntityEditorValue;
  availableEntities: Array<{ id: string; entityName?: string; entityNameHumanized?: string }>;
  onCancel: () => void;
  onSave: (value: DataBaseEntityType) => Promise<void>;
};

type EditableField = DataBaseEntityField & { id: string };
type EditableRelationship = DataBaseEntityRelationship & { id: string };

type EditableView = {
  id: string;
  name: string;
  data: DataBaseEntityView;
};

const booleanFields: Array<keyof DataBaseEntityType> = [
  "allViewInOne",
  "showClientView",
  "showSiteView",
  "notlistButtons",
  "hasWhiteLabel",
  "hasSoftDelete",
  "hasDateAudit",
];

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeEntity(value?: EntityEditorValue): {
  base: DataBaseEntityType;
  fields: EditableField[];
  relationships: EditableRelationship[];
  views: EditableView[];
} {
  const base: DataBaseEntityType = {
    entityName: value?.entityName ?? "",
    entityNameHumanized: value?.entityNameHumanized ?? "",
    entityNameHumanizedPlural: value?.entityNameHumanizedPlural ?? "",
    frontPath: value?.frontPath ?? "",
    backPath: value?.backPath ?? "",
    allViewInOne: value?.allViewInOne ?? false,
    showClientView: value?.showClientView ?? true,
    showSiteView: value?.showSiteView ?? false,
    notlistButtons: value?.notlistButtons ?? false,
    hasWhiteLabel: value?.hasWhiteLabel ?? false,
    hasSoftDelete: value?.hasSoftDelete ?? false,
    hasDateAudit: value?.hasDateAudit ?? false,
    fields: value?.fields ?? [],
    relationships: value?.relationships ?? [],
    views: value?.views,
  };

  const fields: EditableField[] = (value?.fields ?? []).map((field) => ({
    ...field,
    id: randomId(),
  }));

  const relationships: EditableRelationship[] = (value?.relationships ?? []).map(
    (relationship) => ({
      ...relationship,
      id: randomId(),
    })
  );

  const viewsValue = value?.views;
  const viewsArray: DataBaseEntityView[] = Array.isArray(viewsValue)
    ? viewsValue
    : viewsValue
    ? [viewsValue]
    : [];

  const views: EditableView[] = viewsArray.map((view, index) => ({
    id: randomId(),
    name: view._?.menuLabel || `Visão ${index + 1}`,
    data: view,
  }));

  return { base, fields, relationships, views };
}

function denormalizeEntity(
  base: DataBaseEntityType,
  fields: EditableField[],
  relationships: EditableRelationship[],
  views: EditableView[]
): DataBaseEntityType {
  return {
    ...base,
    fields: fields.map(({ id, ...rest }) => rest),
    relationships: relationships.map(({ id, ...rest }) => rest),
    views:
      views.length === 0
        ? undefined
        : views.length === 1
        ? views[0].data
        : views.map((view) => view.data),
  };
}

export function EntityEditor({
  initialValue,
  availableEntities,
  onCancel,
  onSave,
}: EntityEditorProps) {
  const { base: initialBase, fields: initialFields, relationships: initialRelationships, views: initialViews } =
    useMemo(() => normalizeEntity(initialValue), [initialValue]);

  const [base, setBase] = useState<DataBaseEntityType>(initialBase);
  const [fields, setFields] = useState<EditableField[]>(initialFields);
  const [relationships, setRelationships] = useState<EditableRelationship[]>(
    initialRelationships
  );
  const [views, setViews] = useState<EditableView[]>(initialViews);
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBase(initialBase);
    setFields(initialFields);
    setRelationships(initialRelationships);
    setViews(initialViews);
  }, [initialBase, initialFields, initialRelationships, initialViews]);

  const entityOptions = useMemo(
    () =>
      availableEntities.filter((entity) => entity.id !== initialValue?._id).map((entity) => ({
        value: entity.entityName ?? entity.id,
        label: entity.entityNameHumanized ?? entity.entityName ?? entity.id,
      })),
    [availableEntities, initialValue?._id]
  );

  const fieldNameOptions = useMemo(
    () => fields.map((field) => ({ value: field.fieldName, label: field.fieldName })),
    [fields]
  );

  const relationshipNameOptions = useMemo(
    () =>
      relationships.map((relationship) => ({
        value: relationship.fieldName,
        label: relationship.fieldName,
      })),
    [relationships]
  );

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(denormalizeEntity(base, fields, relationships, views));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a entidade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="tab-nav">
        {TABS.map((item) => (
          <button
            type="button"
            key={item}
            className={`tab-button ${tab === item ? "active" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Geral" ? (
        <GeneralTab base={base} onChange={setBase} />
      ) : tab === "Campos" ? (
        <FieldsTab fields={fields} onChange={setFields} />
      ) : tab === "Relacionamentos" ? (
        <RelationshipsTab
          relationships={relationships}
          onChange={setRelationships}
          entityOptions={entityOptions}
        />
      ) : (
        <ViewsTab
          fields={fields}
          relationships={relationships}
          views={views}
          onChange={setViews}
          fieldOptions={fieldNameOptions}
          relationshipOptions={relationshipNameOptions}
        />
      )}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? "Salvando..." : "Salvar entidade"}
        </button>
      </div>
    </form>
  );
}

function GeneralTab({
  base,
  onChange,
}: {
  base: DataBaseEntityType;
  onChange: (value: DataBaseEntityType) => void;
}) {
  function update<K extends keyof DataBaseEntityType>(key: K, value: DataBaseEntityType[K]) {
    onChange({ ...base, [key]: value });
  }

  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-2">
        <div>
          <label>Nome técnico (PascalCase)</label>
          <input
            value={base.entityName ?? ""}
            onChange={(event) => update("entityName", event.target.value)}
            placeholder="Ex.: CustomerOrder"
          />
        </div>
        <div>
          <label>Nome exibido</label>
          <input
            value={base.entityNameHumanized ?? ""}
            onChange={(event) => update("entityNameHumanized", event.target.value)}
            placeholder="Ex.: Pedido"
          />
        </div>
        <div>
          <label>Nome exibido (plural)</label>
          <input
            value={base.entityNameHumanizedPlural ?? ""}
            onChange={(event) => update("entityNameHumanizedPlural", event.target.value)}
            placeholder="Ex.: Pedidos"
          />
        </div>
        <div>
          <label>Caminho no front-end</label>
          <input
            value={base.frontPath ?? ""}
            onChange={(event) => update("frontPath", event.target.value)}
            placeholder="/erp/pedidos"
          />
        </div>
        <div>
          <label>Caminho no back-end</label>
          <input
            value={base.backPath ?? ""}
            onChange={(event) => update("backPath", event.target.value)}
            placeholder="/api/pedidos"
          />
        </div>
      </div>
      <div className="grid grid-cols-2">
        {booleanFields.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              checked={Boolean(base[key])}
              onChange={(event) => update(key, event.target.checked)}
            />
            {booleanLabel(key)}
          </label>
        ))}
      </div>
    </div>
  );
}

function booleanLabel(key: keyof DataBaseEntityType) {
  const labels: Record<string, string> = {
    allViewInOne: "Carregar todas as vistas na mesma página",
    showClientView: "Exibir vistas no CRM",
    showSiteView: "Exibir vistas no site",
    notlistButtons: "Ocultar botões de ações na lista",
    hasWhiteLabel: "Restrita por cliente (white label)",
    hasSoftDelete: "Utiliza exclusão suave",
    hasDateAudit: "Armazena auditoria de datas",
  };
  return labels[key as string] ?? key;
}

function FieldsTab({
  fields,
  onChange,
}: {
  fields: EditableField[];
  onChange: (fields: EditableField[]) => void;
}) {
  const [draft, setDraft] = useState<EditableField | null>(null);

  function resetDraft() {
    setDraft(null);
  }

  function handleEdit(field: EditableField) {
    setDraft(field);
  }

  function handleRemove(id: string) {
    onChange(fields.filter((field) => field.id !== id));
    if (draft?.id === id) {
      resetDraft();
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const exists = fields.some((field) => field.id === draft.id);
    if (exists) {
      onChange(fields.map((field) => (field.id === draft.id ? draft : field)));
    } else {
      onChange([...fields, { ...draft, id: randomId() }]);
    }
    resetDraft();
  }

  function createNew() {
    setDraft({
      id: randomId(),
      fieldName: "",
      fieldType: FieldTypeList.String,
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Campos cadastrados</h3>
          <button type="button" className="primary-button" onClick={createNew}>
            Novo campo
          </button>
        </div>
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Tamanho</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-500">
                  Nenhum campo cadastrado
                </td>
              </tr>
            ) : (
              fields.map((field) => (
                <tr key={field.id}>
                  <td>{field.fieldName}</td>
                  <td>{field.fieldType}</td>
                  <td>{field.fieldSize ?? "-"}</td>
                  <td className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleEdit(field)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleRemove(field.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">
          {draft ? (fields.some((field) => field.id === draft.id) ? "Editar campo" : "Novo campo") : "Selecione um campo"}
        </h3>
        {draft ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label>Nome (camelCase)</label>
              <input
                value={draft.fieldName}
                onChange={(event) => setDraft({ ...draft, fieldName: event.target.value })}
                required
              />
            </div>
            <div>
              <label>Tipo</label>
              <select
                value={draft.fieldType}
                onChange={(event) =>
                  setDraft({ ...draft, fieldType: event.target.value as FieldTypeList })
                }
              >
                {!FIELD_TYPE_OPTIONS.includes(draft.fieldType as FieldTypeList) ? (
                  <option value={draft.fieldType}>{draft.fieldType}</option>
                ) : null}
                {FIELD_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Tamanho</label>
                <input
                  type="number"
                  value={draft.fieldSize ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, fieldSize: event.target.value ? Number(event.target.value) : undefined })
                  }
                />
              </div>
              <div>
                <label>Valor padrão</label>
                <input
                  value={draft.fieldDefault?.toString() ?? ""}
                  onChange={(event) => setDraft({ ...draft, fieldDefault: event.target.value })}
                />
              </div>
            </div>
            <div>
              <label>Tipo especial</label>
              <select
                value={draft.fieldSpecialType ?? ""}
                onChange={(event) => {
                  const value = event.target.value as FieldSpecialTypeList;
                  setDraft({ ...draft, fieldSpecialType: event.target.value ? value : undefined });
                }}
              >
                <option value="">Nenhum</option>
                {draft.fieldSpecialType && !FIELD_SPECIAL_TYPE_OPTIONS.includes(draft.fieldSpecialType as FieldSpecialTypeList) ? (
                  <option value={draft.fieldSpecialType}>{draft.fieldSpecialType}</option>
                ) : null}
                {FIELD_SPECIAL_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Valores (para Enum)</label>
              <input
                value={Array.isArray(draft.fieldValues) ? draft.fieldValues.join(",") : draft.fieldValues ?? ""}
                placeholder="Valor1,Valor2"
                onChange={(event) =>
                  setDraft({ ...draft, fieldValues: event.target.value ? event.target.value.split(",") : undefined })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="secondary-button" onClick={resetDraft}>
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                Salvar campo
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-600">Selecione um campo para editar ou clique em "Novo campo".</p>
        )}
      </div>
    </div>
  );
}

function RelationshipsTab({
  relationships,
  onChange,
  entityOptions,
}: {
  relationships: EditableRelationship[];
  onChange: (relationships: EditableRelationship[]) => void;
  entityOptions: Array<{ value: string; label: string }>;
}) {
  const [draft, setDraft] = useState<EditableRelationship | null>(null);

  function resetDraft() {
    setDraft(null);
  }

  function handleEdit(value: EditableRelationship) {
    setDraft(value);
  }

  function handleRemove(id: string) {
    onChange(relationships.filter((relationship) => relationship.id !== id));
    if (draft?.id === id) {
      resetDraft();
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const exists = relationships.some((relationship) => relationship.id === draft.id);
    if (exists) {
      onChange(relationships.map((relationship) => (relationship.id === draft.id ? draft : relationship)));
    } else {
      onChange([...relationships, { ...draft, id: randomId() }]);
    }
    resetDraft();
  }

  function createNew() {
    setDraft({
      id: randomId(),
      fieldName: "",
      fieldType: RelFieldTypeList.ManyToOne,
      otherEntityRelationshipName: "",
      otherEntityTableName: entityOptions[0]?.value ?? "",
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Relacionamentos</h3>
          <button type="button" className="primary-button" onClick={createNew}>
            Novo relacionamento
          </button>
        </div>
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Entidade</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {relationships.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-500">
                  Nenhum relacionamento cadastrado
                </td>
              </tr>
            ) : (
              relationships.map((relationship) => (
                <tr key={relationship.id}>
                  <td>{relationship.fieldName}</td>
                  <td>{relationship.fieldType}</td>
                  <td>{relationship.otherEntityTableName}</td>
                  <td className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleEdit(relationship)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleRemove(relationship.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">
          {draft
            ? relationships.some((relationship) => relationship.id === draft.id)
              ? "Editar relacionamento"
              : "Novo relacionamento"
            : "Selecione um relacionamento"}
        </h3>
        {draft ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label>Nome (camelCase)</label>
              <input
                value={draft.fieldName}
                onChange={(event) => setDraft({ ...draft, fieldName: event.target.value })}
                required
              />
            </div>
            <div>
              <label>Tipo</label>
              <select
                value={draft.fieldType}
                onChange={(event) =>
                  setDraft({ ...draft, fieldType: event.target.value as RelFieldTypeList })
                }
              >
                {!REL_FIELD_TYPE_OPTIONS.includes(draft.fieldType as RelFieldTypeList) ? (
                  <option value={draft.fieldType}>{draft.fieldType}</option>
                ) : null}
                {REL_FIELD_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Entidade relacionada</label>
              <select
                value={draft.otherEntityTableName}
                onChange={(event) => setDraft({ ...draft, otherEntityTableName: event.target.value })}
              >
                <option value="">Selecione uma entidade</option>
                {entityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Nome na outra entidade</label>
              <input
                value={draft.otherEntityRelationshipName}
                onChange={(event) =>
                  setDraft({ ...draft, otherEntityRelationshipName: event.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="secondary-button" onClick={resetDraft}>
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                Salvar relacionamento
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-600">
            Seleciona um relacionamento existente ou clique em "Novo relacionamento".
          </p>
        )}
      </div>
    </div>
  );
}

function ViewsTab({
  fields,
  relationships,
  views,
  onChange,
  fieldOptions,
  relationshipOptions,
}: {
  fields: EditableField[];
  relationships: EditableRelationship[];
  views: EditableView[];
  onChange: (views: EditableView[]) => void;
  fieldOptions: Array<{ value: string; label: string }>;
  relationshipOptions: Array<{ value: string; label: string }>;
}) {
  const [activeViewId, setActiveViewId] = useState(views[0]?.id ?? "");
  const activeView = views.find((view) => view.id === activeViewId) ?? views[0];

  useEffect(() => {
    if (!views.some((view) => view.id === activeViewId)) {
      setActiveViewId(views[0]?.id ?? "");
    }
  }, [views, activeViewId]);

  function createView() {
    const id = randomId();
    const newView: EditableView = {
      id,
      name: `Visão ${views.length + 1}`,
      data: {},
    };
    onChange([...views, newView]);
    setActiveViewId(id);
  }

  function updateView(id: string, patch: Partial<EditableView["data"]> | { name: string }) {
    onChange(
      views.map((view) => {
        if (view.id !== id) return view;
        if ("name" in patch && Object.keys(patch).length === 1) {
          return { ...view, name: (patch as { name: string }).name };
        }
        return { ...view, data: { ...view.data, ...(patch as Partial<EditableView["data"]>) } };
      })
    );
  }

  function removeView(id: string) {
    const next = views.filter((view) => view.id !== id);
    onChange(next);
    if (activeViewId === id) {
      setActiveViewId(next[0]?.id ?? "");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              className={`tab-button ${view.id === activeView?.id ? "active" : ""}`}
              onClick={() => setActiveViewId(view.id)}
            >
              {view.name}
            </button>
          ))}
        </div>
        <button type="button" className="primary-button" onClick={createView}>
          Nova visão
        </button>
      </div>

      {activeView ? (
        <div className="card space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label>Nome da visão</label>
              <input
                value={activeView.name}
                onChange={(event) => updateView(activeView.id, { name: event.target.value })}
              />
            </div>
            <button type="button" className="danger-button" onClick={() => removeView(activeView.id)}>
              Remover visão
            </button>
          </div>
          <ViewDetailsEditor
            view={activeView}
            update={(data) => updateView(activeView.id, data)}
            fieldOptions={fieldOptions}
            relationshipOptions={relationshipOptions}
          />
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-slate-600">Nenhuma visão cadastrada. Clique em "Nova visão".</p>
        </div>
      )}
    </div>
  );
}

function ViewDetailsEditor({
  view,
  update,
  fieldOptions,
  relationshipOptions,
}: {
  view: EditableView;
  update: (data: Partial<DataBaseEntityView>) => void;
  fieldOptions: Array<{ value: string; label: string }>;
  relationshipOptions: Array<{ value: string; label: string }>;
}) {
  const details: DataBaseEntityViewDetails = view.data._ ?? {};

  function updateDetails<K extends keyof DataBaseEntityViewDetails>(
    key: K,
    value: DataBaseEntityViewDetails[K]
  ) {
    update({ _: { ...details, [key]: value } });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h4 className="section-title">Detalhes gerais</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Classe da entidade</label>
            <input
              value={details.entityClass ?? ""}
              onChange={(event) => updateDetails("entityClass", event.target.value)}
            />
          </div>
          <div>
            <label>Rota no front-end</label>
            <input
              value={details.frontPath ?? ""}
              onChange={(event) => updateDetails("frontPath", event.target.value)}
            />
          </div>
          <div>
            <label>Rota de API</label>
            <input
              value={details.urlPath ?? ""}
              onChange={(event) => updateDetails("urlPath", event.target.value)}
            />
          </div>
          <div>
            <label>Rótulo no menu</label>
            <input
              value={details.menuLabel ?? ""}
              onChange={(event) => updateDetails("menuLabel", event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              checked={Boolean(details.allViewInOne)}
              onChange={(event) => updateDetails("allViewInOne", event.target.checked)}
            />
            Carregar todas as vistas na mesma página
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="section-title">Rótulos</h4>
        <p className="section-subtitle">Textos apresentados na lista e formulários.</p>
        <LabelsEditor labels={details.labels} onChange={(labels) => updateDetails("labels", labels)} />
      </section>

      <section className="space-y-4">
        <h4 className="section-title">Componentes visuais</h4>
        <p className="section-subtitle">
          Configure botões padrão e comportamento de listas e formulários.
        </p>
        <ComponentsEditor
          components={details.components}
          onChange={(components) => updateDetails("components", components)}
        />
      </section>

      <section className="space-y-4">
        <h4 className="section-title">Filtros padrão</h4>
        <FiltersEditor
          filters={details.filters}
          onChange={(filters) => updateDetails("filters", filters)}
        />
      </section>

      <section className="space-y-4">
        <h4 className="section-title">Ordenação padrão</h4>
        <SortEditor
          sort={details.sort}
          onChange={(sort) => updateDetails("sort", sort)}
          fieldOptions={fieldOptions}
        />
      </section>

      <section className="space-y-4">
        <h4 className="section-title">Campos visíveis</h4>
        <ShowFieldsEditor
          value={details.showFields}
          onChange={(value) => updateDetails("showFields", value)}
          fieldOptions={fieldOptions}
        />
      </section>

      <LayoutsEditor
        view={view}
        update={update}
        fieldOptions={fieldOptions}
        relationshipOptions={relationshipOptions}
      />
    </div>
  );
}

function LabelsEditor({
  labels,
  onChange,
}: {
  labels?: DataBaseEntityViewDetails["labels"];
  onChange: (labels: DataBaseEntityViewDetails["labels"]) => void;
}) {
  const data = labels ?? {};
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>Título da lista</label>
        <input
          value={data.listTitle ?? ""}
          onChange={(event) => onChange({ ...data, listTitle: event.target.value })}
        />
      </div>
      <div>
        <label>Título de exclusão</label>
        <input
          value={data.deleteTitle ?? ""}
          onChange={(event) => onChange({ ...data, deleteTitle: event.target.value })}
        />
      </div>
      <div>
        <label>Texto do botão "novo"</label>
        <input
          value={data.textNewButton ?? ""}
          onChange={(event) => onChange({ ...data, textNewButton: event.target.value })}
        />
      </div>
      <div>
        <label>Título de edição</label>
        <input
          value={data.editTitle ?? ""}
          onChange={(event) => onChange({ ...data, editTitle: event.target.value })}
        />
      </div>
      <div>
        <label>Título de criação</label>
        <input
          value={data.newTitle ?? ""}
          onChange={(event) => onChange({ ...data, newTitle: event.target.value })}
        />
      </div>
      <div>
        <label>Texto do botão cancelar</label>
        <input
          value={data.textCancelButton ?? ""}
          onChange={(event) => onChange({ ...data, textCancelButton: event.target.value })}
        />
      </div>
      <div>
        <label>Texto do botão salvar</label>
        <input
          value={data.textSaveButton ?? ""}
          onChange={(event) => onChange({ ...data, textSaveButton: event.target.value })}
        />
      </div>
    </div>
  );
}

function ComponentsEditor({
  components,
  onChange,
}: {
  components?: DataBaseEntityViewTableComponent;
  onChange: (value: DataBaseEntityViewTableComponent | undefined) => void;
}) {
  const data: DataBaseEntityViewTableComponent = components ?? {};
  const reloadValue = (() => {
    if (typeof data.reloadOnSaveButton === "boolean") {
      return data.reloadOnSaveButton ? "true" : "false";
    }
    if (typeof data.reloadOnSaveButton === "string" && data.reloadOnSaveButton.length > 0) {
      return data.reloadOnSaveButton;
    }
    return "false";
  })();
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(data.showNewButton)}
          onChange={(event) => onChange({ ...data, showNewButton: event.target.checked })}
        />
        Mostrar botão "novo"
      </label>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(data.showFilterButton)}
          onChange={(event) => onChange({ ...data, showFilterButton: event.target.checked })}
        />
        Mostrar filtro
      </label>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(data.showDetailButton)}
          onChange={(event) => onChange({ ...data, showDetailButton: event.target.checked })}
        />
        Mostrar botão de detalhes
      </label>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(data.showEditButton)}
          onChange={(event) => onChange({ ...data, showEditButton: event.target.checked })}
        />
        Mostrar botão de edição
      </label>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(data.showDeleteButton)}
          onChange={(event) => onChange({ ...data, showDeleteButton: event.target.checked })}
        />
        Mostrar botão de exclusão
      </label>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(data.showCancelButton)}
          onChange={(event) => onChange({ ...data, showCancelButton: event.target.checked })}
        />
        Mostrar botão cancelar (formulário)
      </label>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(data.showSaveButton)}
          onChange={(event) => onChange({ ...data, showSaveButton: event.target.checked })}
        />
        Mostrar botão salvar (formulário)
      </label>
      <div>
        <label>Recarregar após salvar</label>
        <select
          value={reloadValue === "true" || reloadValue === "false" ? reloadValue : "custom"}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "true" || value === "false") {
              onChange({ ...data, reloadOnSaveButton: value === "true" });
              return;
            }
            if (value === "custom" && typeof data.reloadOnSaveButton === "string") {
              onChange({ ...data, reloadOnSaveButton: data.reloadOnSaveButton });
            } else {
              onChange({ ...data, reloadOnSaveButton: value });
            }
          }}
        >
          <option value="false">Não</option>
          <option value="true">Sim</option>
          <option value="custom">Personalizado (especifique no JSON avançado)</option>
        </select>
      </div>
    </div>
  );
}

function FiltersEditor({
  filters,
  onChange,
}: {
  filters?: DataBaseEntityViewTableFilter;
  onChange: (value: DataBaseEntityViewTableFilter | undefined) => void;
}) {
  const data = filters ?? {};
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>Filtros base (JSON)</label>
        <textarea
          rows={4}
          value={data.baseFilters ? JSON.stringify(data.baseFilters, null, 2) : ""}
          onChange={(event) => {
            const value = event.target.value;
            try {
              onChange({ ...data, baseFilters: value ? JSON.parse(value) : undefined });
            } catch (error) {
              onChange({ ...data, baseFilters: value });
            }
          }}
        />
      </div>
      <div>
        <label>Filtros extras (expressão)</label>
        <textarea
          rows={4}
          value={data.extraFilters ?? ""}
          onChange={(event) => onChange({ ...data, extraFilters: event.target.value })}
        />
      </div>
      <div>
        <label>Itens por página</label>
        <input
          type="number"
          value={data.itemsPerPage ?? ""}
          onChange={(event) =>
            onChange({ ...data, itemsPerPage: event.target.value ? Number(event.target.value) : undefined })
          }
        />
      </div>
      <div>
        <label>Campo de ordenação</label>
        <input
          value={data.sortField ?? ""}
          onChange={(event) => onChange({ ...data, sortField: event.target.value })}
        />
      </div>
      <div>
        <label>Ordem</label>
        <select
          value={data.sortOrder ?? ""}
          onChange={(event) => onChange({ ...data, sortOrder: event.target.value as "asc" | "desc" | undefined })}
        >
          <option value="">Padrão</option>
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </div>
    </div>
  );
}

function SortEditor({
  sort,
  onChange,
  fieldOptions,
}: {
  sort?: Array<Record<string, "asc" | "desc">>;
  onChange: (value: Array<Record<string, "asc" | "desc">> | undefined) => void;
  fieldOptions: Array<{ value: string; label: string }>;
}) {
  const [field, setField] = useState<string>(fieldOptions[0]?.value ?? "");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const entries = sort ?? [];

  function addRule(event: React.FormEvent) {
    event.preventDefault();
    if (!field) return;
    const record: Record<string, "asc" | "desc"> = { [field]: order };
    onChange([...(sort ?? []), record]);
  }

  function removeRule(index: number) {
    const next = entries.filter((_, idx) => idx !== index);
    onChange(next.length ? next : undefined);
  }

  return (
    <div className="space-y-3">
      <form className="inline-form" onSubmit={addRule}>
        <div>
          <label>Campo</label>
          <select value={field} onChange={(event) => setField(event.target.value)}>
            {fieldOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Ordem</label>
          <select value={order} onChange={(event) => setOrder(event.target.value as "asc" | "desc")}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <button type="submit" className="primary-button">
          Adicionar ordenação
        </button>
      </form>
      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-600">Nenhuma regra de ordenação definida.</p>
        ) : (
          entries.map((entry, index) => {
            const [[entryField, entryOrder]] = Object.entries(entry);
            return (
              <div
                key={`${entryField}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <span>
                  {entryField} • {entryOrder === "asc" ? "Ascendente" : "Descendente"}
                </span>
                <button type="button" className="danger-button" onClick={() => removeRule(index)}>
                  Remover
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ShowFieldsEditor({
  value,
  onChange,
  fieldOptions,
}: {
  value?: DataBaseEntityShowFieldsComponent;
  onChange: (value: DataBaseEntityShowFieldsComponent | undefined) => void;
  fieldOptions: Array<{ value: string; label: string }>;
}) {
  const data = value ?? {};

  function toggle(list: string[] | undefined, candidate: string): string[] {
    const current = new Set(list ?? []);
    if (current.has(candidate)) {
      current.delete(candidate);
    } else {
      current.add(candidate);
    }
    return Array.from(current);
  }

  function renderCheckboxList(label: string, current: string[] | undefined, key: keyof typeof data) {
    return (
      <div>
        <p className="font-medium">{label}</p>
        <div className="grid grid-cols-2 gap-2">
          {fieldOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm font-normal">
              <input
                type="checkbox"
                checked={current?.includes(option.value) ?? false}
                onChange={() =>
                  onChange({ ...data, [key]: toggle(current, option.value) } as typeof data)
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {renderCheckboxList("Campos da lista", data.showFieldsTable, "showFieldsTable")}
      {renderCheckboxList("Campos do formulário", data.showFieldsForm, "showFieldsForm")}
      {renderCheckboxList("Campos da visualização", data.showFieldsView, "showFieldsView")}
    </div>
  );
}

function LayoutsEditor({
  view,
  update,
  fieldOptions,
  relationshipOptions,
}: {
  view: EditableView;
  update: (data: Partial<DataBaseEntityView>) => void;
  fieldOptions: Array<{ value: string; label: string }>;
  relationshipOptions: Array<{ value: string; label: string }>;
}) {
  return (
    <section className="space-y-6">
      <h4 className="section-title">Layouts</h4>
      <LayoutEditor
        title="Filtros"
        value={view.data.filterLayout}
        onChange={(filterLayout) =>
          update({ filterLayout: filterLayout as DataBaseEntityViewFilterLayout | undefined })
        }
        baseOptions={[...fieldOptions, ...relationshipOptions]}
        allowSubGroup
      />
      <LayoutEditor
        title="Tabela"
        value={view.data.tableLayout}
        onChange={(tableLayout) =>
          update({ tableLayout: tableLayout as DataBaseEntityViewTableLayout | undefined })
        }
        baseOptions={[...fieldOptions, ...relationshipOptions]}
      />
      <LayoutEditor
        title="Formulário"
        value={view.data.formLayout}
        onChange={(formLayout) =>
          update({ formLayout: formLayout as DataBaseEntityViewFormLayout | undefined })
        }
        baseOptions={[...fieldOptions, ...relationshipOptions]}
        allowTabs
      />
      <LayoutEditor
        title="Detalhes"
        value={view.data.viewLayout}
        onChange={(viewLayout) =>
          update({ viewLayout: viewLayout as DataBaseEntityViewViewLayout | undefined })
        }
        baseOptions={[...fieldOptions, ...relationshipOptions]}
      />
    </section>
  );
}

type LayoutEditorProps = {
  title: string;
  value?: Record<string, unknown>;
  onChange: (value: Record<string, unknown> | undefined) => void;
  baseOptions: Array<{ value: string; label: string }>;
  allowSubGroup?: boolean;
  allowTabs?: boolean;
};

function LayoutEditor({
  title,
  value,
  onChange,
  baseOptions,
  allowSubGroup,
  allowTabs,
}: LayoutEditorProps) {
  const entries = Object.entries(value ?? {}).filter(([key]) => key !== "_");
  const globalConfig = value?._ as Record<string, unknown> | undefined;

  const [draftKey, setDraftKey] = useState<string>("");
  const [draftConfig, setDraftConfig] = useState<Record<string, unknown>>({});

  function resetDraft() {
    setDraftKey("");
    setDraftConfig({});
  }

  function saveDraft(event: React.FormEvent) {
    event.preventDefault();
    if (!draftKey) return;
    const current = { ...(value ?? {}) };
    current[draftKey] = draftConfig;
    onChange(current);
    resetDraft();
  }

  function removeEntry(key: string) {
    const current = { ...(value ?? {}) };
    delete current[key];
    const remainingKeys = Object.keys(current).filter((item) => item !== "_");
    if (remainingKeys.length === 0 && !current._) {
      onChange(undefined);
    } else {
      onChange(current);
    }
  }

  function updateGlobal(config: Record<string, unknown>) {
    const current = { ...(value ?? {}) };
    if (Object.keys(config).length === 0) {
      delete current._;
    } else {
      current._ = config;
    }
    const remainingKeys = Object.keys(current).filter((item) => item !== "_");
    if (remainingKeys.length === 0 && !current._) {
      onChange(undefined);
    } else {
      onChange(current);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-semibold">{title}</h5>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setDraftKey("");
            setDraftConfig({});
          }}
        >
          Adicionar componente
        </button>
      </div>
      <GlobalLayoutConfigEditor
        heading="Configuração geral (chave '_')"
        config={globalConfig}
        onChange={updateGlobal}
        allowSubGroup={allowSubGroup}
      />
      <div className="grid gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-600">Nenhum componente configurado.</p>
        ) : (
          entries.map(([key, config]) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{key}</p>
                  <p className="text-xs text-slate-500">{summaryFromConfig(config)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setDraftKey(key);
                      setDraftConfig({ ...(config as Record<string, unknown>) });
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="danger-button" onClick={() => removeEntry(key)}>
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {draftKey ? (
        <div className="card space-y-4">
          <h6 className="text-base font-semibold">Configurar componente</h6>
          <form className="space-y-4" onSubmit={saveDraft}>
            <div>
              <label>Campo / relação</label>
              <select value={draftKey} onChange={(event) => setDraftKey(event.target.value)}>
                <option value="">Selecione</option>
                {baseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <LayoutConfigForm
              config={draftConfig}
              onChange={setDraftConfig}
              allowTabs={allowTabs}
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="secondary-button" onClick={resetDraft}>
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                Salvar componente
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function GlobalLayoutConfigEditor({
  heading,
  config,
  onChange,
  allowSubGroup,
}: {
  heading: string;
  config: Record<string, unknown> | undefined;
  onChange: (config: Record<string, unknown>) => void;
  allowSubGroup?: boolean;
}) {
  const data = config ?? {};

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h6 className="text-base font-semibold">{heading}</h6>
      <div className="grid grid-cols-2 gap-4">
        {allowSubGroup ? (
          <>
            <div>
              <label>Rótulo</label>
              <input
                value={(data as Record<string, unknown>).label?.toString() ?? ""}
                onChange={(event) => onChange({ ...data, label: event.target.value })}
              />
            </div>
            <div>
              <label>Tamanho</label>
              <input
                type="number"
                value={(data as Record<string, unknown>).size?.toString() ?? ""}
                onChange={(event) =>
                  onChange({ ...data, size: event.target.value ? Number(event.target.value) : undefined })
                }
              />
            </div>
          </>
        ) : null}
        <label className="flex items-center gap-2 text-sm font-normal">
          <input
            type="checkbox"
            checked={Boolean(data.hidden)}
            onChange={(event) => onChange({ ...data, hidden: event.target.checked })}
          />
          Ocultar componente
        </label>
        <label className="flex items-center gap-2 text-sm font-normal">
          <input
            type="checkbox"
            checked={Boolean((data as Record<string, unknown>).disabled)}
            onChange={(event) => onChange({ ...data, disabled: event.target.checked })}
          />
          Desabilitar componente
        </label>
      </div>
      <div className="mt-4">
        <label>Configuração avançada (_ como JSON)</label>
        <textarea
          rows={4}
          value={Object.keys(data).length ? JSON.stringify(data, null, 2) : ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) {
              onChange({});
              return;
            }
            try {
              const parsed = JSON.parse(value);
              onChange(parsed);
            } catch (error) {
              // Aguarda JSON válido antes de atualizar o objeto
            }
          }}
        />
        <p className="help-text">
          Use este campo para definir propriedades adicionais na chave "_" conforme necessário.
        </p>
      </div>
    </div>
  );
}

function LayoutConfigForm({
  config,
  onChange,
  allowTabs,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  allowTabs?: boolean;
}) {
  function update(key: string, value: unknown) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>Tipo</label>
        <select
          value={(config.type as string | undefined) ?? ""}
          onChange={(event) => update("type", event.target.value || undefined)}
        >
          <option value="">Padrão</option>
          <option value="GROUP">Group</option>
          {allowTabs ? <option value="TABS">Tabs</option> : null}
          <option value="COLUMN">Coluna</option>
          <option value="RELATIONSHIP">Relacionamento</option>
          <option value="UNIQUE_COMPONENT">Componente personalizado</option>
          <option value="ENUM_FILTER">Filtro enum</option>
          <option value="ENTITY_FILTER">Filtro entidade</option>
        </select>
      </div>
      <div>
        <label>Rótulo</label>
        <input
          value={(config.label as string | undefined) ?? ""}
          onChange={(event) => update("label", event.target.value || undefined)}
        />
      </div>
      <div>
        <label>Descrição</label>
        <input
          value={(config.description as string | undefined) ?? ""}
          onChange={(event) => update("description", event.target.value || undefined)}
        />
      </div>
      <div>
        <label>Tamanho</label>
        <input
          type="number"
          value={(config.size as number | undefined) ?? ""}
          onChange={(event) =>
            update("size", event.target.value ? Number(event.target.value) : undefined)
          }
        />
      </div>
      <div>
        <label>Campos exibidos</label>
        <input
          value={Array.isArray(config.showFields) ? (config.showFields as string[]).join(",") : ""}
          onChange={(event) =>
            update("showFields", event.target.value ? event.target.value.split(",") : undefined)
          }
        />
      </div>
      <div>
        <label>Tipo de filtro</label>
        <select
          value={(config.filterMethod as string | undefined) ?? ""}
          onChange={(event) => update("filterMethod", event.target.value || undefined)}
        >
          <option value="">Padrão</option>
          <option value="contains">Contém</option>
          <option value="equals">Igual</option>
          <option value="in">Está em</option>
          <option value="notIn">Não está em</option>
          <option value="greaterThan">Maior que</option>
          <option value="lessThan">Menor que</option>
          <option value="greaterOrEqualThan">Maior ou igual</option>
          <option value="lessOrEqualThan">Menor ou igual</option>
          <option value="between">Entre</option>
          <option value="specified">Preenchido</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(config.hidden)}
          onChange={(event) => update("hidden", event.target.checked)}
        />
        Ocultar por padrão
      </label>
      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={Boolean(config.disabled)}
          onChange={(event) => update("disabled", event.target.checked)}
        />
        Desabilitar
      </label>
      <div>
        <label>Campos "super select"</label>
        <input
          value={Array.isArray(config.superSelect) ? (config.superSelect as string[]).join(",") : ""}
          onChange={(event) =>
            update("superSelect", event.target.value ? event.target.value.split(",") : undefined)
          }
        />
      </div>
      <div>
        <label>Máscara</label>
        <input
          value={(config.mask as string | undefined) ?? ""}
          onChange={(event) => update("mask", event.target.value || undefined)}
        />
      </div>
      <div>
        <label>Preview (Largura x Altura)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Largura"
            value={(config.widthPreview as string | undefined) ?? ""}
            onChange={(event) => update("widthPreview", event.target.value || undefined)}
          />
          <input
            placeholder="Altura"
            value={(config.heightPreview as string | undefined) ?? ""}
            onChange={(event) => update("heightPreview", event.target.value || undefined)}
          />
        </div>
      </div>
      <div className="col-span-2">
        <label>Propriedades adicionais (JSON)</label>
        <textarea
          rows={4}
          value={Object.keys(config).length ? JSON.stringify(config, null, 2) : ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) {
              onChange({});
              return;
            }
            try {
              const parsed = JSON.parse(value);
              onChange(parsed);
            } catch (error) {
              // Aguarda JSON válido antes de atualizar o objeto
            }
          }}
        />
        <p className="help-text">
          Utilize este campo para ajustar valores específicos do componente conforme a API do ERP.
        </p>
      </div>
    </div>
  );
}

function summaryFromConfig(config: unknown) {
  if (!config || typeof config !== "object") return "Configuração simples";
  const value = config as Record<string, unknown>;
  const summaryParts: string[] = [];
  if (value.type) summaryParts.push(`tipo: ${value.type}`);
  if (value.label) summaryParts.push(`rótulo: ${value.label}`);
  if (value.description) summaryParts.push(`descrição: ${value.description}`);
  if (value.showFields) summaryParts.push(`campos: ${(value.showFields as string[]).join(", ")}`);
  return summaryParts.join(" • ") || "Configuração simples";
}
