const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

export type DepartmentStatus = "active" | "inactive";

export type Department = {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: DepartmentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentInput = {
  name: string;
  description?: string;
  status?: DepartmentStatus;
};

export type DepartmentListResult = {
  departments: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ApiErrorResponse = {
  error?: { message?: unknown };
  message?: unknown;
};

export class DepartmentApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "DepartmentApiError";
  }
}

async function request<T>(
  path: string,
  token: string,
  options: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  },
): Promise<T> {
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
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

  if (!response.ok) {
    const errorResponse = payload as ApiErrorResponse | undefined;
    const message =
      typeof errorResponse?.error?.message === "string"
        ? errorResponse.error.message
        : typeof errorResponse?.message === "string"
          ? errorResponse.message
          : "The department request could not be completed.";

    throw new DepartmentApiError(message, response.status);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The server returned an invalid department response.");
  }

  return payload.data as T;
}

export function listDepartments(
  token: string,
  options: {
    search?: string;
    status?: DepartmentStatus;
    page?: number;
    limit?: number;
  } = {},
): Promise<DepartmentListResult> {
  const params = new URLSearchParams();

  if (options.search) params.set("search", options.search);
  if (options.status) params.set("status", options.status);
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.limit !== undefined) params.set("limit", String(options.limit));

  const query = params.toString();

  return request<DepartmentListResult>(
    `/departments${query ? `?${query}` : ""}`,
    token,
    { method: "GET" },
  );
}

export function getDepartment(
  token: string,
  departmentId: string,
): Promise<Department> {
  return request<Department>(
    `/departments/${encodeURIComponent(departmentId)}`,
    token,
    { method: "GET" },
  );
}

export function createDepartment(
  token: string,
  input: DepartmentInput,
): Promise<Department> {
  return request<Department>("/departments", token, {
    method: "POST",
    body: input,
  });
}

export function updateDepartment(
  token: string,
  departmentId: string,
  input: Partial<DepartmentInput>,
): Promise<Department> {
  return request<Department>(
    `/departments/${encodeURIComponent(departmentId)}`,
    token,
    { method: "PATCH", body: input },
  );
}

export function deleteDepartment(
  token: string,
  departmentId: string,
): Promise<{ id: string }> {
  return request<{ id: string }>(
    `/departments/${encodeURIComponent(departmentId)}`,
    token,
    { method: "DELETE" },
  );
}
