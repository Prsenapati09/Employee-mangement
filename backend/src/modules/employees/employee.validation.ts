import { z } from "zod";

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional();

export const createEmployeeSchema = z.object({
  employeeCode: z.string().trim().min(1).max(50),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: optionalText(30),
  department: optionalText(100),
  jobTitle: optionalText(100),
  dateOfJoining: z.coerce.date().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const employeeListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
