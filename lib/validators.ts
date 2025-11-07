import { z } from "zod";
import { FieldTypeList, RelFieldTypeList } from "@/types/database";

const fieldSchema = z.object({
  fieldName: z.string().min(1),
  fieldSize: z.number().int().positive().optional(),
  fieldDefault: z.union([z.string(), z.number()]).optional(),
  fieldType: z.union([z.nativeEnum(FieldTypeList), z.string().min(1)]),
  fieldSpecialType: z.string().optional(),
  fieldValues: z.union([z.string(), z.array(z.string())]).optional(),
});

const relationshipSchema = z.object({
  fieldName: z.string().min(1),
  fieldType: z.union([z.nativeEnum(RelFieldTypeList), z.string().min(1)]),
  otherEntityTableName: z.string().min(1),
  otherEntityRelationshipName: z.string().min(1),
});

const layoutSchema = z.record(z.any()).optional();

const viewSchema = z
  .object({
    _: z.any().optional(),
    _translate: z.any().optional(),
    filterLayout: layoutSchema,
    tableLayout: layoutSchema,
    formLayout: layoutSchema,
    viewLayout: layoutSchema,
  })
  .optional();

export const entitySchema = z.object({
  entityName: z.string().optional(),
  entityNameHumanized: z.string().optional(),
  entityNameHumanizedPlural: z.string().optional(),
  frontPath: z.string().optional(),
  backPath: z.string().optional(),
  allViewInOne: z.boolean().optional(),
  showClientView: z.boolean().optional(),
  showSiteView: z.boolean().optional(),
  notlistButtons: z.boolean().optional(),
  hasWhiteLabel: z.boolean().optional(),
  hasSoftDelete: z.boolean().optional(),
  hasDateAudit: z.boolean().optional(),
  fields: z.array(fieldSchema).optional(),
  relationships: z.array(relationshipSchema).optional(),
  views: z.union([viewSchema, z.array(viewSchema)]).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  entities: z.array(entitySchema).default([]),
});

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
