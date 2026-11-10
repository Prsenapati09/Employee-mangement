import { Schema, model, models, Types } from "mongoose";

export type AttendanceStatus = "present" | "late" | "half_day" | "absent";

export interface AttendanceDocument {
  organizationId: Types.ObjectId;
  employeeId: Types.ObjectId;
  attendanceDate: string;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    attendanceDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    checkIn: Date,
    checkOut: Date,
    status: {
      type: String,
      enum: ["present", "late", "half_day", "absent"],
      default: "present",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

attendanceSchema.index(
  { organizationId: 1, employeeId: 1, attendanceDate: 1 },
  { unique: true },
);

export const Attendance =
  models.Attendance ||
  model<AttendanceDocument>("Attendance", attendanceSchema);
