const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

export type EmployeeStatus = "active" | "inactive" | "on_leave";

export type Employee = {
  _id: string;
  organizationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  userId?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  dateOfJoining?: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeInput = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  userId?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  dateOfJoining?: string;
  status?: EmployeeStatus;
};

export type EmployeeListResult = {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ApiErrorResponse = {
  error?: {
    message?: unknown;
  };
};

export class EmployeeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "EmployeeApiError";
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
        : "The employee request could not be completed.";
    throw new EmployeeApiError(message, response.status);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The server returned an invalid employee response.");
  }

  return payload.data as T;
}

export function listEmployees(
  token: string,
  options: {
    search?: string;
    status?: EmployeeStatus;
    page?: number;
    limit?: number;
  } = {},
): Promise<EmployeeListResult> {
  const params = new URLSearchParams();

  if (options.search) params.set("search", options.search);
  if (options.status) params.set("status", options.status);
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.limit !== undefined) params.set("limit", String(options.limit));

  const query = params.toString();

  return request<EmployeeListResult>(
    `/employees${query ? `?${query}` : ""}`,
    token,
    { method: "GET" },
  );
}

export function getOwnEmployee(token: string): Promise<Employee> {
  return request<Employee>("/employees/me", token, { method: "GET" });
}

export function getEmployee(
  token: string,
  employeeId: string,
): Promise<Employee> {
  return request<Employee>(
    `/employees/${encodeURIComponent(employeeId)}`,
    token,
    { method: "GET" },
  );
}

export function createEmployee(
  token: string,
  input: EmployeeInput,
): Promise<Employee> {
  return request<Employee>("/employees", token, {
    method: "POST",
    body: input,
  });
}

export function updateEmployee(
  token: string,
  employeeId: string,
  input: Partial<EmployeeInput>,
): Promise<Employee> {
  return request<Employee>(
    `/employees/${encodeURIComponent(employeeId)}`,
    token,
    { method: "PATCH", body: input },
  );
}

export function deleteEmployee(
  token: string,
  employeeId: string,
): Promise<{ id: string }> {
  return request<{ id: string }>(
    `/employees/${encodeURIComponent(employeeId)}`,
    token,
    { method: "DELETE" },
  );
}


export function inviteEmployee(token: string, employeeId: string): Promise<{ message: string }> {
  return request<{ message: string }>(
    (`/employees/${encodeURIComponent(employeeId)}/invite`),
    token,
    { method: "POST" },
  );
}
