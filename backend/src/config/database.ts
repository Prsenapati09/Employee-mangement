import mongoose from "mongoose";
import { env } from "./env";

function getSafeConnectionErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unable to connect to MongoDB. Check MONGODB_URI, network access, and credentials.";
  }

  const details = error as { name?: unknown; code?: unknown };
  const knownErrorNames = new Set([
    "MongoServerError",
    "MongoNetworkError",
    "MongoServerSelectionError",
    "MongoParseError",
  ]);
  const errorName =
    typeof details.name === "string" && knownErrorNames.has(details.name)
      ? details.name
      : undefined;
  const errorCode =
    typeof details.code === "number" && Number.isSafeInteger(details.code)
      ? details.code
      : undefined;

  if (errorName === "MongoServerError" && errorCode === 8000) {
    return "MongoDB returned MongoServerError code 8000. Verify the database user credentials, authentication configuration, and roles in Atlas Database Access.";
  }

  if (errorName && errorCode !== undefined) {
    return `MongoDB returned ${errorName} code ${errorCode}. Check Atlas Database Access, network access, and cluster availability.`;
  }

  if (errorName) {
    return `MongoDB connection failed with ${errorName}. Check Atlas network access, cluster availability, and URI configuration.`;
  }

  return "Unable to connect to MongoDB. Check MONGODB_URI, network access, and credentials.";
}

export async function connectDatabase(): Promise<void> {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured before connecting to MongoDB.");
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
  } catch (error: unknown) {
    throw new Error(getSafeConnectionErrorMessage(error));
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}
