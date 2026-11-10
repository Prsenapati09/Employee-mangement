import { Router } from "express";
import { requireAuthentication } from "../auth/auth.middleware";
import { requireRoles } from "../../middleware/require-roles";
import {
  listOrganizationUsers,
  updateOrganizationUserStatus,
  UserManagementError,
} from "./user.service";
import { updateUserStatusSchema } from "./user.validation";

const userRouter = Router();

userRouter.use(requireAuthentication);
userRouter.use(requireRoles("owner", "admin"));

userRouter.get("/", async (_request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const users = await listOrganizationUsers(context.organizationId);
    response.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/:id/status", async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context || (context.role !== "owner" && context.role !== "admin")) {
    response.status(context ? 403 : 401).json({
      success: false,
      error: { message: context
        ? "You do not have permission to perform this action."
        : "Authentication is required." },
    });
    return;
  }
  const input = updateUserStatusSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid user status." },
    });
    return;
  }

  try {
    const user = await updateOrganizationUserStatus(
      context.organizationId,
      context.userId,
      context.role,
      String(request.params.id),
      input.data.status,
    );
    response.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof UserManagementError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

export { userRouter };
