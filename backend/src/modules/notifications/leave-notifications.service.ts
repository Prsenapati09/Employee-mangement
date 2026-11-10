import { Types } from "mongoose";
import { User } from "../users/user.model";
import { sendNotificationEmail } from "./email.service";

type LeaveNotificationDetails = {
  organizationId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
};

export async function notifyLeaveRequest(
  details: LeaveNotificationDetails,
): Promise<void> {
  try {
    const reviewers = await User.find({
      organizationId: new Types.ObjectId(details.organizationId),
      status: "active",
      role: { $in: ["owner", "admin", "hr", "manager"] },
    }).select("email").lean();

    const recipients = [...new Set(reviewers.map((user) => user.email).filter(Boolean))];
    if (recipients.length === 0) return;

    await sendNotificationEmail({
      to: recipients,
      subject: `New leave request: ${details.employeeName}`,
      text: [
        "A new leave request has been submitted in HRMPro.",
        "",
        `Employee: ${details.employeeName}`,
        `Employee email: ${details.employeeEmail}`,
        `Leave type: ${details.leaveType}`,
        `Start date: ${details.startDate}`,
        `End date: ${details.endDate}`,
        `Total days: ${details.totalDays}`,
        `Reason: ${details.reason}`,
      ].join("\n"),
    });
  } catch {
    console.error("Unable to prepare leave request notification.");
  }
}
export async function notifyLeaveReview(
  details: {
    employeeEmail: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: "approved" | "rejected";
    reviewComment?: string;
  },
): Promise<void> {
  try {
    await sendNotificationEmail({
      to: details.employeeEmail,
      subject: `Leave request ${details.status}: ${details.leaveType}`,
      text: [
        `Hello ${details.employeeName},`,
        "",
        `Your ${details.leaveType} leave request has been ${details.status}.`,
        `Start date: ${details.startDate}`,
        `End date: ${details.endDate}`,
        details.reviewComment ? `Review comment: ${details.reviewComment}` : "",
        "",
        "HRMPro",
      ].filter(Boolean).join("\n"),
    });
  } catch {
    console.error("Unable to prepare leave review notification.");
  }
}
