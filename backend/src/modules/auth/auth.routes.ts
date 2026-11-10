import { Router } from "express";
import { env } from "../../config/env";
import { requireAuthentication } from "./auth.middleware";
import { authRateLimiter } from "../../middleware/auth-rate-limiter";
import {
  AuthError,
  acceptEmployeeInvitation,
  getCurrentProfile,
  isValidOwnerProvisioningSecret,
  login,
  requestPasswordReset,
  resetPassword,
  registerOrganizationOwner,
  revokeAccessToken,
} from "./auth.service";
import { acceptInvitationSchema, forgotPasswordSchema, loginSchema, ownerRegistrationSchema, resetPasswordSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post("/register-owner", authRateLimiter, async (request, response, next) => {
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

authRouter.post("/login", authRateLimiter, async (request, response, next) => {
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


authRouter.post("/forgot-password", authRateLimiter, async (request, response, next) => {
  const input = forgotPasswordSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid password recovery details." },
    });
    return;
  }

  try {
    await requestPasswordReset(input.data);
    response.status(200).json({
      success: true,
      data: { message: "If an account matches those details, a password reset email will be sent." },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/reset-password", authRateLimiter, async (request, response, next) => {
  const input = resetPasswordSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid password reset details." },
    });
    return;
  }

  try {
    await resetPassword(input.data);
    response.status(200).json({
      success: true,
      data: { message: "Password reset successfully. Please sign in again." },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/accept-invitation", authRateLimiter, async (request, response, next) => {
  const input = acceptInvitationSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid invitation details." },
    });
    return;
  }

  try {
    await acceptEmployeeInvitation(input.data);
    response.status(201).json({
      success: true,
      data: { message: "Employee account activated. You can now sign in." },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});
export { authRouter };
