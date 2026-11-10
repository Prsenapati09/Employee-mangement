const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

type ApiErrorResponse = {
  error?: {
    message?: unknown;
  };
};

export type LoginCredentials = {
  organizationSlug: string;
  email: string;
  password: string;
};

export type AuthProfile = {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function request(
  path: string,
  options: {
    method: "GET" | "POST";
    token?: string;
    body?: object;
  },
): Promise<unknown> {
  const headers = new Headers();
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
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
        : "The request could not be completed. Please try again.";
    throw new AuthApiError(message, response.status);
  }

  return payload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function login(
  credentials: LoginCredentials,
): Promise<{ accessToken: string; expiresAt: string }> {
  const payload = await request("/auth/login", {
    method: "POST",
    body: credentials,
  });
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null;

  if (
    !data ||
    typeof data.accessToken !== "string" ||
    typeof data.expiresAt !== "string" ||
    Number.isNaN(Date.parse(data.expiresAt))
  ) {
    throw new Error("The server returned an invalid login response.");
  }

  return { accessToken: data.accessToken, expiresAt: data.expiresAt };
}

export async function getCurrentProfile(
  accessToken: string,
): Promise<AuthProfile> {
  const payload = await request("/auth/me", {
    method: "GET",
    token: accessToken,
  });
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null;
  const user = data && isRecord(data.user) ? data.user : null;
  const organization =
    data && isRecord(data.organization) ? data.organization : null;

  if (
    !user ||
    !organization ||
    typeof user.id !== "string" ||
    typeof user.email !== "string" ||
    typeof user.role !== "string" ||
    typeof user.status !== "string" ||
    typeof organization.id !== "string" ||
    typeof organization.name !== "string" ||
    typeof organization.slug !== "string"
  ) {
    throw new Error("The server returned an invalid profile response.");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
  };
}

export async function logout(accessToken: string): Promise<void> {
  await request("/auth/logout", {
    method: "POST",
    token: accessToken,
  });
}

export async function forgotPassword(input: {
  organizationSlug: string;
  email: string;
}): Promise<void> {
  await request("/auth/forgot-password", {
    method: "POST",
    body: input,
  });
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<void> {
  await request("/auth/reset-password", {
    method: "POST",
    body: input,
  });
}


export async function acceptInvitation(input: {
  token: string;
  password: string;
}): Promise<void> {
  await request("/auth/accept-invitation", {
    method: "POST",
    body: input,
  });
}
