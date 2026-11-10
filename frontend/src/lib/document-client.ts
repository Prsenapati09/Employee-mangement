const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

export type EmployeeDocumentCategory =
  | "identity"
  | "contract"
  | "resume"
  | "certificate"
  | "other";

export type EmployeeDocument = {
  id: string;
  employeeId: string;
  filename: string;
  contentType: string;
  category: EmployeeDocumentCategory;
  size: number;
  createdAt: string;
};

function getErrorMessage(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "The document request could not be completed.";
  }
  const error = "error" in payload ? payload.error : undefined;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") return message;
  }
  return "The document request could not be completed.";
}

async function requestJson<T>(
  path: string,
  token: string,
  options: { method: "GET" | "POST" | "DELETE"; body?: BodyInit; headers?: HeadersInit } = {
    method: "GET",
  },
): Promise<T> {
  let response: Response;
  const headers = new Headers(options.headers);
  headers.set("Authorization", "Bearer " + token);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers,
      body: options.body,
    });
  } catch {
    throw new Error("Unable to reach the HRMPro server. Please try again.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }
  if (!response.ok) throw new Error(getErrorMessage(payload));
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The server returned an invalid document response.");
  }
  return payload.data as T;
}

export function listEmployeeDocuments(
  token: string,
  employeeId: string,
): Promise<EmployeeDocument[]> {
  return requestJson(
    `/documents/employees/${encodeURIComponent(employeeId)}`,
    token,
  );
}

export async function uploadEmployeeDocument(
  token: string,
  employeeId: string,
  file: File,
  category: EmployeeDocumentCategory,
): Promise<EmployeeDocument> {
  const documents = await requestJson<EmployeeDocument>(
    `/documents/employees/${encodeURIComponent(employeeId)}`,
    token,
    {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Document-Filename": encodeURIComponent(file.name),
        "X-Document-Category": category,
        "X-Document-Content-Type": file.type || "application/octet-stream",
      },
    },
  );
  return documents;
}

export async function downloadEmployeeDocument(
  token: string,
  documentId: string,
): Promise<{ blob: Blob; filename: string }> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/download`,
      { headers: { Authorization: "Bearer " + token } },
    );
  } catch {
    throw new Error("Unable to reach the HRMPro server. Please try again.");
  }

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
    throw new Error(getErrorMessage(payload));
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  return {
    blob: await response.blob(),
    filename: encodedName ? decodeURIComponent(encodedName) : "document",
  };
}

export function deleteEmployeeDocument(
  token: string,
  documentId: string,
): Promise<{ id: string }> {
  return requestJson(`/documents/${encodeURIComponent(documentId)}`, token, {
    method: "DELETE",
  });
}
