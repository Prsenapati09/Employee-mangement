import { z } from "zod";
import { documentCategories } from "./document.model";

export const documentUploadSchema = z.object({
  filename: z.string().trim().min(1).max(180).refine(
    (value) => !/[\u0000-\u001f\u007f/\\]/.test(value),
    "Invalid filename.",
  ),
  category: z.enum(documentCategories),
  contentType: z.enum([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
  ]),
});
