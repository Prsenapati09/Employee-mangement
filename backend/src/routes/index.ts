import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { attendanceRouter } from "../modules/attendance/attendance.routes";
import { contactRouter } from "../modules/contact/contact.routes";
import { departmentRouter } from "../modules/departments/department.routes";
import { employeeRouter } from "../modules/employees/employee.routes";
import { healthRouter } from "./health.routes";
import { leaveRouter } from "../modules/leave-management/leave.routes";
import { reportsRouter } from "../modules/reports/reports.routes";
import { documentRouter } from "../modules/documents/document.routes";
import { organizationRouter } from "../modules/organization/organization.routes";
import { userRouter } from "../modules/users/user.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/employees", employeeRouter);
apiRouter.use("/departments", departmentRouter);
apiRouter.use("/attendance", attendanceRouter);
apiRouter.use("/leaves", leaveRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/documents", documentRouter);
apiRouter.use("/organization", organizationRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/contact", contactRouter);

export { apiRouter };
