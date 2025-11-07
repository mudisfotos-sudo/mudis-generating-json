export enum FieldTypeList {
  Enum = "Enum",
  Integer = "Integer",
  Decimal = "Decimal",
  String = "String",
  Text = "Text",
  LongBlob = "LongBlob",
  Html = "Html",
  Boolean = "Boolean",
  File = "File",
  Image = "Image",
  DateTime = "DateTime",
  Time = "Time",
}

export enum FieldSpecialTypeList {
  Order = "Order",
}

export enum RelFieldTypeList {
  ManyToOne = "ManyToOne",
  ManyToOneReverso = "ManyToOne_reverso",
  ManyToMany = "ManyToMany",
  ManyToManyReverso = "ManyToMany_reverso",
  OneToMany = "OneToMany",
  OneToManyReverso = "OneToMany_reverso",
  OneToOne = "OneToOne",
  OneToOneReverso = "OneToOne_reverso",
}

export enum PermissionsMethod {
  LIST = "LIST",
  SEE = "SEE",
  CREATE = "CREATE",
  EDIT = "EDIT",
  REMOVE = "REMOVE",
}

export type DataBaseEntityViewTableLabel = {
  listTitle?: string;
  deleteTitle?: string;
  textNewButton?: string;
  editTitle?: string;
  newTitle?: string;
  textCancelButton?: string;
  textSaveButton?: string;
};

export type DataBaseEntityShowFieldsComponent = {
  showFieldsTable?: string[];
  showFieldsForm?: string[];
  showFieldsView?: string[];
};

export type ButtonComponent = {
  label: string;
  modalMsg?: string;
  modalHtml?: string;
  icon: string;
  link?: string;
  target?: string;
  click?: string;
  menuButton?: string;
  apiLink?: DataBaseApiLinkComponent;
  disabled?: string;
  hidden?: string;
  permissionSession?: string;
  permissionMethod?: string;
};

export type DataBaseEntityViewTableComponent = {
  showNewButton?: boolean | undefined;
  linkNewButton?: string | undefined;
  showFilterButton?: boolean | undefined;
  showDetailButton?: boolean | undefined;
  linkDetailButton?: string | undefined;
  showEditButton?: boolean | undefined;
  linkEditButton?: string | undefined;
  showDeleteButton?: boolean | undefined;
  viewButtons?: Record<string, unknown>;
  listSelectedButtons?: ButtonComponent[];
  listTopButtons?: ButtonComponent[];
  listButtons?: ButtonComponent[];
  formButtons?: ButtonComponent[];
  showCancelButton?: boolean | undefined;
  showSaveButton?: boolean | undefined;
  reloadOnSaveButton?: boolean | string | undefined;
};

export interface ShowAlertInputInputFile {
  id: string;
  type: "file";
  placeholder: string;
  label: string;
  default?: string;
  required?: boolean;
}

export interface ShowAlertInputInputText {
  id: string;
  type: "text";
  placeholder: string;
  label: string;
  default?: string;
  required?: boolean;
}

export interface ShowAlertInputInputNumber {
  id: string;
  type: "number";
  placeholder: string;
  label: string;
  default?: string | number;
  required?: boolean;
}

export interface ShowAlertInputInputDate {
  id: string;
  type:
    | "date"
    | "date-range"
    | "datetime"
    | "datetime-range"
    | "time"
    | "time-range";
  placeholder: string;
  label: string;
  min?: string;
  max?: string;
  default?: string | "today";
  required?: boolean;
  endpoint: string;
  filters: unknown;
  showFields: string[];
  printFields?: string;
}

export interface ShowAlertInputInputEntity {
  id: string;
  type: "entity";
  endpoint: string;
  placeholder: string;
  label: string;
  filters: unknown;
  showFields: string[];
  printFields?: string;
  required?: boolean;
}

export interface ShowAlertInputInputSelect {
  id: string;
  type: "select";
  placeholder: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
}

export type ShowAlertInputInputField =
  | ShowAlertInputInputDate
  | ShowAlertInputInputFile
  | ShowAlertInputInputText
  | ShowAlertInputInputNumber
  | ShowAlertInputInputEntity
  | ShowAlertInputInputSelect;

export type DataBaseApiLinkComponent = {
  method?: string;
  endpoint?: string;
  parameters?: string;
  extraFields?: ShowAlertInputInputField[];
  onSuccess?: {
    successMsg?: string;
    successButtonText?: string;
    successButtonLink?: string;
    successButtonTextSeq?: string;
    successButtonLinkSeq?: string;
  };
  onError?: {
    errorMsg?: string;
    errorButtonText?: string;
    errorButtonLink?: string;
    errorNavigate?: string;
    errorButtonTextSeq?: string;
    errorButtonLinkSeq?: string;
    errorNavigateSeq?: string;
  };
};

export type DataBaseEntityViewTableFilter = {
  baseFilters?: unknown;
  extraFilters?: string;
  activePage?: number;
  itemsPerPage?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
};

export type DataBaseEntityViewTable = {
  permissions?: Record<
    PermissionsMethod,
    {
      session: string;
      method: PermissionsMethod | string;
    }
  >;
};

export type DataBaseEntitySubGroup = {
  label?: string;
  size?: number;
  hidden?: boolean | string;
  disabled?: boolean | string;
};

export interface IEntityListSort {
  [key: string]: "asc" | "desc";
}

export type DataBaseEntityViewTableLayoutEntry =
  | {
      type?: "RELATIONSHIP" | "GROUP" | "UNIQUE_COMPONENT";
      RELATIONSHIP?: {
        relationshipName: string;
        relFieldList: unknown;
        defaultValue?: unknown;
      };
      childsComponents?:
        | DataBaseEntityViewFormLayout
        | DataBaseEntityViewFormLayout[];
      label?: string;
      description?: string;
      hidden?: boolean | string;
      mask?: string;
      showFields?: string[];
      optionsSort?: string;
      showCount?: "ALL" | "FIRST" | "LAST" | number;
      widthPreview?: string;
      heightPreview?: string;
    }
  | DataBaseEntityViewTable;

export type DataBaseEntityViewTableLayout = {
  _?: DataBaseEntityViewTable;
  [name: string]: DataBaseEntityViewTableLayoutEntry | undefined;
};

export type DataBaseEntityViewFormLayoutEntry =
  | {
      type?:
        | "GROUP"
        | "TABS"
        | "COLUMN"
        | "RELATIONSHIP"
        | "UNIQUE_COMPONENT";
      RELATIONSHIP?: {
        relationshipName: string;
        relFieldList: unknown;
        defaultValue?: unknown;
      };
      size?: number;
      label?: string;
      inputType?: string;
      disabled?: boolean | string;
      hidden?: boolean | string;
      description?: string;
      isRequired?: boolean | string;
      embedded?: boolean;
      childsComponents?:
        | DataBaseEntityViewFormLayout
        | DataBaseEntityViewFormLayout[];
      embebedFields?: {
        _?: unknown;
        filterLayout?: unknown;
        tableLayout?: unknown;
        formLayout?: unknown;
        viewLayout?: unknown;
      };
      showFields?: string[];
      typeComponent?: "Select" | "MultiSelect" | "Html" | "SelectList";
      filters?: unknown;
      maxSelected?: number;
      superSelect?: string[];
      widthPreview?: string;
      heightPreview?: string;
    }
  | DataBaseEntityViewTable;

export type DataBaseEntityViewFormLayout = {
  _?: DataBaseEntityViewTable | DataBaseEntitySubGroup;
  [name: string]: DataBaseEntityViewFormLayoutEntry | undefined;
};

export type DataBaseEntityViewFilterLayoutEntry =
  | {
      type?:
        | "GROUP"
        | "UNIQUE_COMPONENT"
        | "COLUMN"
        | "ENUM_FILTER"
        | "ENTITY_FILTER";
      enumFilter?: unknown;
      apiEntity?: {
        filterKey: string;
        endpoint: string;
        filters: Record<string, unknown>;
        showFields: string[];
      };
      size?: number;
      label?: string;
      description?: string;
      showFields?: string[];
      superSelect?: string[];
      childsComponents?:
        | DataBaseEntityViewFormLayout
        | DataBaseEntityViewFilterLayout;
      filterMethod?:
        | "contains"
        | "equals"
        | "in"
        | "notIn"
        | "greaterThan"
        | "lessThan"
        | "greaterOrEqualThan"
        | "lessOrEqualThan"
        | "between"
        | "specified";
    }
  | DataBaseEntityViewTable;

export type DataBaseEntityViewFilterLayout = {
  _?: DataBaseEntityViewTable | DataBaseEntitySubGroup;
  [name: string]: DataBaseEntityViewFilterLayoutEntry | undefined;
};

export type DataBaseEntityViewViewLayoutEntry =
  | {
      size?: number;
      label?: string;
      description?: string;
      showFields?: string[];
      widthPreview?: string;
      heightPreview?: string;
    }
  | DataBaseEntityViewTable;

export type DataBaseEntityViewViewLayout = {
  _?: DataBaseEntityViewTable;
  [name: string]: DataBaseEntityViewViewLayoutEntry | undefined;
};

export interface TranslateType {
  [tabId: string]: {
    [key: string]: string;
  };
}

export type DataBaseEntityViewDetails = {
  allViewInOne?: boolean;
  entityClass?: string;
  frontPath?: string;
  urlPath?: string;
  menuLabel?: string;
  sort?: Array<Record<string, "asc" | "desc">>;
  labels?: DataBaseEntityViewTableLabel;
  filters?: DataBaseEntityViewTableFilter;
  components?: DataBaseEntityViewTableComponent;
  showFields?: DataBaseEntityShowFieldsComponent;
};

export type DataBaseEntityView = {
  _?: DataBaseEntityViewDetails;
  _translate?: {
    all?: TranslateType;
    table?: TranslateType;
    form?: TranslateType;
    view?: TranslateType;
  };
  filterLayout?: DataBaseEntityViewFilterLayout;
  tableLayout?: DataBaseEntityViewTableLayout;
  formLayout?: DataBaseEntityViewFormLayout;
  viewLayout?: DataBaseEntityViewViewLayout;
};

export interface DataBaseEntityField {
  fieldName: string;
  fieldSize?: number;
  fieldDefault?: number | string;
  fieldType: FieldTypeList | string;
  fieldSpecialType?: FieldSpecialTypeList | string;
  fieldValues?: string | string[];
}

export interface DataBaseEntityRelationship {
  fieldName: string;
  fieldType:
    | RelFieldTypeList
    | "ManyToOne"
    | "ManyToOneReverso"
    | "ManyToMany"
    | "ManyToManyReverso"
    | "OneToMany"
    | "OneToManyReverso"
    | "OneToOne"
    | "OneToOneReverso";
  otherEntityTableName: string;
  otherEntityRelationshipName: string;
}

export interface DataBaseEntityType {
  entityName?: string;
  entityNameHumanized?: string;
  entityNameHumanizedPlural?: string;
  frontPath?: string;
  backPath?: string;
  allViewInOne?: boolean;
  showClientView?: boolean;
  showSiteView?: boolean;
  notlistButtons?: boolean;
  hasWhiteLabel?: boolean;
  hasSoftDelete?: boolean;
  hasDateAudit?: boolean;
  fields?: DataBaseEntityField[];
  relationships?: DataBaseEntityRelationship[];
  views?: DataBaseEntityView | DataBaseEntityView[];
}

export interface Project {
  name: string;
  description?: string;
  entities: Array<DataBaseEntityType & { _id: string }>;
}

export interface User {
  email: string;
  passwordHash: string;
}
