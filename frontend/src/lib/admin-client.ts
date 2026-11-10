const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

export type OrganizationSettings = {
  _id: string;
  name: string;
  slug: string;
  status: string;
};

export type ManagedUser = {
  _id: string;
  email: string;
  role: "owner" | "admin" | "hr" | "manager" | "employee";
  status: "active" | "suspended";
  createdAt: string;
};

async function request<T>(
  path: string,
  token: string,
  method: "GET" | "PATCH",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: "Bearer " + token,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
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
    const error =
      typeof payload === "object" && payload !== null && "error" in payload
        ? payload.error
        : undefined;
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : "The request could not be completed.";
    throw new Error(message);
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The server returned an invalid settings response.");
  }
  return payload.data as T;
}

export function getOrganizationSettings(token: string) {
  return request<OrganizationSettings>("/organization", token, "GET");
}

export function updateOrganizationName(token: string, name: string) {
  return request<OrganizationSettings>("/organization", token, "PATCH", { name });
}

export function listManagedUsers(token: string) {
  return request<ManagedUser[]>("/users", token, "GET");
}

export function updateManagedUserStatus(
  token: string,
  userId: string,
  status: ManagedUser["status"],
) {
  return request<ManagedUser>(
    `/users/${encodeURIComponent(userId)}/status`,
    token,
    "PATCH",
    { status },
  );
}
