import { Router } from "express";
import { env } from "../../config/env";
import { requireAuthentication } from "./auth.middleware";
import {
  AuthError,
  getCurrentProfile,
  isValidOwnerProvisioningSecret,
  login,
  registerOrganizationOwner,
  revokeAccessToken,
} from "./auth.service";
import { loginSchema, ownerRegistrationSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post("/register-owner", async (request, response, next) => {
  if (!env.OWNER_PROVISIONING_SECRET) {
    response.status(503).json({
      success: false,
      error: { message: "Owner provisioning is not configured." },
    });
    return;
  }

  if (
    !isValidOwnerProvisioningSecret(
      request.header("x-owner-provisioning-key"),
      env.OWNER_PROVISIONING_SECRET,
    )
  ) {
    response.status(403).json({
      success: false,
      error: { message: "Owner provisioning is not authorized." },
    });
    return;
  }

  const input = ownerRegistrationSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid registration details." },
    });
    return;
  }

  try {
    const result = await registerOrganizationOwner(input.data);
    response.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  const input = loginSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid login details." },
    });
    return;
  }

  try {
    const result = await login(input.data);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AuthError && error.statusCode === 401) {
      response.status(401).json({
        success: false,
        error: { message: "Invalid organization, email, or password." },
      });
      return;
    }
    next(error);
  }
});

authRouter.get("/me", requireAuthentication, async (_request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const profile = await getCurrentProfile(context);
    response.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

authRouter.post(
  "/logout",
  requireAuthentication,
  async (_request, response, next) => {
    const context = response.locals.authContext;
    if (!context) {
      response.status(401).json({
        success: false,
        error: { message: "Authentication is required." },
      });
      return;
    }

    try {
      await revokeAccessToken(context);
      response.status(200).json({
        success: true,
        data: { message: "Logged out successfully." },
      });
    } catch (error) {
      next(error);
    }
  },
);

export { authRouter };
