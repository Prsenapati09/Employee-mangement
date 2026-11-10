import { Router } from "express";
import nodemailer from "nodemailer";
import { z } from "zod";
import { env } from "../../config/env";
import { ContactMessage } from "./contact.model";

const contactRouter = Router();

const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5000),
  website: z.string().optional().default(""),
});

contactRouter.post("/", async (request, response, next) => {
  const input = contactMessageSchema.safeParse(request.body);

  if (!input.success) {
    response.status(400).json({
      success: false,
      error: { message: "Please provide valid contact details." },
    });
    return;
  }

  // Silently accept submissions that fill the hidden honeypot field.
  if (input.data.website.trim().length > 0) {
    response.status(201).json({
      success: true,
      message: "Your message has been received.",
    });
    return;
  }

  try {
    const contactMessage = await ContactMessage.create({
      name: input.data.name,
      email: input.data.email,
      subject: input.data.subject,
      message: input.data.message,
    });

    // Email is optional. A mail delivery failure must not lose the saved message.
    if (
      env.SMTP_USER &&
      env.SMTP_APP_PASSWORD &&
      env.CONTACT_NOTIFICATION_EMAIL
    ) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_APP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"HRMPro Contact Form" <${env.SMTP_USER}>`,
          to: env.CONTACT_NOTIFICATION_EMAIL,
          replyTo: input.data.email,
          subject: `Contact form: ${input.data.subject}`,
          text: [
            "A new message was submitted through the HRMPro contact form.",
            "",
            `Name: ${input.data.name}`,
            `Email: ${input.data.email}`,
            `Subject: ${input.data.subject}`,
            "",
            "Message:",
            input.data.message,
            "",
            `Message ID: ${contactMessage._id.toString()}`,
          ].join("\n"),
        });
      } catch (emailError) {
        console.error(
          "Contact message was saved, but notification email could not be sent.",
          emailError instanceof Error ? emailError.message : "Unknown email error.",
        );
      }
    }

    response.status(201).json({
      success: true,
      message: "Your message has been received.",
      data: { id: contactMessage._id },
    });
  } catch (error) {
    next(error);
  }
});

export { contactRouter };
