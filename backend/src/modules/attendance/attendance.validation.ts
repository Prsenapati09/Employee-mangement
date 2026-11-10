import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const createAttendanceSchema = z.object({
  employeeId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid employee ID."),
  attendanceDate: z.string().regex(datePattern, "Date must use YYYY-MM-DD format."),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  status: z.enum(["present", "late", "half_day", "absent"]).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateAttendanceSchema = z.object({
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  status: z.enum(["present", "late", "half_day", "absent"]).optional(),
  notes: z.string().trim().max(500).optional(),
}).refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  { message: "At least one field must be provided." },
);

export const attendanceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  date: z.string().regex(datePattern).optional(),
  from: z.string().regex(datePattern).optional(),
  to: z.string().regex(datePattern).optional(),
  status: z.enum(["present", "late", "half_day", "absent"]).optional(),
  employeeId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
}).refine(
  (data) => !data.from || !data.to || data.from <= data.to,
  { message: "Start date must be before or equal to end date.", path: ["from"] },
);
