import { Types } from "mongoose";
import { Attendance } from "./attendance.model";
import { Employee } from "../employees/employee.model";

export class AttendanceServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AttendanceServiceError";
  }
}

type AttendanceInput = {
  employeeId: string;
  attendanceDate: string;
  checkIn?: Date;
  checkOut?: Date;
  status?: "present" | "late" | "half_day" | "absent";
  notes?: string;
};

type AttendanceUpdateInput = {
  checkIn?: Date;
  checkOut?: Date;
  status?: "present" | "late" | "half_day" | "absent";
  notes?: string;
};

type AttendanceListQuery = {
  page: number;
  limit: number;
  search?: string;
  date?: string;
  from?: string;
  to?: string;
  status?: "present" | "late" | "half_day" | "absent";
  employeeId?: string;
};

export type AttendanceScope = {
  employeeId?: string;
  department?: string;
};

export async function createAttendance(
  organizationId: string,
  userId: string,
  input: AttendanceInput,
) {
  if (!Types.ObjectId.isValid(input.employeeId)) {
    throw new AttendanceServiceError("Invalid employee ID.", 400);
  }

  const employee = await Employee.findOne({
    _id: input.employeeId,
    organizationId,
  }).select("_id status");

  if (!employee) {
    throw new AttendanceServiceError("Employee not found.", 404);
  }

  if (employee.status !== "active") {
    throw new AttendanceServiceError(
      "Attendance can only be recorded for active employees.",
      400,
    );
  }

  if (input.checkIn && input.checkOut && input.checkOut < input.checkIn) {
    throw new AttendanceServiceError(
      "Check-out cannot be earlier than check-in.",
      400,
    );
  }

  try {
    return await Attendance.create({
      organizationId,
      employeeId: employee._id,
      attendanceDate: input.attendanceDate,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      status: input.status ?? "present",
      notes: input.notes,
      createdBy: userId,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AttendanceServiceError(
        "Attendance already exists for this employee on this date.",
        409,
      );
    }
    throw error;
  }
}

export async function listAttendance(
  organizationId: string,
  query: AttendanceListQuery,
  scope?: AttendanceScope,
) {
  const filter: Record<string, unknown> = { organizationId };
  const employeeConstraints: Record<string, unknown>[] = [];

  if (query.date) {
    filter.attendanceDate = query.date;
  } else if (query.from || query.to) {
    const dateFilter: Record<string, string> = {};
    if (query.from) dateFilter.$gte = query.from;
    if (query.to) dateFilter.$lte = query.to;
    filter.attendanceDate = dateFilter;
  }

  if (query.status) filter.status = query.status;
  if (scope?.employeeId) {
    filter.employeeId = scope.employeeId;
  } else if (query.employeeId) {
    employeeConstraints.push({ employeeId: query.employeeId });
  }

  if (query.search) {
    const matchingEmployees = await Employee.find({
      organizationId,
      ...(scope?.department ? { department: scope.department } : {}),
      $or: [
        { firstName: { $regex: escapeRegex(query.search), $options: "i" } },
        { lastName: { $regex: escapeRegex(query.search), $options: "i" } },
        { employeeCode: { $regex: escapeRegex(query.search), $options: "i" } },
        { email: { $regex: escapeRegex(query.search), $options: "i" } },
      ],
    }).select("_id");

    employeeConstraints.push({
      employeeId: { $in: matchingEmployees.map((employee) => employee._id) },
    });
  } else if (scope?.department) {
    const teamEmployees = await Employee.find({
      organizationId,
      department: scope.department,
    }).select("_id");
    employeeConstraints.push({
      employeeId: { $in: teamEmployees.map((employee) => employee._id) },
    });
  }

  if (employeeConstraints.length > 0) {
    filter.$and = employeeConstraints;
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Attendance.find(filter)
      .populate("employeeId", "employeeCode firstName lastName email department jobTitle")
      .sort({ attendanceDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Attendance.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getAttendance(
  organizationId: string,
  attendanceId: string,
  scope?: AttendanceScope,
) {
  if (!Types.ObjectId.isValid(attendanceId)) {
    throw new AttendanceServiceError("Invalid attendance ID.", 400);
  }

  const attendance = await Attendance.findOne({
    _id: attendanceId,
    organizationId,
    ...(scope?.employeeId ? { employeeId: scope.employeeId } : {}),
  }).populate(
    "employeeId",
    "employeeCode firstName lastName email department jobTitle",
  );

  if (!attendance) {
    throw new AttendanceServiceError("Attendance record not found.", 404);
  }

  if (
    scope?.department &&
    !(await Employee.exists({
      _id: attendance.employeeId,
      organizationId,
      department: scope.department,
    }))
  ) {
    throw new AttendanceServiceError("Attendance record not found.", 404);
  }

  return attendance;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function updateAttendance(
  organizationId: string,
  attendanceId: string,
  input: AttendanceUpdateInput,
) {
  if (!Types.ObjectId.isValid(attendanceId)) {
    throw new AttendanceServiceError("Invalid attendance ID.", 400);
  }

  const attendance = await Attendance.findOne({
    _id: attendanceId,
    organizationId,
  });

  if (!attendance) {
    throw new AttendanceServiceError("Attendance record not found.", 404);
  }

  const nextCheckIn = input.checkIn ?? attendance.checkIn;
  const nextCheckOut = input.checkOut ?? attendance.checkOut;

  if (nextCheckIn && nextCheckOut && nextCheckOut < nextCheckIn) {
    throw new AttendanceServiceError(
      "Check-out cannot be earlier than check-in.",
      400,
    );
  }

  if (input.checkIn !== undefined) attendance.checkIn = input.checkIn;
  if (input.checkOut !== undefined) attendance.checkOut = input.checkOut;
  if (input.status !== undefined) attendance.status = input.status;
  if (input.notes !== undefined) attendance.notes = input.notes;

  await attendance.save();
  return attendance;
}

export async function deleteAttendance(
  organizationId: string,
  attendanceId: string,
) {
  if (!Types.ObjectId.isValid(attendanceId)) {
    throw new AttendanceServiceError("Invalid attendance ID.", 400);
  }

  const attendance = await Attendance.findOneAndDelete({
    _id: attendanceId,
    organizationId,
  });

  if (!attendance) {
    throw new AttendanceServiceError("Attendance record not found.", 404);
  }

  return { message: "Attendance record deleted successfully." };
}
