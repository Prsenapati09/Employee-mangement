import type { RequestHandler } from "express";
import { authenticateAccessToken } from "./auth.service";
import type { AuthenticatedContext } from "./auth.service";

declare module "express-serve-static-core" {
  interface Locals {
    authContext?: AuthenticatedContext;
  }
}

export const requireAuthentication: RequestHandler = async (
  request,
  response,
  next,
) => {
  const authorization = request.header("authorization");
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/);
  if (!match) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const context = await authenticateAccessToken(match[1]);
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  response.locals.authContext = context;
  next();
};
