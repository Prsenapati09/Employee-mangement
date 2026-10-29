import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured before connecting to MongoDB.");
  }

  await mongoose.connect(env.MONGODB_URI);
}
