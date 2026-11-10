import { Types } from "mongoose";
import { Department } from "./department.model";
import type {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentListQuerySchema,
} from "./department.validation";
import type { z } from "zod";

type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
type DepartmentListQuery = z.infer<typeof departmentListQuerySchema>;

export class DepartmentServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "DepartmentServiceError";
  }
}

function ensureObjectId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new DepartmentServiceError("Department not found.", 404);
  }
}

export async function createDepartment(
  organizationId: string,
  userId: string,
  input: CreateDepartmentInput,
) {
  try {
    return await Department.create({
      organizationId: new Types.ObjectId(organizationId),
      createdBy: new Types.ObjectId(userId),
      name: input.name,
      description: input.description,
      status: input.status ?? "active",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new DepartmentServiceError(
        "A department with this name already exists.",
        409,
      );
    }
    throw error;
  }
}

export async function listDepartments(
  organizationId: string,
  query: DepartmentListQuery,
  departmentScope?: string,
) {
  const filter: Record<string, unknown> = {
    organizationId: new Types.ObjectId(organizationId),
  };

  if (departmentScope) filter.name = departmentScope;
  if (query.status) filter.status = query.status;

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [departments, total] = await Promise.all([
    Department.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Department.countDocuments(filter),
  ]);

  return {
    departments,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getDepartment(
  organizationId: string,
  departmentId: string,
  departmentScope?: string,
) {
  ensureObjectId(departmentId);

  const department = await Department.findOne({
    _id: new Types.ObjectId(departmentId),
    organizationId: new Types.ObjectId(organizationId),
    ...(departmentScope ? { name: departmentScope } : {}),
  }).lean();

  if (!department) {
    throw new DepartmentServiceError("Department not found.", 404);
  }

  return department;
}

export async function updateDepartment(
  organizationId: string,
  departmentId: string,
  input: UpdateDepartmentInput,
) {
  ensureObjectId(departmentId);

  try {
    const department = await Department.findOneAndUpdate(
      {
        _id: new Types.ObjectId(departmentId),
        organizationId: new Types.ObjectId(organizationId),
      },
      { $set: input },
      { new: true, runValidators: true },
    ).lean();

    if (!department) {
      throw new DepartmentServiceError("Department not found.", 404);
    }

    return department;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new DepartmentServiceError(
        "A department with this name already exists.",
        409,
      );
    }
    throw error;
  }
}

export async function deleteDepartment(
  organizationId: string,
  departmentId: string,
) {
  ensureObjectId(departmentId);

  const department = await Department.findOneAndDelete({
    _id: new Types.ObjectId(departmentId),
    organizationId: new Types.ObjectId(organizationId),
  });

  if (!department) {
    throw new DepartmentServiceError("Department not found.", 404);
  }

  return { id: String(department._id) };
}
