import { Router } from "express";
import { requireAuthentication } from "../auth/auth.middleware";
import { requireRoles } from "../../middleware/require-roles";
import { reportQuerySchema } from "./reports.validation";
import { getOrganizationReport } from "./reports.service";

const reportsRouter = Router();

reportsRouter.use(requireAuthentication);
reportsRouter.get(
  "/summary",
  requireRoles("owner", "admin", "hr"),
  async (request, response, next) => {
    const context = response.locals.authContext;
    if (!context) {
      response.status(401).json({
        success: false,
        error: { message: "Authentication is required." },
      });
      return;
    }

    const query = reportQuerySchema.safeParse(request.query);
    if (!query.success) {
      response.status(400).json({
        success: false,
        error: { message: "Invalid report date range." },
      });
      return;
    }

    try {
      const report = await getOrganizationReport(
        context.organizationId,
        query.data,
      );
      response.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },
);

export { reportsRouter };
