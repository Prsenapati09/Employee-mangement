import { app } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";

let server: ReturnType<typeof app.listen> | undefined;
let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down HRMPro API.`);

  let shutdownFailed = false;
  const activeServer = server;

  if (activeServer?.listening) {
    try {
      await new Promise<void>((resolve, reject) => {
        activeServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    } catch {
      console.error("Failed to close the HRMPro API server cleanly.");
      shutdownFailed = true;
    }
  }

  try {
    await disconnectDatabase();
  } catch {
    console.error("Failed to close the MongoDB connection cleanly.");
    shutdownFailed = true;
  }

  if (shutdownFailed) {
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});
process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

async function startServer(): Promise<void> {
  await connectDatabase();
  if (shuttingDown) {
    await disconnectDatabase();
    return;
  }

  server = app.listen(env.PORT, () => {
    console.log(`HRMPro API listening on port ${env.PORT}`);
  });
  server.on("error", () => {
    console.error("The HRMPro API server encountered an error.");
    process.exitCode = 1;
    void shutdown("SIGTERM");
  });
}

void startServer().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown startup error.";
  console.error(`HRMPro API startup failed: ${message}`);
  process.exitCode = 1;
});
