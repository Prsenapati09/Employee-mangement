import { NextFunction, Request, Response, Router } from "express";
import { requireAuthentication } from "../auth/auth.middleware";
import { requireRoles } from "../../middleware/require-roles";
import { LeaveService, LeaveServiceError } from "./leave.service";
import {
  getEmployeeForUser,
  getManagerDepartment,
} from "../employees/employee.service";
import {
  createLeaveSchema,
  createOwnLeaveSchema,
  leaveListQuerySchema,
  reviewLeaveSchema,
} from "./leave.validation";

const leaveRouter = Router();

leaveRouter.use(requireAuthentication);

function getAuthContext(response: Response) {
  return response.locals.authContext as {
    organizationId: string;
    userId: string;
    role: "owner" | "admin" | "hr" | "manager" | "employee";
  };
}

async function getLeaveScope(
  context: ReturnType<typeof getAuthContext>,
) {
  if (context.role === "employee") {
    const employee = await getEmployeeForUser(
      context.organizationId,
      context.userId,
    );
    return { employeeId: employee._id.toString() };
  }
  if (context.role === "manager") {
    return {
      department: await getManagerDepartment(
        context.organizationId,
        context.userId,
      ),
    };
  }
  return undefined;
}

function handleError(
  error: unknown,
  response: Response,
  next: NextFunction
) {
  if (error instanceof LeaveServiceError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  next(error);
}

leaveRouter.get("/", requireRoles("owner", "admin", "hr", "manager", "employee"), async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = leaveListQuerySchema.parse(request.query);
    const context = getAuthContext(response);
    const scope = await getLeaveScope(context);
    const result = await LeaveService.listLeaves(
      context.organizationId,
      query,
      scope,
    );
    response.json(result);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      response.status(400).json({ message: "Invalid leave list filters" });
      return;
    }
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({ message: error.message });
      return;
    }
    handleError(error, response, next);
  }
});

leaveRouter.get("/me", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = leaveListQuerySchema.parse(request.query);
    const context = getAuthContext(response);
    const employee = await getEmployeeForUser(
      context.organizationId,
      context.userId,
    );
    const result = await LeaveService.listLeaves(
      context.organizationId,
      query,
      { employeeId: employee._id.toString() },
    );
    response.json(result);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      response.status(400).json({ message: "Invalid leave list filters" });
      return;
    }
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({ message: error.message });
      return;
    }
    handleError(error, response, next);
  }
});

leaveRouter.post("/", requireRoles("owner", "admin", "hr"), async (request: Request, response: Response, next: NextFunction) => {
  try {
    const input = createLeaveSchema.parse(request.body);
    const { organizationId, userId } = getAuthContext(response);
    const leave = await LeaveService.createLeave(organizationId, userId, input);
    response.status(201).json({ leave });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      response.status(400).json({ message: "Invalid leave request", details: error });
      return;
    }
    handleError(error, response, next);
  }
});

leaveRouter.post("/me", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const input = createOwnLeaveSchema.parse(request.body);
    const context = getAuthContext(response);
    const employee = await getEmployeeForUser(
      context.organizationId,
      context.userId,
    );
    const leave = await LeaveService.createLeave(
      context.organizationId,
      context.userId,
      { ...input, employeeId: employee._id.toString() },
    );
    response.status(201).json({ leave });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      response.status(400).json({ message: "Invalid leave request" });
      return;
    }
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({ message: error.message });
      return;
    }
    handleError(error, response, next);
  }
});

leaveRouter.get("/me/:id", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const context = getAuthContext(response);
    const employee = await getEmployeeForUser(
      context.organizationId,
      context.userId,
    );
    const leave = await LeaveService.getLeave(
      context.organizationId,
      String(request.params.id),
      { employeeId: employee._id.toString() },
    );
    response.json({ leave });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({ message: error.message });
      return;
    }
    handleError(error, response, next);
  }
});

leaveRouter.get("/:id", requireRoles("owner", "admin", "hr", "manager"), async (request: Request, response: Response, next: NextFunction) => {
  try {
    const context = getAuthContext(response);
    const scope = await getLeaveScope(context);
    const leave = await LeaveService.getLeave(
      context.organizationId,
      String(request.params.id),
      scope,
    );
    response.json({ leave });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({ message: error.message });
      return;
    }
    handleError(error, response, next);
  }
});

leaveRouter.patch("/:id/review", requireRoles("owner", "admin", "hr", "manager"), async (request: Request, response: Response, next: NextFunction) => {
  try {
    const input = reviewLeaveSchema.parse(request.body);
    const { organizationId, userId, role } = getAuthContext(response);
    const departmentScope = role === "manager"
      ? await getManagerDepartment(organizationId, userId)
      : undefined;
    const leave = await LeaveService.reviewLeave(
      organizationId,
      userId,
      String(request.params.id),
      input,
      departmentScope,
    );
    response.json({ leave });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      response.status(400).json({ message: "Invalid leave review", details: error });
      return;
    }
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({ message: error.message });
      return;
    }
    handleError(error, response, next);
  }
});

leaveRouter.patch("/:id/cancel", requireRoles("owner", "admin", "hr"), async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { organizationId } = getAuthContext(response);
    const leave = await LeaveService.cancelLeave(organizationId, String(request.params.id));
    response.json({ leave });
  } catch (error) {
    handleError(error, response, next);
  }
});

leaveRouter.patch("/me/:id/cancel", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const context = getAuthContext(response);
    const employee = await getEmployeeForUser(
      context.organizationId,
      context.userId,
    );
    const leave = await LeaveService.cancelLeave(
      context.organizationId,
      String(request.params.id),
      employee._id.toString(),
    );
    response.json({ leave });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({ message: error.message });
      return;
    }
    handleError(error, response, next);
  }
});

export { leaveRouter };
