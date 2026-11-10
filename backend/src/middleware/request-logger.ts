import morgan from "morgan";

morgan.token("safe-url", (request) => {
  const originalUrl =
    "originalUrl" in request && typeof request.originalUrl === "string"
      ? request.originalUrl
      : request.url;
  return originalUrl?.split("?")[0] ?? "/";
});

export const requestLogger = morgan(
  ":method :safe-url :status :response-time ms - :res[content-length]",
);
