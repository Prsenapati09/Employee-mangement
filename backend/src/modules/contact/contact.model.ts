import { Schema, model, models } from "mongoose";

export type ContactMessageStatus = "new" | "read" | "resolved";

export interface ContactMessageDocument {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: {
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
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["new", "read", "resolved"],
      default: "new",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const ContactMessage =
  models.ContactMessage ||
  model<ContactMessageDocument>("ContactMessage", contactMessageSchema);
