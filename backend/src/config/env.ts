import "dotenv/config";
import { z } from "zod";

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    MONGODB_URI: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(1).optional(),
    ),
    OWNER_PROVISIONING_SECRET: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(32).optional(),
    ),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  })
  .superRefine((configuration, context) => {
    if (configuration.NODE_ENV === "test") {
      if (!configuration.MONGODB_URI) {
        context.addIssue({
          code: "custom",
          path: ["MONGODB_URI"],
          message: "MONGODB_URI must be configured for tests.",
        });
      }
      return;
    }

    if (!configuration.MONGODB_URI) {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "MONGODB_URI must be configured with a MongoDB Atlas URI.",
      });
      return;
    }

    let atlasUri: URL;
    try {
      atlasUri = new URL(configuration.MONGODB_URI);
    } catch {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "MONGODB_URI must be a valid MongoDB Atlas URI.",
      });
      return;
    }

    if (
      atlasUri.protocol !== "mongodb+srv:" ||
      !atlasUri.hostname.toLowerCase().endsWith(".mongodb.net")
    ) {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "MONGODB_URI must use a MongoDB Atlas SRV connection string.",
      });
    }

    if (!atlasUri.username || !atlasUri.password) {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "MONGODB_URI must include Atlas database user credentials.",
      });
    }

    if (atlasUri.pathname.replace(/^\/+/, "").split("/")[0] !== "hrmpro") {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "MONGODB_URI must target the hrmpro database.",
      });
    }
  });

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const issues = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsedEnvironment.data;
