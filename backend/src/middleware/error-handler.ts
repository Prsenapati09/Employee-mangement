import type { ErrorRequestHandler } from "express";

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
    const errorName = error instanceof Error ? error.name : "UnknownError";
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (typeof error.code === "string" || typeof error.code === "number")
        ? error.code
        : undefined;
    console.error("Request failed.", { errorName, errorCode });
  }

  const message =
    statusCode >= 500
      ? "Internal server error"
      : error instanceof Error
        ? error.message
        : "Internal server error";

  response.status(statusCode).json({
    success: false,
    error: { message },
  });
};
