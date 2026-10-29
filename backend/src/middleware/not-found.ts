import type { RequestHandler } from "express";

export const notFound: RequestHandler = (_request, _response, next) => {
  next(Object.assign(new Error("Route not found"), { statusCode: 404 }));
};
