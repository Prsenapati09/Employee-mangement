import "dotenv/config";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { after, before, describe, test } from "node:test";
import type { Server } from "node:http";

const provisioningSecret = randomBytes(32).toString("base64url");
const testDatabaseName = `hrmpro_auth_test_${process.pid}_${randomBytes(6).toString("hex")}`;
const configuredMongoUri = process.env.MONGODB_URI;

if (!configuredMongoUri) {
  throw new Error("MONGODB_URI must be configured to run auth integration tests.");
}

process.env.NODE_ENV = "test";
const testUri = new URL(configuredMongoUri);
testUri.pathname = `/${testDatabaseName}`;
process.env.MONGODB_URI = testUri.toString();
process.env.OWNER_PROVISIONING_SECRET = provisioningSecret;

let server: Server | undefined;
let baseUrl: string;
let disconnectDatabase: (() => Promise<void>) | undefined;
let testDatabase: { dropDatabase: () => Promise<unknown> } | undefined;

interface ApiResponse {
  status: number;
  body: {
    success: boolean;
    data?: Record<string, unknown>;
    error?: { message: string };
  };
}

async function request(
  path: string,
  options: {
    body?: Record<string, unknown>;
    token?: string;
    provisioningKey?: string;
    method?: "GET" | "POST";
  } = {},
): Promise<ApiResponse> {
  const headers: Record<string, string> = {};
  if (options.body) {
    headers["content-type"] = "application/json";
  }
  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }
  if (options.provisioningKey) {
    headers["x-owner-provisioning-key"] = options.provisioningKey;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return {
    status: response.status,
    body: (await response.json()) as ApiResponse["body"],
  };
}

async function registerOwner(
  slug = `org-${randomBytes(5).toString("hex")}`,
  email = `${randomBytes(5).toString("hex")}@example.test`,
): Promise<ApiResponse> {
  return request("/api/v1/auth/register-owner", {
    provisioningKey: provisioningSecret,
    body: {
      organizationName: "Test Organization",
      organizationSlug: slug,
      email,
      password: "A-strong-test-password-2026",
    },
  });
}

describe("authentication API", () => {
  before(async () => {
    const [{ app }, database, mongooseModule] = await Promise.all([
      import("../src/app"),
      import("../src/config/database"),
      import("mongoose"),
    ]);

    disconnectDatabase = database.disconnectDatabase;
    await database.connectDatabase();
    const [{ Organization }, { User }, { AuthSession }] = await Promise.all([
      import("../src/modules/organization/organization.model"),
      import("../src/modules/users/user.model"),
      import("../src/modules/auth/auth-session.model"),
    ]);
    await Promise.all([
      Organization.init(),
      User.init(),
      AuthSession.init(),
    ]);
    testDatabase = mongooseModule.default.connection.db;

    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve, reject) => {
      server?.once("listening", resolve);
      server?.once("error", reject);
    });
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => (error ? reject(error) : resolve()));
      });
    }
    if (testDatabase) {
      await testDatabase.dropDatabase();
    }
    await disconnectDatabase?.();
  });

  test("keeps liveness and reports database readiness", async () => {
    const health = await request("/api/v1/health");
    const readiness = await request("/api/v1/health/ready");

    assert.equal(health.status, 200);
    assert.deepEqual(health.body.data, { status: "ok" });
    assert.equal(readiness.status, 200);
    assert.deepEqual(readiness.body.data, {
      status: "ready",
      database: "connected",
    });
  });

  test("provisions an organization owner without accepting a caller role", async () => {
    const result = await registerOwner();
    assert.equal(result.status, 201);
    assert.equal(result.body.success, true);
    assert.equal((result.body.data?.user as { role: string }).role, "owner");
    assert.equal("passwordHash" in (result.body.data?.user as object), false);
    assert.equal(typeof result.body.data?.accessToken, "string");
  });

  test("logs in and returns an organization-scoped current profile", async () => {
    const slug = `login-${randomBytes(5).toString("hex")}`;
    const email = `${randomBytes(5).toString("hex")}@example.test`;
    assert.equal((await registerOwner(slug, email)).status, 201);

    const login = await request("/api/v1/auth/login", {
      body: {
        organizationSlug: slug,
        email,
        password: "A-strong-test-password-2026",
      },
    });
    assert.equal(login.status, 200);
    assert.equal(typeof login.body.data?.accessToken, "string");
    assert.equal(typeof login.body.data?.expiresAt, "string");
    const token = login.body.data?.accessToken as string;
    const { AuthSession } = await import(
      "../src/modules/auth/auth-session.model"
    );
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const storedSession = await AuthSession.findOne({ tokenHash }).select(
      "+tokenHash",
    );
    assert.ok(storedSession);
    assert.notEqual(storedSession.tokenHash, token);
    assert.ok(storedSession.expiresAt.getTime() > Date.now());

    const profile = await request("/api/v1/auth/me", {
      token,
    });
    assert.equal(profile.status, 200);
    assert.equal(
      (profile.body.data?.organization as { slug: string }).slug,
      slug,
    );
    assert.equal(
      (profile.body.data?.user as { email: string }).email,
      email,
    );
  });

  test("rejects invalid credentials without distinguishing account lookup", async () => {
    const slug = `wrong-${randomBytes(5).toString("hex")}`;
    const email = `${randomBytes(5).toString("hex")}@example.test`;
    assert.equal((await registerOwner(slug, email)).status, 201);

    const result = await request("/api/v1/auth/login", {
      body: {
        organizationSlug: slug,
        email,
        password: "wrong-password",
      },
    });
    assert.equal(result.status, 401);
    assert.equal(
      result.body.error?.message,
      "Invalid organization, email, or password.",
    );
  });

  test("validates inputs and requires the owner provisioning key", async () => {
    const missingKey = await request("/api/v1/auth/register-owner", {
      body: {
        organizationName: "Test Organization",
        organizationSlug: `no-key-${randomBytes(5).toString("hex")}`,
        email: "owner@example.test",
        password: "A-strong-test-password-2026",
      },
    });
    assert.equal(missingKey.status, 403);

    const extraRole = await request("/api/v1/auth/register-owner", {
      provisioningKey: provisioningSecret,
      body: {
        organizationName: "Test Organization",
        organizationSlug: `role-${randomBytes(5).toString("hex")}`,
        email: "owner@example.test",
        password: "A-strong-test-password-2026",
        role: "owner",
      },
    });
    assert.equal(extraRole.status, 400);

    const invalidLogin = await request("/api/v1/auth/login", {
      body: { organizationSlug: "not valid", email: "bad", password: "" },
    });
    assert.equal(invalidLogin.status, 400);
  });

  test("rejects unauthenticated requests to the profile endpoint", async () => {
    const result = await request("/api/v1/auth/me");
    assert.equal(result.status, 401);
  });

  test("enforces organization scope during credential validation", async () => {
    const slugA = `tenant-a-${randomBytes(5).toString("hex")}`;
    const slugB = `tenant-b-${randomBytes(5).toString("hex")}`;
    const emailB = `${randomBytes(5).toString("hex")}@example.test`;
    assert.equal((await registerOwner(slugA)).status, 201);
    assert.equal((await registerOwner(slugB, emailB)).status, 201);

    const crossTenantLogin = await request("/api/v1/auth/login", {
      body: {
        organizationSlug: slugA,
        email: emailB,
        password: "A-strong-test-password-2026",
      },
    });
    assert.equal(crossTenantLogin.status, 401);
  });

  test("logout revokes the access token", async () => {
    const slug = `logout-${randomBytes(5).toString("hex")}`;
    const email = `${randomBytes(5).toString("hex")}@example.test`;
    assert.equal((await registerOwner(slug, email)).status, 201);
    const login = await request("/api/v1/auth/login", {
      body: {
        organizationSlug: slug,
        email,
        password: "A-strong-test-password-2026",
      },
    });
    const token = login.body.data?.accessToken as string;
    assert.equal(login.status, 200);
    assert.equal(
      (
        await request("/api/v1/auth/logout", {
          token,
          method: "POST",
        })
      ).status,
      200,
    );
    assert.equal((await request("/api/v1/auth/me", { token })).status, 401);
  });

  test("rejects expired access tokens", async () => {
    const registration = await registerOwner();
    assert.equal(registration.status, 201);
    const token = registration.body.data?.accessToken as string;
    const { AuthSession } = await import(
      "../src/modules/auth/auth-session.model"
    );
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await AuthSession.updateOne(
      { tokenHash },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );

    assert.equal((await request("/api/v1/auth/me", { token })).status, 401);
  });

  test("rejects tokens belonging to suspended users", async () => {
    const registration = await registerOwner();
    assert.equal(registration.status, 201);
    const token = registration.body.data?.accessToken as string;
    const organization = registration.body.data?.organization as {
      id: string;
    };
    const user = registration.body.data?.user as { id: string };
    const { User } = await import("../src/modules/users/user.model");
    await User.updateOne(
      { _id: user.id, organizationId: organization.id },
      { $set: { status: "suspended" } },
    );

    assert.equal((await request("/api/v1/auth/me", { token })).status, 401);
  });
});
