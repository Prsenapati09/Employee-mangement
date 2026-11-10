import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import mongoose from "mongoose";
import { AuthSession } from "./auth-session.model";
import { Employee } from "../employees/employee.model";
import { EmployeeInvitation } from "../employees/employee-invitation.model";
import { PasswordReset } from "./password-reset.model";
import { env } from "../../config/env";
import { sendNotificationEmail } from "../notifications/email.service";
import { Organization } from "../organization/organization.model";
import { User } from "../users/user.model";
import type { LoginInput, OwnerRegistrationInput } from "./auth.validation";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const INVALID_CREDENTIALS = "Invalid organization, email, or password.";

function isDuplicateKeyError(
  error: unknown,
): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function derivePasswordKey(
  password: string,
  salt: Buffer,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      SCRYPT_OPTIONS,
      (error, key) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(key);
      },
    );
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derivePasswordKey(password, salt);
  return `$scrypt$16384$8$1$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

async function verifyPassword(
  password: string,
  encodedHash: string | undefined,
): Promise<boolean> {
  const parsed = encodedHash?.match(
    /^\$scrypt\$16384\$8\$1\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/,
  );
  const salt = parsed
    ? Buffer.from(parsed[1], "base64url")
    : Buffer.alloc(16);
  const expectedKey = parsed
    ? Buffer.from(parsed[2], "base64url")
    : Buffer.alloc(SCRYPT_KEY_LENGTH);
  const actualKey = await derivePasswordKey(password, salt);

  return (
    Boolean(parsed) &&
    expectedKey.length === actualKey.length &&
    timingSafeEqual(expectedKey, actualKey)
  );
}

function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function issueAccessToken(
  userId: string,
  organizationId: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const accessToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);
  await AuthSession.create({
    userId,
    organizationId,
    tokenHash: hashAccessToken(accessToken),
    expiresAt,
  });
  return { accessToken, expiresAt };
}

export interface AuthenticatedContext {
  sessionId: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "hr" | "manager" | "employee";
}

export async function registerOrganizationOwner(
  input: OwnerRegistrationInput,
): Promise<{
  accessToken: string;
  expiresAt: Date;
  organization: { id: string; name: string; slug: string };
  user: { id: string; email: string; role: string };
}> {
  const existingOrganization = await Organization.exists({
    slug: input.organizationSlug,
  });
  if (existingOrganization) {
    throw new AuthError("Organization slug is unavailable.", 409);
  }

  let organization;
  try {
    organization = await Organization.create({
      name: input.organizationName,
      slug: input.organizationSlug,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AuthError("Organization slug is unavailable.", 409);
    }
    throw error;
  }

  let user;
  try {
    user = await User.create({
      organizationId: organization._id,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "owner",
    });
  } catch (error) {
    try {
      await Organization.deleteOne({ _id: organization._id });
    } catch (cleanupError) {
      console.error("Failed to clean up incomplete organization registration.");
      throw cleanupError;
    }

    if (isDuplicateKeyError(error)) {
      throw new AuthError("Unable to register this organization owner.", 409);
    }
    throw error;
  }

  const token = await issueAccessToken(
    user._id.toString(),
    organization._id.toString(),
  );

  return {
    ...token,
    organization: {
      id: organization._id.toString(),
      name: organization.name,
      slug: organization.slug,
    },
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
}

export async function login(input: LoginInput): Promise<{
  accessToken: string;
  expiresAt: Date;
  user: { id: string; email: string; role: string };
}> {
  const organization = await Organization.findOne({
    slug: input.organizationSlug,
    status: "active",
  }).select("_id");

  const user = organization
    ? await User.findOne({
        organizationId: organization._id,
        email: input.email,
        status: "active",
      }).select("+passwordHash email role")
    : null;

  const passwordMatches = await verifyPassword(
    input.password,
    user?.passwordHash,
  );
  if (!organization || !user || !passwordMatches) {
    throw new AuthError(INVALID_CREDENTIALS, 401);
  }

  const token = await issueAccessToken(
    user._id.toString(),
    organization._id.toString(),
  );
  return {
    ...token,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
}

export async function authenticateAccessToken(
  accessToken: string,
): Promise<AuthenticatedContext | null> {
  const tokenHash = hashAccessToken(accessToken);
  const session = await AuthSession.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).select("+tokenHash");

  if (!session) {
    return null;
  }

  const [user, organization] = await Promise.all([
    User.findOne({
      _id: session.userId,
      organizationId: session.organizationId,
      status: "active",
    }).select("_id role"),
    Organization.findOne({
      _id: session.organizationId,
      status: "active",
    }).select("_id"),
  ]);

  if (!user || !organization) {
    await AuthSession.deleteOne({ _id: session._id });
    return null;
  }

  return {
    sessionId: session._id.toString(),
    userId: user._id.toString(),
    organizationId: organization._id.toString(),
    role: user.role,
  };
}

export async function getCurrentProfile(context: AuthenticatedContext) {
  const [user, organization] = await Promise.all([
    User.findOne({
      _id: context.userId,
      organizationId: context.organizationId,
      status: "active",
    }).select("_id email role status"),
    Organization.findOne({
      _id: context.organizationId,
      status: "active",
    }).select("_id name slug"),
  ]);

  if (!user || !organization) {
    throw new AuthError("Authentication is required.", 401);
  }

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
    },
    organization: {
      id: organization._id.toString(),
      name: organization.name,
      slug: organization.slug,
    },
  };
}

export async function revokeAccessToken(
  context: AuthenticatedContext,
): Promise<void> {
  await AuthSession.deleteOne({
    _id: context.sessionId,
    userId: context.userId,
    organizationId: context.organizationId,
  });
}

export function isValidOwnerProvisioningSecret(
  providedSecret: string | undefined,
  configuredSecret: string | undefined,
): boolean {
  if (!providedSecret || !configuredSecret) {
    return false;
  }
  const provided = Buffer.from(providedSecret);
  const configured = Buffer.from(configuredSecret);
  return (
    provided.length === configured.length &&
    timingSafeEqual(provided, configured)
  );
}

export async function requestPasswordReset(input: {
  organizationSlug: string;
  email: string;
}): Promise<void> {
  const organization = await Organization.findOne({
    slug: input.organizationSlug,
    status: "active",
  }).select("_id slug");

  if (!organization) return;

  const user = await User.findOne({
    organizationId: organization._id,
    email: input.email,
    status: "active",
  }).select("_id email");

  if (!user) return;

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashAccessToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await PasswordReset.deleteMany({
    userId: user._id,
    organizationId: organization._id,
  });

  const reset = await PasswordReset.create({
    userId: user._id,
    organizationId: organization._id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = new URL("/reset-password", env.FRONTEND_URL);
  resetUrl.searchParams.set("token", token);

  const sent = await sendNotificationEmail({
    to: user.email,
    subject: "Reset your HRMPro password",
    text: [
      "We received a request to reset your HRMPro password.",
      "",
      `Use this link within 15 minutes: ${resetUrl.toString()}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });

  if (!sent) {
    await PasswordReset.deleteOne({ _id: reset._id });
  }
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<void> {
  const tokenHash = hashAccessToken(input.token);
  const now = new Date();

  const reset = await PasswordReset.findOneAndUpdate(
    {
      tokenHash,
      expiresAt: { $gt: now },
      usedAt: null,
    },
    { $set: { usedAt: now } },
    { new: true },
  );

  if (!reset) {
    throw new AuthError("This password reset link is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(input.password);
  const update = await User.updateOne(
    {
      _id: reset.userId,
      organizationId: reset.organizationId,
      status: "active",
    },
    { $set: { passwordHash } },
  );

  if (update.modifiedCount !== 1) {
    throw new AuthError("Unable to reset this password. Please request a new link.", 400);
  }

  await Promise.all([
    AuthSession.deleteMany({
      userId: reset.userId,
      organizationId: reset.organizationId,
    }),
    PasswordReset.deleteMany({
      userId: reset.userId,
      organizationId: reset.organizationId,
    }),
  ]);
}



export async function acceptEmployeeInvitation(input: {
  token: string;
  password: string;
}): Promise<void> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(input.token)) {
    throw new AuthError("This invitation is invalid or has expired.", 400);
  }

  const tokenHash = hashAccessToken(input.token);
  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const invitation = await EmployeeInvitation.findOneAndUpdate(
        {
          tokenHash,
          expiresAt: { $gt: now },
          acceptedAt: null,
        },
        { $set: { acceptedAt: now } },
        { new: true, session },
      );

      if (!invitation) {
        throw new AuthError("This invitation is invalid or has expired.", 400);
      }

      const employee = await Employee.findOne({
        _id: invitation.employeeId,
        organizationId: invitation.organizationId,
        email: invitation.email,
        status: "active",
        userId: { $exists: false },
      }).session(session);

      if (!employee) {
        throw new AuthError(
          "This employee invitation can no longer be accepted.",
          409,
        );
      }

      const existingUser = await User.findOne({
        organizationId: invitation.organizationId,
        email: invitation.email,
      }).session(session);

      if (existingUser) {
        throw new AuthError(
          "An account already exists for this employee email.",
          409,
        );
      }

      const [user] = await User.create(
        [{
          organizationId: invitation.organizationId,
          email: invitation.email,
          passwordHash,
          role: "employee",
          status: "active",
        }],
        { session },
      );

      const linked = await Employee.updateOne(
        {
          _id: employee._id,
          organizationId: invitation.organizationId,
          userId: { $exists: false },
        },
        { $set: { userId: user._id } },
        { session },
      );

      if (linked.modifiedCount !== 1) {
        throw new AuthError(
          "Unable to link this employee account. Please try again.",
          409,
        );
      }
    });
  } finally {
    await session.endSession();
  }
}
