import type { RequestHandler } from "express";
import type { AuthenticatedContext } from "../modules/auth/auth.service";

export type UserRole = AuthenticatedContext["role"];

export function requireRoles(...allowedRoles: UserRole[]): RequestHandler {
  return (_request, response, next) => {
    const authContext = response.locals.authContext as
      | AuthenticatedContext
      | undefined;

    if (!authContext) {
      response.status(401).json({
        success: false,
        error: { message: "Authentication is required." },
      });
      return;
    }

    if (!allowedRoles.includes(authContext.role)) {
      response.status(403).json({
        success: false,
        error: { message: "You do not have permission to perform this action." },
      });
      return;
    }

    next();
  };
}
