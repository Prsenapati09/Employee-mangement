import { Types } from "mongoose";
import { Employee } from "./employee.model";
import type { createEmployeeSchema, updateEmployeeSchema, employeeListQuerySchema } from "./employee.validation";
import type { z } from "zod";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;

export class EmployeeServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "EmployeeServiceError";
  }
}

function toObjectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new EmployeeServiceError("Invalid identifier.", 400);
  }
  return new Types.ObjectId(value);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function createEmployee(
  organizationId: string,
  userId: string,
  input: CreateEmployeeInput,
) {
  try {
    return await Employee.create({
      ...input,
      organizationId: toObjectId(organizationId),
      createdBy: toObjectId(userId),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new EmployeeServiceError(
        "An employee with this code or email already exists.",
        409,
      );
    }
    throw error;
  }

}

export async function listEmployees(
  organizationId: string,
  query: EmployeeListQuery,
  departmentScope?: string,
) {
  const filter: Record<string, unknown> = {
    organizationId: toObjectId(organizationId),
  };

  if (departmentScope) {
    filter.department = departmentScope;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const search = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { employeeCode: search },
      { firstName: search },
      { lastName: search },
      { email: search },
      { department: search },
      { jobTitle: search },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getEmployee(
  organizationId: string,
  employeeId: string,
  departmentScope?: string,
) {
  const filter: Record<string, unknown> = {
    _id: toObjectId(employeeId),
    organizationId: toObjectId(organizationId),
  };
  if (departmentScope) filter.department = departmentScope;

  const employee = await Employee.findOne({
    ...filter,
  }).lean();

  if (!employee) {
    throw new EmployeeServiceError("Employee not found.", 404);
  }

  return employee;
}

export async function getEmployeeForUser(
  organizationId: string,
  userId: string,
) {
  const employee = await Employee.findOne({
    organizationId: toObjectId(organizationId),
    userId: toObjectId(userId),
  }).lean();

  if (!employee) {
    throw new EmployeeServiceError("Employee profile not found.", 404);
  }

  return employee;
}

export async function getManagerDepartment(
  organizationId: string,
  userId: string,
): Promise<string> {
  const employee = await getEmployeeForUser(organizationId, userId);
  if (!employee.department) {
    throw new EmployeeServiceError(
      "Manager team access is not configured.",
      403,
    );
  }
  return employee.department;
}

export async function updateEmployee(
  organizationId: string,
  employeeId: string,
  input: UpdateEmployeeInput,
) {
  try {
    const employee = await Employee.findOneAndUpdate(
      {
        _id: toObjectId(employeeId),
        organizationId: toObjectId(organizationId),
      },
      { $set: input },
      { new: true, runValidators: true },
    ).lean();
    if (!employee) {
      throw new EmployeeServiceError("Employee not found.", 404);
    }
    return employee;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new EmployeeServiceError(
        "An employee with this code or email already exists.",
        409,
      );
    }
    throw error;
  }
}

export async function deleteEmployee(
  organizationId: string,
  employeeId: string,
) {
  const employee = await Employee.findOneAndDelete({
    _id: toObjectId(employeeId),
    organizationId: toObjectId(organizationId),
    userId: { $exists: false },
  }).lean();

  if (!employee) {
    const linkedEmployee = await Employee.exists({
      _id: toObjectId(employeeId),
      organizationId: toObjectId(organizationId),
      userId: { $exists: true },
    });
    if (linkedEmployee) {
      throw new EmployeeServiceError(
        "Employees with linked accounts cannot be deleted. Deactivate the employee instead.",
        409,
      );
    }
    throw new EmployeeServiceError("Employee not found.", 404);
  }

  return { id: String((employee as { _id: unknown })._id) };
}
