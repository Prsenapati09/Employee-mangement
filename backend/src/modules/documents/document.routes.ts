import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuthentication } from "../auth/auth.middleware";
import {
  DocumentServiceError,
  deleteEmployeeDocument,
  downloadEmployeeDocument,
  listEmployeeDocuments,
  uploadEmployeeDocument,
} from "./document.service";
import { documentUploadSchema } from "./document.validation";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many document uploads. Try again later." },
  },
});
const documentRouter = Router();

documentRouter.use(requireAuthentication);
documentRouter.use(
  express.raw({
    type: "application/octet-stream",
    limit: MAX_UPLOAD_BYTES,
  }),
);

function handleError(
  error: unknown,
  response: express.Response,
  next: express.NextFunction,
) {
  if (error instanceof DocumentServiceError) {
    response.status(error.statusCode).json({
      success: false,
      error: { message: error.message },
    });
    return;
  }
  next(error);
}

documentRouter.get("/employees/:employeeId", async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const documents = await listEmployeeDocuments(
      context,
      String(request.params.employeeId),
    );
    response.status(200).json({ success: true, data: documents });
  } catch (error) {
    handleError(error, response, next);
  }
});

documentRouter.post(
  "/employees/:employeeId",
  uploadRateLimit,
  async (request, response, next) => {
    const context = response.locals.authContext;
    if (!context) {
      response.status(401).json({
        success: false,
        error: { message: "Authentication is required." },
      });
      return;
    }

    let filename: string;
    try {
      filename = decodeURIComponent(request.header("x-document-filename") ?? "");
    } catch {
      response.status(400).json({
        success: false,
        error: { message: "Invalid document filename." },
      });
      return;
    }

    const requestType = request.header("content-type")?.split(";")[0]?.trim();
    const contentType = request.header("x-document-content-type");
    const input = documentUploadSchema.safeParse({
      filename,
      contentType,
      category: request.header("x-document-category"),
    });
    if (
      requestType !== "application/octet-stream" ||
      !input.success ||
      !Buffer.isBuffer(request.body)
    ) {
      response.status(400).json({
        success: false,
        error: { message: "Invalid document upload details." },
      });
      return;
    }

    try {
      const document = await uploadEmployeeDocument(context, {
        employeeId: String(request.params.employeeId),
        filename: input.data.filename,
        contentType: input.data.contentType,
        category: input.data.category,
        content: request.body,
      });
      response.status(201).json({ success: true, data: document });
    } catch (error) {
      handleError(error, response, next);
    }
  },
);

documentRouter.get("/:documentId/download", async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const document = await downloadEmployeeDocument(
      context,
      String(request.params.documentId),
    );
    response
      .set("Content-Type", document.contentType)
      .set(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
      )
      .set("Cache-Control", "private, no-store")
      .set("X-Content-Type-Options", "nosniff")
      .status(200)
      .send(document.content);
  } catch (error) {
    handleError(error, response, next);
  }
});

documentRouter.delete("/:documentId", async (request, response, next) => {
  const context = response.locals.authContext;
  if (!context) {
    response.status(401).json({
      success: false,
      error: { message: "Authentication is required." },
    });
    return;
  }

  try {
    const result = await deleteEmployeeDocument(
      context,
      String(request.params.documentId),
    );
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(error, response, next);
  }
});

export { documentRouter };
