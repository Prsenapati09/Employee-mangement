import { Types } from "mongoose";
import { AuthSession } from "../auth/auth-session.model";
import { User } from "./user.model";

export class UserManagementError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "UserManagementError";
  }
}

export async function listOrganizationUsers(organizationId: string) {
  return User.find({ organizationId })
    .select("_id email role status createdAt")
    .sort({ createdAt: 1 })
    .lean();
}

export async function updateOrganizationUserStatus(
  organizationId: string,
  actorId: string,
  actorRole: "owner" | "admin",
  targetUserId: string,
  status: "active" | "suspended",
) {
  if (!Types.ObjectId.isValid(targetUserId)) {
    throw new UserManagementError("User not found.", 404);
  }
  if (targetUserId === actorId) {
    throw new UserManagementError("You cannot change your own account status.", 409);
  }

  const target = await User.findOne({
    _id: new Types.ObjectId(targetUserId),
    organizationId: new Types.ObjectId(organizationId),
  }).select("_id role");

  if (!target) {
    throw new UserManagementError("User not found.", 404);
  }
  if (target.role === "owner" || (actorRole === "admin" && target.role === "admin")) {
    throw new UserManagementError(
      "You do not have permission to change this account status.",
      403,
    );
  }

  const user = await User.findOneAndUpdate(
    { _id: target._id, organizationId: new Types.ObjectId(organizationId) },
    { $set: { status } },
    { new: true, runValidators: true },
  )
    .select("_id email role status createdAt")
    .lean();

  if (!user) {
    throw new UserManagementError("User not found.", 404);
  }
  if (status === "suspended") {
    await AuthSession.deleteMany({
      userId: target._id,
      organizationId: new Types.ObjectId(organizationId),
    });
  }
  return user;
}
