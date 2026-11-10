import { Schema, model, models, Types } from "mongoose";

export const documentCategories = [
  "identity",
  "contract",
  "resume",
  "certificate",
  "other",
] as const;

export type DocumentCategory = (typeof documentCategories)[number];

export interface EmployeeDocumentRecord {
  organizationId: Types.ObjectId;
  employeeId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  originalFilename: string;
  contentType: string;
  category: DocumentCategory;
  size: number;
  storageKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeDocumentSchema = new Schema<EmployeeDocumentRecord>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
      maxlength: 180,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["application/pdf", "image/jpeg", "image/png", "text/plain"],
    },
    category: {
      type: String,
      enum: documentCategories,
      required: true,
    },
    size: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 },
    storageKey: { type: String, required: true, unique: true, select: false },
  },
  { timestamps: true },
);

employeeDocumentSchema.index({ organizationId: 1, employeeId: 1, createdAt: -1 });

export const EmployeeDocumentRecordModel =
  models.EmployeeDocumentRecordModel ??
  model<EmployeeDocumentRecord>("EmployeeDocumentRecordModel", employeeDocumentSchema);
