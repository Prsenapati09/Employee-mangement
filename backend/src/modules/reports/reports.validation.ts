import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function isCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const reportQuerySchema = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
  })
  .superRefine((query, context) => {
    if (query.from && !isCalendarDate(query.from)) {
      context.addIssue({
        code: "custom",
        path: ["from"],
        message: "Invalid start date.",
      });
    }
    if (query.to && !isCalendarDate(query.to)) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "Invalid end date.",
      });
    }
    if (query.from && query.to && query.from > query.to) {
      context.addIssue({
        code: "custom",
        path: ["from"],
        message: "Start date must be on or before end date.",
      });
    }
  });
