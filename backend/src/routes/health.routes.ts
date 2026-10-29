import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    data: { status: "ok" },
  });
});

export { healthRouter };
