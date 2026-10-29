import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const statusCode =
    typeof error?.statusCode === "number" &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  const message =
    statusCode >= 500 && env.NODE_ENV === "production"
      ? "Internal server error"
      : error instanceof Error
        ? error.message
        : "Internal server error";

  response.status(statusCode).json({
    success: false,
    error: { message },
  });
};
