const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

export type AttendanceStatus = "present" | "late" | "half_day" | "absent";

export type AttendanceEmployee = {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  department?: string;
  jobTitle?: string;
};

export type Attendance = {
  _id: string;
  organizationId: string;
  employeeId: AttendanceEmployee | string;
  attendanceDate: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceInput = {
  employeeId: string;
  attendanceDate: string;
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
  notes?: string;
};

export type AttendanceListResult = {
  items: Attendance[];
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

export class AttendanceApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AttendanceApiError";
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
    const errorResponse = payload as ApiErrorResponse | undefined;
    const message =
      typeof errorResponse?.error?.message === "string"
        ? errorResponse.error.message
        : "The attendance request could not be completed.";

    throw new AttendanceApiError(message, response.status);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The server returned an invalid attendance response.");
  }

  return payload.data as T;
}

export function listAttendance(
  token: string,
  options: {
    search?: string;
    date?: string;
    from?: string;
    to?: string;
    status?: AttendanceStatus;
    employeeId?: string;
    page?: number;
    limit?: number;
    self?: boolean;
  } = {},
): Promise<AttendanceListResult> {
  const params = new URLSearchParams();

  for (const key of [
    "search",
    "date",
    "from",
    "to",
    "status",
    "employeeId",
    "page",
    "limit",
  ] as const) {
    const value = options[key];
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const query = params.toString();

  const endpoint = options.self ? "/attendance/me" : "/attendance";
  return request<AttendanceListResult>(
    `${endpoint}${query ? `?${query}` : ""}`,
    token,
    { method: "GET" },
  );
}

export function createAttendance(
  token: string,
  input: AttendanceInput,
): Promise<Attendance> {
  return request<Attendance>("/attendance", token, {
    method: "POST",
    body: input,
  });
}

export function updateAttendance(
  token: string,
  attendanceId: string,
  input: Partial<Omit<AttendanceInput, "employeeId" | "attendanceDate">>,
): Promise<Attendance> {
  return request<Attendance>(`/attendance/${encodeURIComponent(attendanceId)}`, token, {
    method: "PATCH",
    body: input,
  });
}

export function deleteAttendance(
  token: string,
  attendanceId: string,
): Promise<{ message: string }> {
  return request<{ message: string }>(
    `/attendance/${encodeURIComponent(attendanceId)}`,
    token,
    { method: "DELETE" },
  );
}
