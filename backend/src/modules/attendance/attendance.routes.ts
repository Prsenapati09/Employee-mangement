import { Router, type Response } from "express";
import { requireAuthentication } from "../auth/auth.middleware";
import { requireRoles } from "../../middleware/require-roles";
import {
  AttendanceServiceError,
  createAttendance,
  deleteAttendance,
  type AttendanceScope,
  getAttendance,
  listAttendance,
  updateAttendance,
} from "./attendance.service";
import {
  EmployeeServiceError,
  getEmployeeForUser,
  getManagerDepartment,
} from "../employees/employee.service";
import {
  attendanceListQuerySchema,
  createAttendanceSchema,
  updateAttendanceSchema,
} from "./attendance.validation";

const attendanceRouter = Router();

attendanceRouter.use(requireAuthentication);

function sendEmployeeScopeError(error: unknown, response: Response, next: (error?: unknown) => void) {
  if (error instanceof EmployeeServiceError) {
    response.status(error.statusCode).json({
      success: false,
      error: { message: error.message },
    });
    return;
  }
  next(error);
}

function sendServiceError(error: unknown, response: Response, next: (error?: unknown) => void) {
  if (error instanceof AttendanceServiceError) {
    response.status(error.statusCode).json({
      success: false,
      error: { message: error.message },
    });
    return;
  }
  next(error);
}

attendanceRouter.get("/", requireRoles("owner", "admin", "hr", "manager"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const query = attendanceListQuerySchema.safeParse(request.query);
  if (!query.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid attendance search parameters." },
    });
    return;
  }

  try {
    const scope: AttendanceScope | undefined = context.role === "manager"
      ? {
          department: await getManagerDepartment(
            context.organizationId,
            context.userId,
          ),
        }
      : undefined;
    const result = await listAttendance(context.organizationId, query.data, scope);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    sendEmployeeScopeError(error, response, next);
  }
});

attendanceRouter.get("/me", async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const query = attendanceListQuerySchema.safeParse(request.query);
  if (!query.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid attendance search parameters." },
    });
    return;
  }

  try {
    const employee = await getEmployeeForUser(
      context.organizationId,
      context.userId,
    );
    const result = await listAttendance(
      context.organizationId,
      query.data,
      { employeeId: employee._id.toString() },
    );
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    sendEmployeeScopeError(error, response, next);
  }
});

attendanceRouter.post("/", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const input = createAttendanceSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid attendance details." },
    });
    return;
  }

  try {
    const attendance = await createAttendance(
      context.organizationId,
      context.userId,
      input.data,
    );
    response.status(201).json({ success: true, data: attendance });
  } catch (error) {
    sendServiceError(error, response, next);
  }
});

attendanceRouter.get("/:id", requireRoles("owner", "admin", "hr", "manager"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const scope: AttendanceScope | undefined = context.role === "manager"
      ? {
          department: await getManagerDepartment(
            context.organizationId,
            context.userId,
          ),
        }
      : undefined;
    const attendance = await getAttendance(
      context.organizationId,
      String(request.params.id),
      scope,
    );
    response.status(200).json({ success: true, data: attendance });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      sendEmployeeScopeError(error, response, next);
      return;
    }
    sendServiceError(error, response, next);
  }
});

attendanceRouter.patch("/:id", requireRoles("owner", "admin", "hr"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  const input = updateAttendanceSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid attendance update details." },
    });
    return;
  }

  try {
    const attendance = await updateAttendance(
      context.organizationId,
      String(request.params.id),
      input.data,
    );
    response.status(200).json({ success: true, data: attendance });
  } catch (error) {
    sendServiceError(error, response, next);
  }
});

attendanceRouter.delete("/:id", requireRoles("owner", "admin"), async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const result = await deleteAttendance(context.organizationId, String(request.params.id));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    sendServiceError(error, response, next);
  }
});

export { attendanceRouter };
