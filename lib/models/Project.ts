import { model, models, Schema, Types } from "mongoose";
import { FieldTypeList } from "@/types/database";

const fieldSchema = new Schema(
  {
    fieldName: { type: String, required: true },
    fieldSize: Number,
    fieldDefault: Schema.Types.Mixed,
    fieldType: {
      type: String,
      enum: [...(Object.values(FieldTypeList) as string[]), "String", "Number", "Boolean", "Date"],
      required: true,
    },
    fieldSpecialType: String,
    fieldValues: Schema.Types.Mixed,
  },
  { _id: false }
);

const relationshipSchema = new Schema(
  {
    fieldName: { type: String, required: true },
    fieldType: { type: String, required: true },
    otherEntityTableName: { type: String, required: true },
    otherEntityRelationshipName: { type: String, required: true },
  },
  { _id: false }
);

const viewSchema = new Schema(
  {
    _: Schema.Types.Mixed,
    _translate: Schema.Types.Mixed,
    filterLayout: Schema.Types.Mixed,
    tableLayout: Schema.Types.Mixed,
    formLayout: Schema.Types.Mixed,
    viewLayout: Schema.Types.Mixed,
  },
  { _id: false }
);

const entitySchema = new Schema(
  {
    entityName: String,
    entityNameHumanized: String,
    entityNameHumanizedPlural: String,
    frontPath: String,
    backPath: String,
    allViewInOne: Boolean,
    showClientView: Boolean,
    showSiteView: Boolean,
    notlistButtons: Boolean,
    hasWhiteLabel: Boolean,
    hasSoftDelete: Boolean,
    hasDateAudit: Boolean,
    fields: [fieldSchema],
    relationships: [relationshipSchema],
    views: Schema.Types.Mixed,
  },
  { timestamps: true }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    ownerId: { type: Types.ObjectId, required: true, ref: "User" },
    entities: [entitySchema],
  },
  { timestamps: true }
);

export const ProjectModel = models.Project || model("Project", projectSchema);
