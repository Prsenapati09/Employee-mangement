import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

const leaveTypes = [
  "casual",
  "sick",
  "earned",
  "unpaid",
  "maternity",
  "paternity",
] as const;

const leaveFieldsSchema = z.object({
  employeeId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid employee ID"),
  leaveType: z.enum(leaveTypes),
  startDate: dateSchema,
  endDate: dateSchema,
  reason: z.string().trim().min(3).max(1000),
});

const validLeaveRange = (data: { startDate: string; endDate: string }) =>
  data.endDate >= data.startDate;
const leaveRangeIssue = {
  message: "End date must be on or after start date",
  path: ["endDate"] as PropertyKey[],
};

export const createLeaveSchema = leaveFieldsSchema.refine(
  validLeaveRange,
  leaveRangeIssue,
);
export const createOwnLeaveSchema = leaveFieldsSchema
  .omit({ employeeId: true })
  .refine(validLeaveRange, leaveRangeIssue);

export const reviewLeaveSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewComment: z.string().trim().max(1000).optional(),
});

export const leaveListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  leaveType: z.enum(leaveTypes).optional(),
  employeeId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
}).refine((data) => !data.from || !data.to || data.to >= data.from, {
  message: "End date filter must be on or after start date",
  path: ["to"],
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
export type LeaveListQuery = z.infer<typeof leaveListQuerySchema>;
