import { Schema, model, models, Types, type Model } from "mongoose";

export interface EmployeeInvitationDocument {
  organizationId: Types.ObjectId;
  employeeId: Types.ObjectId;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  acceptedAt?: Date;
  invitedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const employeeInvitationSchema = new Schema<EmployeeInvitationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      immutable: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      immutable: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

employeeInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
employeeInvitationSchema.index({ employeeId: 1, acceptedAt: 1 });

export const EmployeeInvitation: Model<EmployeeInvitationDocument> =
  (models.EmployeeInvitation as Model<EmployeeInvitationDocument> | undefined) ??
  model<EmployeeInvitationDocument>("EmployeeInvitation", employeeInvitationSchema);
