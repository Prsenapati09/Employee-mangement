import { Schema, model, models, Types } from "mongoose";

export type LeaveType = "casual" | "sick" | "earned" | "unpaid" | "maternity" | "paternity";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveDocument {
  organizationId: Types.ObjectId;
  employeeId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewComment?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<LeaveDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, required: true, ref: "Employee", index: true },
    leaveType: {
      type: String,
      enum: ["casual", "sick", "earned", "unpaid", "maternity", "paternity"],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      required: true,
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewComment: { type: String, trim: true, maxlength: 1000 },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

leaveSchema.index({ organizationId: 1, employeeId: 1, startDate: 1, endDate: 1 });

export const Leave =
  models.Leave || model<LeaveDocument>("Leave", leaveSchema);
