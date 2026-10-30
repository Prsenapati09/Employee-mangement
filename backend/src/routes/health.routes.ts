import { Router } from "express";
import { isDatabaseReady } from "../config/database";

const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    data: { status: "ok" },
  });
});

healthRouter.get("/ready", (_request, response) => {
  if (!isDatabaseReady()) {
    response.status(503).json({
      success: false,
      error: { message: "Database is not ready." },
    });
    return;
  }

  response.status(200).json({
    success: true,
    data: { status: "ready", database: "connected" },
  });
});

export { healthRouter };
