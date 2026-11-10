import { Router } from "express";
import { requireAuthentication } from "../auth/auth.middleware";
import { requireRoles } from "../../middleware/require-roles";
import { Organization } from "./organization.model";
import { updateOrganizationSchema } from "./organization.validation";

const organizationRouter = Router();

organizationRouter.use(requireAuthentication);
organizationRouter.get(
  "/",
  requireRoles("owner", "admin", "hr"),
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
      const organization = await Organization.findOne({
        _id: context.organizationId,
        status: "active",
      })
        .select("_id name slug status")
        .lean();
      if (!organization) {
        response.status(404).json({
          success: false,
          error: { message: "Organization not found." },
        });
        return;
      }
      response.status(200).json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  },
);

organizationRouter.patch(
  "/",
  requireRoles("owner", "admin"),
  async (request, response, next) => {
    const context = response.locals.authContext;
    if (!context) {
      response.status(401).json({
        success: false,
        error: { message: "Authentication is required." },
      });
      return;
    }

    const input = updateOrganizationSchema.safeParse(request.body);
    if (!input.success) {
      response.status(400).json({
        success: false,
        error: { message: "Invalid organization settings." },
      });
      return;
    }

    try {
      const organization = await Organization.findOneAndUpdate(
        { _id: context.organizationId, status: "active" },
        { $set: { name: input.data.name } },
        { new: true, runValidators: true },
      )
        .select("_id name slug status")
        .lean();
      if (!organization) {
        response.status(404).json({
          success: false,
          error: { message: "Organization not found." },
        });
        return;
      }
      response.status(200).json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  },
);

export { organizationRouter };
