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
    method?: "GET" | "POST" | "PATCH" | "DELETE";
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

async function createInvitableEmployee(
  email = `${randomBytes(5).toString("hex")}@example.test`,
) {
  const registration = await registerOwner();
  const organization = registration.body.data?.organization as { id: string };
  const owner = registration.body.data?.user as { id: string };
  const { Employee } = await import("../src/modules/employees/employee.model");
  const employee = await Employee.create({
    organizationId: organization.id,
    employeeCode: `E-${randomBytes(5).toString("hex")}`,
    firstName: "Invite",
    lastName: "Candidate",
    email,
    status: "active",
    createdBy: owner.id,
  });

  return { registration, organization, owner, employee };
}

async function createSessionToken(
  userId: string,
  organizationId: string,
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const { AuthSession } = await import(
    "../src/modules/auth/auth-session.model"
  );
  await AuthSession.create({
    userId,
    organizationId,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
  return token;
}

async function uploadDocument(
  path: string,
  token: string,
  content: Buffer,
  options: {
    filename: string;
    contentType: string;
    category: string;
  },
) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "content-type": "application/octet-stream",
      "x-document-filename": encodeURIComponent(options.filename),
      "x-document-category": options.category,
      "x-document-content-type": options.contentType,
    },
    body: content,
  });
  return {
    status: response.status,
    body: (await response.json()) as ApiResponse["body"],
  };
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
    const [
      { Organization },
      { User },
      { AuthSession },
      { PasswordReset },
      { Employee },
      { EmployeeInvitation },
    ] = await Promise.all([
      import("../src/modules/organization/organization.model"),
      import("../src/modules/users/user.model"),
      import("../src/modules/auth/auth-session.model"),
      import("../src/modules/auth/password-reset.model"),
      import("../src/modules/employees/employee.model"),
      import("../src/modules/employees/employee-invitation.model"),
    ]);
    await Promise.all([
      Organization.init(),
      User.init(),
      AuthSession.init(),
      PasswordReset.init(),
      Employee.init(),
      EmployeeInvitation.init(),
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

  test("supports employee CRUD and reports duplicate employee fields as conflicts", async () => {
    const registration = await registerOwner();
    const token = registration.body.data?.accessToken as string;
    const employeeCode = `API-${randomBytes(5).toString("hex")}`;
    const firstEmail = `${randomBytes(5).toString("hex")}@example.test`;
    const secondEmail = `${randomBytes(5).toString("hex")}@example.test`;

    const created = await request("/api/v1/employees", {
      token,
      body: {
        employeeCode,
        firstName: "API",
        lastName: "Employee",
        email: firstEmail,
      },
    });
    assert.equal(created.status, 201);
    const createdEmployee = created.body.data as { _id: string };

    const updated = await request(`/api/v1/employees/${createdEmployee._id}`, {
      token,
      method: "PATCH",
      body: { jobTitle: "People Specialist" },
    });
    assert.equal(updated.status, 200);
    assert.equal(
      (updated.body.data as { jobTitle: string }).jobTitle,
      "People Specialist",
    );

    const duplicateCode = await request("/api/v1/employees", {
      token,
      body: {
        employeeCode,
        firstName: "Duplicate",
        lastName: "Employee",
        email: secondEmail,
      },
    });
    assert.equal(duplicateCode.status, 409);

    const otherEmployee = await request("/api/v1/employees", {
      token,
      body: {
        employeeCode: `API-${randomBytes(5).toString("hex")}`,
        firstName: "Other",
        lastName: "Employee",
        email: secondEmail,
      },
    });
    assert.equal(otherEmployee.status, 201);
    const otherEmployeeId = (otherEmployee.body.data as { _id: string })._id;

    const duplicateEmail = await request(
      `/api/v1/employees/${createdEmployee._id}`,
      { token, method: "PATCH", body: { email: secondEmail } },
    );
    assert.equal(duplicateEmail.status, 409);

    assert.equal(
      (
        await request(`/api/v1/employees/${otherEmployeeId}`, {
          token,
          method: "DELETE",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request(`/api/v1/employees/${createdEmployee._id}`, {
          token,
          method: "DELETE",
        })
      ).status,
      200,
    );
  });

  test("supports department and attendance management with duplicate protection", async () => {
    const registration = await registerOwner();
    const token = registration.body.data?.accessToken as string;
    const employee = await request("/api/v1/employees", {
      token,
      body: {
        employeeCode: `OPS-${randomBytes(5).toString("hex")}`,
        firstName: "Operations",
        lastName: "Employee",
        email: `${randomBytes(5).toString("hex")}@example.test`,
      },
    });
    assert.equal(employee.status, 201);
    const employeeId = (employee.body.data as { _id: string })._id;

    const departmentName = `People-${randomBytes(5).toString("hex")}`;
    const department = await request("/api/v1/departments", {
      token,
      body: { name: departmentName, description: "People operations" },
    });
    assert.equal(department.status, 201);
    const departmentId = (department.body.data as { _id: string })._id;

    const duplicateDepartment = await request("/api/v1/departments", {
      token,
      body: { name: departmentName },
    });
    assert.equal(duplicateDepartment.status, 409);

    const updatedDepartment = await request(
      `/api/v1/departments/${departmentId}`,
      { token, method: "PATCH", body: { description: "Updated description" } },
    );
    assert.equal(updatedDepartment.status, 200);
    assert.equal(
      (updatedDepartment.body.data as { description: string }).description,
      "Updated description",
    );

    const attendanceDate = "2026-10-01";
    const attendance = await request("/api/v1/attendance", {
      token,
      body: { employeeId, attendanceDate, status: "present" },
    });
    assert.equal(attendance.status, 201);
    const attendanceId = (attendance.body.data as { _id: string })._id;

    const duplicateAttendance = await request("/api/v1/attendance", {
      token,
      body: { employeeId, attendanceDate, status: "present" },
    });
    assert.equal(duplicateAttendance.status, 409);

    const updatedAttendance = await request(
      `/api/v1/attendance/${attendanceId}`,
      { token, method: "PATCH", body: { status: "late", notes: "Traffic" } },
    );
    assert.equal(updatedAttendance.status, 200);
    assert.equal(
      (updatedAttendance.body.data as { status: string }).status,
      "late",
    );

    assert.equal(
      (
        await request(`/api/v1/attendance/${attendanceId}`, {
          token,
          method: "DELETE",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request(`/api/v1/departments/${departmentId}`, {
          token,
          method: "DELETE",
        })
      ).status,
      200,
    );
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

  test("returns a generic response for unknown password reset accounts", async () => {
    const result = await request("/api/v1/auth/forgot-password", {
      body: {
        organizationSlug: `missing-${randomBytes(5).toString("hex")}`,
        email: "unknown@example.test",
      },
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
  });

  test("resets password with a valid token and revokes existing sessions", async () => {
    const slug = `reset-${randomBytes(5).toString("hex")}`;
    const email = `${randomBytes(5).toString("hex")}@example.test`;
    const registration = await registerOwner(slug, email);

    assert.equal(registration.status, 201);

    const organization = registration.body.data?.organization as { id: string };
    const user = registration.body.data?.user as { id: string };
    const oldToken = registration.body.data?.accessToken as string;
    const resetToken = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(resetToken).digest("hex");

    const { PasswordReset } = await import("../src/modules/auth/password-reset.model");
    await PasswordReset.create({
      userId: user.id,
      organizationId: organization.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const reset = await request("/api/v1/auth/reset-password", {
      body: {
        token: resetToken,
        password: "A-new-strong-password-2026",
      },
    });

    assert.equal(reset.status, 200);
    assert.equal(reset.body.success, true);
    assert.equal((await request("/api/v1/auth/me", { token: oldToken })).status, 401);

    const login = await request("/api/v1/auth/login", {
      body: {
        organizationSlug: slug,
        email,
        password: "A-new-strong-password-2026",
      },
    });

    assert.equal(login.status, 200);
    assert.equal(typeof login.body.data?.accessToken, "string");
  });

  test("rejects invalid password reset tokens", async () => {
    const result = await request("/api/v1/auth/reset-password", {
      body: {
        token: randomBytes(32).toString("base64url"),
        password: "A-new-strong-password-2026",
      },
    });

    assert.equal(result.status, 400);
  });

  test("accepts a valid employee invitation once and links the employee account", async () => {
    const { registration, organization, owner, employee } =
      await createInvitableEmployee();
    const { inviteEmployee } = await import(
      "../src/modules/employees/employee-invitation.service"
    );
    let invitationText = "";

    await inviteEmployee(
      organization.id,
      employee._id.toString(),
      owner.id,
      async (message) => {
        invitationText = message.text;
        return true;
      },
    );

    const token = invitationText.match(/[?&]token=([A-Za-z0-9_-]{43})/)?.[1];
    assert.ok(token);

    const accepted = await request("/api/v1/auth/accept-invitation", {
      body: { token, password: "A-strong-employee-password-2026" },
    });
    assert.equal(accepted.status, 201);

    const { Employee } = await import("../src/modules/employees/employee.model");
    const { User } = await import("../src/modules/users/user.model");
    const linkedEmployee = await Employee.findById(employee._id).lean();
    const linkedUser = await User.findOne({
      organizationId: organization.id,
      email: employee.email,
    }).lean();
    assert.ok(linkedEmployee?.userId);
    assert.equal(linkedEmployee.userId.toString(), linkedUser?._id.toString());
    assert.equal(linkedUser?.role, "employee");

    const linkedDelete = await request(`/api/v1/employees/${employee._id}`, {
      token: registration.body.data?.accessToken as string,
      method: "DELETE",
    });
    assert.equal(linkedDelete.status, 409);

    const reused = await request("/api/v1/auth/accept-invitation", {
      body: { token, password: "A-strong-employee-password-2026" },
    });
    assert.equal(reused.status, 400);
  });

  test("rejects invalid and expired employee invitation tokens", async () => {
    const invalid = await request("/api/v1/auth/accept-invitation", {
      body: {
        token: randomBytes(32).toString("base64url"),
        password: "A-strong-employee-password-2026",
      },
    });
    assert.equal(invalid.status, 400);

    const { organization, owner, employee } = await createInvitableEmployee();
    const expiredToken = randomBytes(32).toString("base64url");
    const { EmployeeInvitation } = await import(
      "../src/modules/employees/employee-invitation.model"
    );
    await EmployeeInvitation.create({
      organizationId: organization.id,
      employeeId: employee._id,
      email: employee.email,
      tokenHash: createHash("sha256").update(expiredToken).digest("hex"),
      expiresAt: new Date(Date.now() - 1000),
      invitedBy: owner.id,
    });

    const expired = await request("/api/v1/auth/accept-invitation", {
      body: {
        token: expiredToken,
        password: "A-strong-employee-password-2026",
      },
    });
    assert.equal(expired.status, 400);
  });

  test("rejects an invitation when its employee belongs to another organization", async () => {
    const first = await createInvitableEmployee();
    const second = await createInvitableEmployee();
    const token = randomBytes(32).toString("base64url");
    const { EmployeeInvitation } = await import(
      "../src/modules/employees/employee-invitation.model"
    );
    await EmployeeInvitation.create({
      organizationId: first.organization.id,
      employeeId: second.employee._id,
      email: second.employee.email,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60_000),
      invitedBy: first.owner.id,
    });

    const result = await request("/api/v1/auth/accept-invitation", {
      body: { token, password: "A-strong-employee-password-2026" },
    });
    assert.equal(result.status, 409);

    const { Employee } = await import("../src/modules/employees/employee.model");
    const unlinkedEmployee = await Employee.findById(second.employee._id).lean();
    assert.equal(unlinkedEmployee?.userId, undefined);
  });

  test("prevents duplicate accounts and removes invitations after email delivery failure", async () => {
    const duplicateEmail = `${randomBytes(5).toString("hex")}@example.test`;
    const duplicate = await createInvitableEmployee(duplicateEmail);
    const { User } = await import("../src/modules/users/user.model");
    await User.create({
      organizationId: duplicate.organization.id,
      email: duplicateEmail,
      passwordHash: "not-used-in-this-test",
      role: "employee",
    });
    const { inviteEmployee } = await import(
      "../src/modules/employees/employee-invitation.service"
    );
    let duplicateToken = "";
    await inviteEmployee(
      duplicate.organization.id,
      duplicate.employee._id.toString(),
      duplicate.owner.id,
      async (message) => {
        duplicateToken = message.text.match(/[?&]token=([A-Za-z0-9_-]{43})/)?.[1] ?? "";
        return true;
      },
    );
    const duplicateAcceptance = await request("/api/v1/auth/accept-invitation", {
      body: {
        token: duplicateToken,
        password: "A-strong-employee-password-2026",
      },
    });
    assert.equal(duplicateAcceptance.status, 409);

    const failedDelivery = await createInvitableEmployee();
    const { EmployeeInvitation } = await import(
      "../src/modules/employees/employee-invitation.model"
    );
    await assert.rejects(
      inviteEmployee(
        failedDelivery.organization.id,
        failedDelivery.employee._id.toString(),
        failedDelivery.owner.id,
        async () => false,
      ),
      { statusCode: 503 },
    );
    assert.equal(
      await EmployeeInvitation.countDocuments({
        employeeId: failedDelivery.employee._id,
        acceptedAt: null,
      }),
      0,
    );
  });

  test("scopes managers to their department and employees to their own records", async () => {
    const registration = await registerOwner();
    const organization = registration.body.data?.organization as { id: string };
    const owner = registration.body.data?.user as { id: string };
    const [
      { User },
      { Employee },
      { Department },
      { Attendance },
      { Leave },
    ] = await Promise.all([
      import("../src/modules/users/user.model"),
      import("../src/modules/employees/employee.model"),
      import("../src/modules/departments/department.model"),
      import("../src/modules/attendance/attendance.model"),
      import("../src/modules/leave-management/leave.model"),
    ]);

    const managerUser = await User.create({
      organizationId: organization.id,
      email: `manager-${randomBytes(4).toString("hex")}@example.test`,
      passwordHash: "test-session-only",
      role: "manager",
    });
    const employeeUser = await User.create({
      organizationId: organization.id,
      email: `staff-${randomBytes(4).toString("hex")}@example.test`,
      passwordHash: "test-session-only",
      role: "employee",
    });

    const manager = await Employee.create({
      organizationId: organization.id,
      employeeCode: "MGR-1",
      firstName: "Team",
      lastName: "Manager",
      email: managerUser.email,
      department: "People",
      status: "active",
      userId: managerUser._id,
      createdBy: owner.id,
    });
    const teamEmployee = await Employee.create({
      organizationId: organization.id,
      employeeCode: "EMP-1",
      firstName: "Team",
      lastName: "Member",
      email: employeeUser.email,
      department: "People",
      status: "active",
      userId: employeeUser._id,
      createdBy: owner.id,
    });
    const outsideEmployee = await Employee.create({
      organizationId: organization.id,
      employeeCode: "EMP-2",
      firstName: "Other",
      lastName: "Member",
      email: `other-${randomBytes(4).toString("hex")}@example.test`,
      department: "Finance",
      status: "active",
      createdBy: owner.id,
    });
    const managerToken = await createSessionToken(
      managerUser._id.toString(),
      organization.id,
    );
    const employeeToken = await createSessionToken(
      employeeUser._id.toString(),
      organization.id,
    );

    await Department.create([
      {
        organizationId: organization.id,
        name: "People",
        createdBy: owner.id,
      },
      {
        organizationId: organization.id,
        name: "Finance",
        createdBy: owner.id,
      },
    ]);
    const teamAttendance = await Attendance.create({
      organizationId: organization.id,
      employeeId: teamEmployee._id,
      attendanceDate: "2026-10-01",
      createdBy: owner.id,
    });
    const outsideAttendance = await Attendance.create({
      organizationId: organization.id,
      employeeId: outsideEmployee._id,
      attendanceDate: "2026-10-02",
      createdBy: owner.id,
    });
    const teamLeave = await Leave.create({
      organizationId: organization.id,
      employeeId: teamEmployee._id,
      leaveType: "casual",
      startDate: "2030-01-01",
      endDate: "2030-01-01",
      totalDays: 1,
      reason: "Personal",
      status: "pending",
      createdBy: employeeUser._id,
    });
    const outsideLeave = await Leave.create({
      organizationId: organization.id,
      employeeId: outsideEmployee._id,
      leaveType: "sick",
      startDate: "2030-02-01",
      endDate: "2030-02-01",
      totalDays: 1,
      reason: "Medical appointment",
      status: "pending",
      createdBy: owner.id,
    });

    const managerEmployees = await request("/api/v1/employees?search=Other", {
      token: managerToken,
    });
    assert.equal(managerEmployees.status, 200);
    assert.equal(
      (managerEmployees.body.data as { pagination: { total: number } })
        .pagination.total,
      0,
    );
    assert.equal(
      (
        await request(`/api/v1/employees/${outsideEmployee._id}`, {
          token: managerToken,
        })
      ).status,
      404,
    );

    const managerDepartments = await request("/api/v1/departments", {
      token: managerToken,
    });
    assert.equal(managerDepartments.status, 200);
    assert.deepEqual(
      (managerDepartments.body.data as { departments: { name: string }[] })
        .departments.map(({ name }) => name),
      ["People"],
    );
    const managerAttendance = await request(
      `/api/v1/attendance?employeeId=${outsideEmployee._id}`,
      { token: managerToken },
    );
    assert.equal(managerAttendance.status, 200);
    assert.equal(
      (managerAttendance.body.data as { pagination: { total: number } })
        .pagination.total,
      0,
    );
    assert.equal(
      (
        await request(`/api/v1/leaves/${outsideLeave._id}/review`, {
          token: managerToken,
          method: "PATCH",
          body: { status: "approved" },
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await request(`/api/v1/leaves/${teamLeave._id}/review`, {
          token: managerToken,
          method: "PATCH",
          body: { status: "approved" },
        })
      ).status,
      200,
    );

    assert.equal(
      (await request("/api/v1/employees", { token: employeeToken })).status,
      403,
    );
    const ownProfile = await request("/api/v1/employees/me", {
      token: employeeToken,
    });
    assert.equal(ownProfile.status, 200);
    assert.equal(
      (ownProfile.body.data as { _id: string })._id,
      teamEmployee._id.toString(),
    );
    const ownAttendance = await request(
      `/api/v1/attendance/me?employeeId=${outsideEmployee._id}`,
      { token: employeeToken },
    );
    assert.equal(ownAttendance.status, 200);
    assert.equal(
      (ownAttendance.body.data as { items: { _id: string }[] }).items.length,
      1,
    );
    assert.equal(
      (
        ownAttendance.body.data as { items: { _id: string }[] }
      ).items[0]._id,
      teamAttendance._id.toString(),
    );
    assert.equal(
      (
        await request(`/api/v1/attendance/${outsideAttendance._id}`, {
          token: employeeToken,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request(`/api/v1/leaves/me/${outsideLeave._id}`, {
          token: employeeToken,
        })
      ).status,
      404,
    );
    const ownLeave = await request("/api/v1/leaves/me", {
      token: employeeToken,
      method: "POST",
      body: {
        employeeId: outsideEmployee._id.toString(),
        leaveType: "casual",
        startDate: "2030-03-01",
        endDate: "2030-03-01",
        reason: "Personal day",
      },
    });
    assert.equal(ownLeave.status, 201);
    const createdLeave = (ownLeave.body.leave as { employeeId: unknown });
    assert.equal(
      typeof createdLeave.employeeId === "object"
        ? String((createdLeave.employeeId as { _id?: unknown })._id)
        : String(createdLeave.employeeId),
      teamEmployee._id.toString(),
    );
  });

  test("serves private documents only to authorized organization users", async () => {
    const registration = await registerOwner();
    const organization = registration.body.data?.organization as { id: string };
    const owner = registration.body.data?.user as { id: string };
    const ownerToken = registration.body.data?.accessToken as string;
    const { Employee } = await import("../src/modules/employees/employee.model");
    const { User } = await import("../src/modules/users/user.model");
    const employeeUser = await User.create({
      organizationId: organization.id,
      email: `document-${randomBytes(4).toString("hex")}@example.test`,
      passwordHash: "test-session-only",
      role: "employee",
    });
    const employee = await Employee.create({
      organizationId: organization.id,
      employeeCode: "DOC-1",
      firstName: "Document",
      lastName: "Owner",
      email: employeeUser.email,
      status: "active",
      userId: employeeUser._id,
      createdBy: owner.id,
    });
    const otherEmployee = await Employee.create({
      organizationId: organization.id,
      employeeCode: "DOC-2",
      firstName: "Private",
      lastName: "Employee",
      email: `private-${randomBytes(4).toString("hex")}@example.test`,
      status: "active",
      createdBy: owner.id,
    });
    const employeeToken = await createSessionToken(
      employeeUser._id.toString(),
      organization.id,
    );
    const pdf = Buffer.from("%PDF-1.7\nprivate test document\n", "ascii");
    const uploaded = await uploadDocument(
      `/api/v1/documents/employees/${employee._id}`,
      employeeToken,
      pdf,
      {
        filename: "employment agreement.pdf",
        contentType: "application/pdf",
        category: "contract",
      },
    );
    assert.equal(uploaded.status, 201);
    const document = uploaded.body.data as {
      id: string;
      employeeId: string;
      filename: string;
      storageKey?: string;
    };
    assert.equal(document.employeeId, employee._id.toString());
    assert.equal(document.filename, "employment agreement.pdf");
    assert.equal("storageKey" in document, false);

    const employeeList = await request(
      `/api/v1/documents/employees/${employee._id}`,
      { token: employeeToken },
    );
    assert.equal(employeeList.status, 200);
    assert.equal(
      (employeeList.body.data as { id: string }[]).length,
      1,
    );
    assert.equal(
      (
        await request(`/api/v1/documents/employees/${otherEmployee._id}`, {
          token: employeeToken,
        })
      ).status,
      404,
    );

    const downloaded = await fetch(
      `${baseUrl}/api/v1/documents/${document.id}/download`,
      { headers: { Authorization: "Bearer " + employeeToken } },
    );
    assert.equal(downloaded.status, 200);
    assert.equal(downloaded.headers.get("cache-control"), "private, no-store");
    assert.equal(downloaded.headers.get("x-content-type-options"), "nosniff");
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), pdf);
    assert.equal(
      (
        await request(`/api/v1/documents/${document.id}`, {
          token: employeeToken,
          method: "DELETE",
        })
      ).status,
      403,
    );

    const spoofedFile = await uploadDocument(
      `/api/v1/documents/employees/${employee._id}`,
      employeeToken,
      Buffer.from("not a pdf"),
      {
        filename: "malicious.pdf",
        contentType: "application/pdf",
        category: "other",
      },
    );
    assert.equal(spoofedFile.status, 400);

    assert.equal(
      (
        await request(`/api/v1/documents/${document.id}`, {
          token: ownerToken,
          method: "DELETE",
        })
      ).status,
      200,
    );
  });

  test("returns organization-scoped HR analytics from MongoDB", async () => {
    const first = await registerOwner();
    const second = await registerOwner();
    const organizationA = first.body.data?.organization as { id: string };
    const organizationB = second.body.data?.organization as { id: string };
    const ownerA = first.body.data?.user as { id: string };
    const { Employee } = await import("../src/modules/employees/employee.model");
    const { Attendance } = await import("../src/modules/attendance/attendance.model");
    const { Leave } = await import("../src/modules/leave-management/leave.model");

    const active = await Employee.create({
      organizationId: organizationA.id,
      employeeCode: "RPT-1",
      firstName: "Active",
      lastName: "Employee",
      email: `active-${randomBytes(4).toString("hex")}@example.test`,
      department: "Engineering",
      dateOfJoining: new Date("2026-03-15T00:00:00.000Z"),
      status: "active",
      createdBy: ownerA.id,
    });
    await Employee.create({
      organizationId: organizationA.id,
      employeeCode: "RPT-2",
      firstName: "Inactive",
      lastName: "Employee",
      email: `inactive-${randomBytes(4).toString("hex")}@example.test`,
      department: "Engineering",
      status: "inactive",
      createdBy: ownerA.id,
    });
    await Attendance.create({
      organizationId: organizationA.id,
      employeeId: active._id,
      attendanceDate: "2026-03-18",
      status: "present",
      createdBy: ownerA.id,
    });
    await Leave.create({
      organizationId: organizationA.id,
      employeeId: active._id,
      leaveType: "casual",
      startDate: "2026-03-20",
      endDate: "2026-03-21",
      totalDays: 2,
      reason: "Personal",
      status: "approved",
      reviewedBy: ownerA.id,
      reviewedAt: new Date("2026-03-10T00:00:00.000Z"),
      createdBy: ownerA.id,
    });

    const reportA = await request(
      "/api/v1/reports/summary?from=2026-03-01&to=2026-03-31",
      { token: first.body.data?.accessToken as string },
    );
    assert.equal(reportA.status, 200);
    const dataA = reportA.body.data as {
      employees: { total: number; active: number; inactive: number };
      departments: { department: string; count: number }[];
      attendance: { total: number; monthly: { month: string; count: number }[] };
      leaves: { total: number; approvals: { status: string; count: number }[] };
      joiningTrends: { month: string; count: number }[];
    };
    assert.equal(dataA.employees.total, 2);
    assert.equal(dataA.employees.active, 1);
    assert.equal(dataA.employees.inactive, 1);
    assert.deepEqual(dataA.departments, [{ department: "Engineering", count: 2 }]);
    assert.equal(dataA.attendance.total, 1);
    assert.deepEqual(dataA.attendance.monthly, [{ month: "2026-03", count: 1 }]);
    assert.equal(dataA.leaves.total, 1);
    assert.deepEqual(dataA.leaves.approvals, [{ status: "approved", count: 1 }]);
    assert.deepEqual(dataA.joiningTrends, [{ month: "2026-03", count: 1 }]);

    const reportB = await request("/api/v1/reports/summary", {
      token: second.body.data?.accessToken as string,
    });
    assert.equal(reportB.status, 200);
    assert.equal(
      (reportB.body.data as { employees: { total: number } }).employees.total,
      0,
    );
    assert.equal(
      (
        await request("/api/v1/reports/summary?from=2026-02-31", {
          token: first.body.data?.accessToken as string,
        })
      ).status,
      400,
    );
  });

  test("restricts organization and user management to owners and admins", async () => {
    const ownerRegistration = await registerOwner();
    const otherOwnerRegistration = await registerOwner();
    const organization = ownerRegistration.body.data?.organization as { id: string };
    const owner = ownerRegistration.body.data?.user as { id: string };
    const otherOwner = otherOwnerRegistration.body.data?.user as { id: string };
    const { User } = await import("../src/modules/users/user.model");
    const admin = await User.create({
      organizationId: organization.id,
      email: `admin-${randomBytes(4).toString("hex")}@example.test`,
      passwordHash: "test-session-only",
      role: "admin",
    });
    const hrUser = await User.create({
      organizationId: organization.id,
      email: `hr-${randomBytes(4).toString("hex")}@example.test`,
      passwordHash: "test-session-only",
      role: "hr",
    });
    const adminToken = await createSessionToken(
      admin._id.toString(),
      organization.id,
    );
    const hrToken = await createSessionToken(
      hrUser._id.toString(),
      organization.id,
    );
    const ownerToken = ownerRegistration.body.data?.accessToken as string;
    const otherOwnerToken = otherOwnerRegistration.body.data?.accessToken as string;

    const listedUsers = await request("/api/v1/users", { token: ownerToken });
    assert.equal(listedUsers.status, 200);
    const listedUser = (listedUsers.body.data as { email: string; passwordHash?: string }[])
      .find((item) => item.email === admin.email);
    assert.ok(listedUser);
    assert.equal("passwordHash" in listedUser, false);

    assert.equal(
      (
        await request("/api/v1/users", {
          token: hrToken,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("/api/v1/organization", {
          token: hrToken,
          method: "PATCH",
          body: { name: "Unauthorized Rename" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("/api/v1/organization", {
          token: ownerToken,
          method: "PATCH",
          body: { name: "Updated HRMPro Organization", slug: "changed-slug" },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/v1/organization", {
          token: adminToken,
          method: "PATCH",
          body: { name: "Admin Updated Organization" },
        })
      ).status,
      200,
    );

    assert.equal(
      (
        await request(`/api/v1/users/${owner.id}/status`, {
          token: adminToken,
          method: "PATCH",
          body: { status: "suspended" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request(`/api/v1/users/${admin._id}/status`, {
          token: adminToken,
          method: "PATCH",
          body: { status: "suspended" },
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await request(`/api/v1/users/${otherOwner.id}/status`, {
          token: ownerToken,
          method: "PATCH",
          body: { status: "suspended" },
        })
      ).status,
      404,
    );

    const suspended = await request(`/api/v1/users/${admin._id}/status`, {
      token: ownerToken,
      method: "PATCH",
      body: { status: "suspended" },
    });
    assert.equal(suspended.status, 200);
    assert.equal((await request("/api/v1/auth/me", { token: adminToken })).status, 401);
    assert.equal(
      (
        await request("/api/v1/users", {
          token: otherOwnerToken,
        })
      ).status,
      200,
    );
  });
});
