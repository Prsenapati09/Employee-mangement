import { Schema, model, models, Types } from "mongoose";

export type DepartmentStatus = "active" | "inactive";

export interface DepartmentDocument {
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  status: DepartmentStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

departmentSchema.index(
  { organizationId: 1, name: 1 },
  { unique: true },
);

export const Department =
  models.Department ||
  model<DepartmentDocument>("Department", departmentSchema);
