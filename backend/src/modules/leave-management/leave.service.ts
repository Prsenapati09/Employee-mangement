import { Types, type FilterQuery } from "mongoose";
import { Employee } from "../employees/employee.model";
import {
  notifyLeaveRequest,
  notifyLeaveReview,
} from "../notifications/leave-notifications.service";
import { Leave, type LeaveDocument } from "./leave.model";
import {
  CreateLeaveInput,
  LeaveListQuery,
  ReviewLeaveInput,
} from "./leave.validation";

export class LeaveServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "LeaveServiceError";
  }
}

export type LeaveScope = {
  employeeId?: string;
  department?: string;
};

function isValidId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function countDays(startDate: string, endDate: string): number {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new LeaveServiceError("Invalid leave date range", 400);
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

  if (totalDays < 1) {
    throw new LeaveServiceError("Invalid leave date range", 400);
  }

  return totalDays;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class LeaveService {
  static async createLeave(
    organizationId: string,
    userId: string,
    input: CreateLeaveInput
  ) {
    if (!isValidId(organizationId) || !isValidId(userId)) {
      throw new LeaveServiceError("Invalid organization or user ID", 400);
    }
    if (!isValidId(input.employeeId)) {
      throw new LeaveServiceError("Invalid employee ID", 400);
    }

    const totalDays = countDays(input.startDate, input.endDate);
    const organizationObjectId = new Types.ObjectId(organizationId);
    const employeeObjectId = new Types.ObjectId(input.employeeId);
    const employee = await Employee.findOne({
      _id: employeeObjectId,
      organizationId: organizationObjectId,
      status: "active",
    })
      .lean()
      .exec();

    if (!employee) {
      throw new LeaveServiceError("Active employee not found", 404);
    }

    const overlap = await Leave.findOne({
      organizationId: organizationObjectId,
      employeeId: employeeObjectId,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: input.endDate },
      endDate: { $gte: input.startDate },
    })
      .lean()
      .exec();

    if (overlap) {
      throw new LeaveServiceError(
        "This leave overlaps an existing pending or approved request",
        409
      );
    }

    const leave = await Leave.create({
      organizationId: organizationObjectId,
      employeeId: employeeObjectId,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      totalDays,
      reason: input.reason,
      status: "pending",
      createdBy: new Types.ObjectId(userId),
    });

    void notifyLeaveRequest({
      organizationId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeEmail: employee.email,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      totalDays,
      reason: input.reason,
    }).catch(() => {
      console.error("Unable to send leave request notification.");
    });

    return leave;
  }

  static async listLeaves(
    organizationId: string,
    query: LeaveListQuery,
    scope?: LeaveScope,
  ) {
    if (!isValidId(organizationId)) {
      throw new LeaveServiceError("Invalid organization ID", 400);
    }
    if (query.employeeId && !isValidId(query.employeeId)) {
      throw new LeaveServiceError("Invalid employee ID", 400);
    }

    const filter: FilterQuery<LeaveDocument> = {
      organizationId: new Types.ObjectId(organizationId),
    };

    if (query.status) filter.status = query.status;
    if (query.leaveType) filter.leaveType = query.leaveType;
    if (scope?.employeeId) {
      filter.employeeId = new Types.ObjectId(scope.employeeId);
    } else if (query.employeeId) {
      filter.employeeId = new Types.ObjectId(query.employeeId);
    }

    if (query.from || query.to) {
      const dateFilter: { $gte?: string; $lte?: string } = {};
      if (query.from) dateFilter.$gte = query.from;
      if (query.to) dateFilter.$lte = query.to;
      filter.startDate = dateFilter;
    }

    const employeeConstraints: FilterQuery<LeaveDocument>[] = [];
    if (query.search) {
      const search = new RegExp(escapeRegex(query.search), "i");
      const employees = await Employee.find({
        organizationId: new Types.ObjectId(organizationId),
        $or: [
          { firstName: search },
          { lastName: search },
          { employeeCode: search },
          { email: search },
        ],
      })
        .select("_id")
        .lean()
        .exec();

      employeeConstraints.push({
        employeeId: { $in: employees.map((employee) => employee._id) },
      });
    }

    if (scope?.department) {
      const team = await Employee.find({
        organizationId: new Types.ObjectId(organizationId),
        department: scope.department,
      }).select("_id");
      employeeConstraints.push({
        employeeId: { $in: team.map((employee) => employee._id) },
      });
    }

    if (filter.employeeId) {
      employeeConstraints.push({ employeeId: filter.employeeId });
      delete filter.employeeId;
    }
    if (employeeConstraints.length > 0) {
      filter.$and = employeeConstraints;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Leave.find(filter)
        .populate("employeeId", "firstName lastName employeeCode email")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Leave.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLeave(
    organizationId: string,
    leaveId: string,
    scope?: LeaveScope,
  ) {
    if (!isValidId(organizationId) || !isValidId(leaveId)) {
      throw new LeaveServiceError("Invalid organization or leave ID", 400);
    }

    const leave = await Leave.findOne({
      _id: new Types.ObjectId(leaveId),
      organizationId: new Types.ObjectId(organizationId),
      ...(scope?.employeeId
        ? { employeeId: new Types.ObjectId(scope.employeeId) }
        : {}),
    })
      .populate("employeeId", "firstName lastName employeeCode email")
      .populate("reviewedBy", "name email");

    if (!leave) throw new LeaveServiceError("Leave request not found", 404);
    if (
      scope?.department &&
      !(await Employee.exists({
        _id: leave.employeeId,
        organizationId: new Types.ObjectId(organizationId),
        department: scope.department,
      }))
    ) {
      throw new LeaveServiceError("Leave request not found", 404);
    }
    return leave;
  }

  static async reviewLeave(
    organizationId: string,
    userId: string,
    leaveId: string,
    input: ReviewLeaveInput,
    departmentScope?: string,
  ) {
    if (!isValidId(organizationId) || !isValidId(userId) || !isValidId(leaveId)) {
      throw new LeaveServiceError("Invalid organization, user, or leave ID", 400);
    }

    const leave = await Leave.findOne({
      _id: new Types.ObjectId(leaveId),
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!leave) throw new LeaveServiceError("Leave request not found", 404);
    if (
      departmentScope &&
      !(await Employee.exists({
        _id: leave.employeeId,
        organizationId: new Types.ObjectId(organizationId),
        department: departmentScope,
      }))
    ) {
      throw new LeaveServiceError("Leave request not found", 404);
    }
    if (leave.status !== "pending") {
      throw new LeaveServiceError("Only pending leave requests can be reviewed", 409);
    }

    leave.status = input.status;
    leave.reviewedBy = new Types.ObjectId(userId);
    leave.reviewedAt = new Date();
    leave.reviewComment = input.reviewComment;
    await leave.save();

    if (input.status === "approved" || input.status === "rejected") {
      void (async () => {
        const employee = await Employee.findOne({
          _id: leave.employeeId,
          organizationId: new Types.ObjectId(organizationId),
        })
          .select("firstName lastName email")
          .lean()
          .exec();

        if (!employee?.email) return;

        await notifyLeaveReview({
          employeeEmail: employee.email,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          status: input.status,
          reviewComment: input.reviewComment,
        });
      })().catch(() => {
        console.error("Unable to send leave review notification.");
      });
    }

    return leave;
  }

  static async cancelLeave(
    organizationId: string,
    leaveId: string,
    employeeId?: string,
  ) {
    if (!isValidId(organizationId) || !isValidId(leaveId)) {
      throw new LeaveServiceError("Invalid organization or leave ID", 400);
    }

    const leave = await Leave.findOne({
      _id: new Types.ObjectId(leaveId),
      organizationId: new Types.ObjectId(organizationId),
      ...(employeeId ? { employeeId: new Types.ObjectId(employeeId) } : {}),
    });

    if (!leave) throw new LeaveServiceError("Leave request not found", 404);
    if (leave.status !== "pending") {
      throw new LeaveServiceError("Only pending leave requests can be cancelled", 409);
    }

    leave.status = "cancelled";
    await leave.save();
    return leave;
  }
}
