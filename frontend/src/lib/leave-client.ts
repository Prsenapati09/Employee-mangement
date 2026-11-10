const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

export type LeaveType =
  | "casual"
  | "sick"
  | "earned"
  | "unpaid"
  | "maternity"
  | "paternity";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveEmployee = {
  _id: string;
  firstName: string;
  lastName: string;
  employeeCode?: string;
  email?: string;
};

export type Leave = {
  _id: string;
  organizationId: string;
  employeeId: LeaveEmployee | string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: { _id: string; name?: string; email?: string } | string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
};

export type LeaveInput = {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
};

export type LeaveListResult = {
  items: Leave[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export class LeaveApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "LeaveApiError";
  }
}

async function request<T>(
  path: string,
  token: string,
  options: { method: "GET" | "POST" | "PATCH"; body?: unknown },
): Promise<T> {
  const headers = new Headers({ Authorization: `Bearer ${token}` });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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
    const data = payload as {
      message?: unknown;
      error?: { message?: unknown };
    } | undefined;
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error?.message === "string"
          ? data.error.message
          : "The leave request could not be completed.";
    throw new LeaveApiError(message, response.status);
  }

  if (typeof payload !== "object" || payload === null) {
    throw new Error("The server returned an invalid leave response.");
  }

  // Support both direct JSON responses and the standard { success, data } envelope.
  if ("success" in payload && payload.success === true && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export function listLeaves(
  token: string,
  options: {
    search?: string;
    status?: LeaveStatus;
    leaveType?: LeaveType;
    employeeId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    self?: boolean;
  } = {},
): Promise<LeaveListResult> {
  const params = new URLSearchParams();

  for (const key of ["search", "status", "leaveType", "employeeId", "from", "to", "page", "limit"] as const) {
    const value = options[key];
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  const query = params.toString();
  const endpoint = options.self ? "/leaves/me" : "/leaves";
  return request<LeaveListResult>(`${endpoint}${query ? `?${query}` : ""}`, token, {
    method: "GET",
  });
}

export async function createLeave(
  token: string,
  input: LeaveInput,
  self = false,
): Promise<Leave> {
  const { employeeId, ...ownInput } = input;
  const result = await request<{ leave: Leave } | Leave>(
    self ? "/leaves/me" : "/leaves",
    token,
    {
    method: "POST",
    body: self ? ownInput : { ...ownInput, employeeId },
    },
  );
  return "leave" in result ? result.leave : result;
}

export async function getLeave(token: string, leaveId: string): Promise<Leave> {
  const result = await request<{ leave: Leave } | Leave>(
    `/leaves/${encodeURIComponent(leaveId)}`,
    token,
    { method: "GET" },
  );
  return "leave" in result ? result.leave : result;
}

export async function reviewLeave(
  token: string,
  leaveId: string,
  input: { status: "approved" | "rejected"; reviewComment?: string },
): Promise<Leave> {
  const result = await request<{ leave: Leave } | Leave>(
    `/leaves/${encodeURIComponent(leaveId)}/review`,
    token,
    { method: "PATCH", body: input },
  );
  return "leave" in result ? result.leave : result;
}

export async function cancelLeave(
  token: string,
  leaveId: string,
  self = false,
): Promise<Leave> {
  const result = await request<{ leave: Leave } | Leave>(
    self
      ? `/leaves/me/${encodeURIComponent(leaveId)}/cancel`
      : `/leaves/${encodeURIComponent(leaveId)}/cancel`,
    token,
    { method: "PATCH" },
  );
  return "leave" in result ? result.leave : result;
}
