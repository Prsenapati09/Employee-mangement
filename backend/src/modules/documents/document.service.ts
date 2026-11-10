import { Types } from "mongoose";
import type { AuthenticatedContext } from "../auth/auth.service";
import { Employee } from "../employees/employee.model";
import {
  EmployeeServiceError,
  getEmployeeForUser,
  getManagerDepartment,
} from "../employees/employee.service";
import {
  EmployeeDocumentRecordModel,
  type DocumentCategory,
} from "./document.model";
import {
  readPrivateDocument,
  removePrivateDocument,
  storePrivateDocument,
} from "./local-document-storage";

const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
]);

type DocumentResponseSource = {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  originalFilename: string;
  contentType: string;
  category: DocumentCategory;
  size: number;
  createdAt: Date;
};

export class DocumentServiceError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "DocumentServiceError";
  }
}

function assertFileSignature(content: Buffer, contentType: string): void {
  const valid =
    (contentType === "application/pdf" &&
      content.subarray(0, 5).toString("ascii") === "%PDF-") ||
    (contentType === "image/png" &&
      content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (contentType === "image/jpeg" &&
      content.length >= 3 &&
      content[0] === 0xff &&
      content[1] === 0xd8 &&
      content[2] === 0xff) ||
    (contentType === "text/plain" &&
      !content.includes(0) &&
      Buffer.from(content.toString("utf8"), "utf8").equals(content));

  if (!valid) {
    throw new DocumentServiceError(
      "The file content does not match its allowed file type.",
      400,
    );
  }
}

async function findAccessibleEmployee(
  context: AuthenticatedContext,
  employeeId: string,
) {
  if (!Types.ObjectId.isValid(employeeId)) {
    throw new DocumentServiceError("Employee not found.", 404);
  }

  if (context.role === "employee") {
    let ownEmployee;
    try {
      ownEmployee = await getEmployeeForUser(context.organizationId, context.userId);
    } catch (error) {
      if (error instanceof EmployeeServiceError) {
        throw new DocumentServiceError("Employee not found.", 404);
      }
      throw error;
    }
    if (ownEmployee._id.toString() !== employeeId) {
      throw new DocumentServiceError("Employee not found.", 404);
    }
    return ownEmployee;
  }

  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(employeeId),
    organizationId: new Types.ObjectId(context.organizationId),
  };
  if (context.role === "manager") {
    try {
      filter.department = await getManagerDepartment(
        context.organizationId,
        context.userId,
      );
    } catch (error) {
      if (error instanceof EmployeeServiceError) {
        throw new DocumentServiceError(error.message, error.statusCode);
      }
      throw error;
    }
  } else if (!["owner", "admin", "hr"].includes(context.role)) {
    throw new DocumentServiceError("You do not have permission to access documents.", 403);
  }

  const employee = await Employee.findOne(filter).lean();
  if (!employee) {
    throw new DocumentServiceError("Employee not found.", 404);
  }
  return employee;
}

function publicDocument(document: DocumentResponseSource) {
  return {
    id: document._id.toString(),
    employeeId: document.employeeId.toString(),
    filename: document.originalFilename,
    contentType: document.contentType,
    category: document.category,
    size: document.size,
    createdAt: document.createdAt,
  };
}

export async function listEmployeeDocuments(
  context: AuthenticatedContext,
  employeeId: string,
) {
  await findAccessibleEmployee(context, employeeId);
  const documents = await EmployeeDocumentRecordModel.find({
    organizationId: new Types.ObjectId(context.organizationId),
    employeeId: new Types.ObjectId(employeeId),
  })
    .sort({ createdAt: -1 })
    .lean<DocumentResponseSource[]>();
  return documents.map(publicDocument);
}

export async function uploadEmployeeDocument(
  context: AuthenticatedContext,
  input: {
    employeeId: string;
    filename: string;
    contentType: string;
    category: DocumentCategory;
    content: Buffer;
  },
) {
  if (context.role === "manager") {
    throw new DocumentServiceError("Managers cannot upload employee documents.", 403);
  }
  await findAccessibleEmployee(context, input.employeeId);
  if (!allowedTypes.has(input.contentType)) {
    throw new DocumentServiceError("Unsupported document file type.", 400);
  }
  if (input.content.length === 0 || input.content.length > MAX_DOCUMENT_SIZE) {
    throw new DocumentServiceError("Document must be between 1 byte and 5 MB.", 400);
  }
  assertFileSignature(input.content, input.contentType);

  const storageKey = await storePrivateDocument(input.content, input.contentType);
  try {
    const document = await EmployeeDocumentRecordModel.create({
      organizationId: new Types.ObjectId(context.organizationId),
      employeeId: new Types.ObjectId(input.employeeId),
      uploadedBy: new Types.ObjectId(context.userId),
      originalFilename: input.filename,
      contentType: input.contentType,
      category: input.category,
      size: input.content.length,
      storageKey,
    });
    return publicDocument(document);
  } catch (error) {
    try {
      await removePrivateDocument(storageKey);
    } catch {
      console.error("Unable to clean up an incomplete private document upload.");
    }
    throw error;
  }
}

async function getAccessibleDocument(
  context: AuthenticatedContext,
  documentId: string,
) {
  if (!Types.ObjectId.isValid(documentId)) {
    throw new DocumentServiceError("Document not found.", 404);
  }
  const document = await EmployeeDocumentRecordModel.findOne({
    _id: new Types.ObjectId(documentId),
    organizationId: new Types.ObjectId(context.organizationId),
  }).select("+storageKey");
  if (!document) {
    throw new DocumentServiceError("Document not found.", 404);
  }
  await findAccessibleEmployee(context, document.employeeId.toString());
  return document;
}

export async function downloadEmployeeDocument(
  context: AuthenticatedContext,
  documentId: string,
) {
  const document = await getAccessibleDocument(context, documentId);
  const content = await readPrivateDocument(document.storageKey);
  return {
    filename: document.originalFilename,
    contentType: document.contentType,
    content,
  };
}

export async function deleteEmployeeDocument(
  context: AuthenticatedContext,
  documentId: string,
) {
  if (!["owner", "admin", "hr"].includes(context.role)) {
    throw new DocumentServiceError(
      "Only organization administrators and HR can delete documents.",
      403,
    );
  }
  const document = await getAccessibleDocument(context, documentId);
  await removePrivateDocument(document.storageKey);
  await EmployeeDocumentRecordModel.deleteOne({
    _id: document._id,
    organizationId: new Types.ObjectId(context.organizationId),
  });
  return { id: document._id.toString() };
}
