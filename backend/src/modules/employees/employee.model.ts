import { Schema, model, models, Types, type Model } from "mongoose";

export type EmployeeStatus = "active" | "inactive" | "on_leave";

export interface EmployeeDocument {
  organizationId: Types.ObjectId;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  userId?: Types.ObjectId;
  phone?: string;
  department?: string;
  jobTitle?: string;
  dateOfJoining?: Date;
  status: EmployeeStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<EmployeeDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    employeeCode: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    dateOfJoining: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
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

employeeSchema.index(
  { organizationId: 1, employeeCode: 1 },
  { unique: true },
);
employeeSchema.index(
  { organizationId: 1, email: 1 },
  { unique: true },
);

employeeSchema.index({ organizationId: 1, userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });

export const Employee: Model<EmployeeDocument> =
  (models.Employee as Model<EmployeeDocument> | undefined) ??
  model<EmployeeDocument>("Employee", employeeSchema);
