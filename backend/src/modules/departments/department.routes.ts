import { Router } from "express";
import { requireAuthentication } from "../auth/auth.middleware";
import { requireRoles } from "../../middleware/require-roles";
import { getManagerDepartment } from "../employees/employee.service";
import {
  createDepartment,
  deleteDepartment,
  DepartmentServiceError,
  getDepartment,
  listDepartments,
  updateDepartment,
} from "./department.service";
import {
  createDepartmentSchema,
  departmentListQuerySchema,
  updateDepartmentSchema,
} from "./department.validation";

const departmentRouter = Router();

departmentRouter.use(requireAuthentication);

departmentRouter.get("/", requireRoles("owner", "admin", "hr", "manager"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const query = departmentListQuerySchema.safeParse(request.query);
  if (!query.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid department search parameters." },
    });
    return;
  }

  try {
    const departmentScope = context.role === "manager"
      ? await getManagerDepartment(context.organizationId, context.userId)
      : undefined;
    const result = await listDepartments(
      context.organizationId,
      query.data,
      departmentScope,
    );
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

departmentRouter.post("/", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const input = createDepartmentSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid department details." },
    });
    return;
  }

  try {
    const department = await createDepartment(
      context.organizationId,
      context.userId,
      input.data,
    );
    response.status(201).json({ success: true, data: department });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

departmentRouter.get("/:id", requireRoles("owner", "admin", "hr", "manager"), async (request, response, next) => {
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
    const department = await getDepartment(
      context.organizationId,
      String(request.params.id),
      departmentScope,
    );
    response.status(200).json({ success: true, data: department });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    if (error instanceof Error && "statusCode" in error) {
      response.status(Number(error.statusCode)).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

departmentRouter.patch("/:id", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const input = updateDepartmentSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid department update details." },
    });
    return;
  }

  try {
    const department = await updateDepartment(
      context.organizationId,
      String(request.params.id),
      input.data,
    );
    response.status(200).json({ success: true, data: department });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

departmentRouter.delete("/:id", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const result = await deleteDepartment(
      context.organizationId,
      String(request.params.id),
    );
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      response.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
});

export { departmentRouter };
