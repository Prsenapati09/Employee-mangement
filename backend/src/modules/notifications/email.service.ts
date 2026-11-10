import nodemailer from "nodemailer";
import { env } from "../../config/env";

type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
};

export async function sendNotificationEmail(
  message: EmailMessage,
): Promise<boolean> {
  if (!env.SMTP_USER || !env.SMTP_APP_PASSWORD) {
    console.warn("Notification email skipped: SMTP is not configured.");
    return false;
  }

  const recipients = (Array.isArray(message.to) ? message.to : [message.to])
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"HRMPro Notifications" <${env.SMTP_USER}>`,
      to: recipients,
      subject: message.subject,
      text: message.text,
    });

    return true;
  } catch {
    console.error("Notification email failed.");
    return false;
  }
}
