import { createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env";
import { Employee } from "./employee.model";
import { EmployeeInvitation } from "./employee-invitation.model";
import { sendNotificationEmail } from "../notifications/email.service";

export class EmployeeInvitationError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "EmployeeInvitationError";
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function inviteEmployee(
  organizationId: string,
  employeeId: string,
  invitedBy: string,
  sendEmail = sendNotificationEmail,
): Promise<void> {
  const employee = await Employee.findOne({
    _id: employeeId,
    organizationId,
    status: "active",
  });

  if (!employee) {
    throw new EmployeeInvitationError("Active employee not found.", 404);
  }

  if (employee.userId) {
    throw new EmployeeInvitationError("Employee already has a linked account.", 409);
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await EmployeeInvitation.deleteMany({
    employeeId: employee._id,
    organizationId,
    acceptedAt: null,
  });

  const invitation = await EmployeeInvitation.create({
    organizationId: employee.organizationId,
    employeeId: employee._id,
    email: employee.email,
    tokenHash,
    expiresAt,
    invitedBy,
  });

  const invitationUrl = new URL("/accept-invitation", env.FRONTEND_URL);
  invitationUrl.searchParams.set("token", token);

  const sent = await sendEmail({
    to: employee.email,
    subject: "Your HRMPro employee invitation",
    text: [
      `Hello ${employee.firstName},`,
      "",
      "You have been invited to join HRMPro.",
      `Accept your invitation within 24 hours: ${invitationUrl.toString()}`,
      "",
      "If you were not expecting this invitation, you can ignore this email.",
    ].join("\n"),
  });

  if (!sent) {
    await EmployeeInvitation.deleteOne({ _id: invitation._id });
    throw new EmployeeInvitationError(
      "Invitation email could not be delivered. Please check email configuration and try again.",
      503,
    );
  }
}
