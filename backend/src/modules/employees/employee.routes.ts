import { Router } from "express";
import { requireAuthentication } from "../auth/auth.middleware";
import { requireRoles } from "../../middleware/require-roles";
import { inviteEmployee, EmployeeInvitationError } from "./employee-invitation.service";
import {
  createEmployee,
  deleteEmployee,
  EmployeeServiceError,
  getEmployeeForUser,
  getManagerDepartment,
  getEmployee,
  listEmployees,
  updateEmployee,
} from "./employee.service";
import {
  createEmployeeSchema,
  employeeListQuerySchema,
  updateEmployeeSchema,
} from "./employee.validation";

const employeeRouter = Router();

employeeRouter.use(requireAuthentication);

employeeRouter.get("/me", async (_request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const employee = await getEmployeeForUser(
      context.organizationId,
      context.userId,
    );
    response.status(200).json({ success: true, data: employee });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

employeeRouter.get("/", requireRoles("owner", "admin", "hr", "manager"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const query = employeeListQuerySchema.safeParse(request.query);
  if (!query.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid employee search parameters." },
    });
    return;
  }

  try {
    const departmentScope = context.role === "manager"
      ? await getManagerDepartment(context.organizationId, context.userId)
      : undefined;
    const result = await listEmployees(
      context.organizationId,
      query.data,
      departmentScope,
    );
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

employeeRouter.post("/", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const input = createEmployeeSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid employee details." },
    });
    return;
  }

  try {
    const employee = await createEmployee(
      context.organizationId,
      context.userId,
      input.data,
    );
    response.status(201).json({ success: true, data: employee });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

employeeRouter.get("/:id", requireRoles("owner", "admin", "hr", "manager"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const departmentScope = context.role === "manager"
      ? await getManagerDepartment(context.organizationId, context.userId)
      : undefined;
    const employee = await getEmployee(
      context.organizationId,
      String(request.params.id),
      departmentScope,
    );
    response.status(200).json({ success: true, data: employee });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

employeeRouter.patch("/:id", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const input = updateEmployeeSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid employee update details." },
    });
    return;
  }

  try {
    const employee = await updateEmployee(
      context.organizationId,
      String(request.params.id),
      input.data,
    );
    response.status(200).json({ success: true, data: employee });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

employeeRouter.delete("/:id", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const result = await deleteEmployee(context.organizationId, String(request.params.id));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});


employeeRouter.post("/:id/invite", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    await inviteEmployee(
      context.organizationId,
      String(request.params.id),
      context.userId,
    );
    response.status(200).json({
      success: true,
      data: { message: "Employee invitation sent successfully." },
    });
  } catch (error) {
    if (error instanceof EmployeeInvitationError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});
export { employeeRouter };
