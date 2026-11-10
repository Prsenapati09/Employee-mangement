import { Types } from "mongoose";
import { Attendance } from "../attendance/attendance.model";
import { Employee } from "../employees/employee.model";
import { Leave } from "../leave-management/leave.model";
import type { z } from "zod";
import type { reportQuerySchema } from "./reports.validation";

type ReportQuery = z.infer<typeof reportQuerySchema>;

function defaultRange(query: ReportQuery) {
  const today = new Date();
  const from = query.from ?? new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1),
  ).toISOString().slice(0, 10);
  const to = query.to ?? today.toISOString().slice(0, 10);

  return {
    from,
    to,
    fromDate: new Date(`${from}T00:00:00.000Z`),
    throughDate: new Date(`${to}T23:59:59.999Z`),
  };
}

export async function getOrganizationReport(
  organizationId: string,
  query: ReportQuery,
) {
  const organizationObjectId = new Types.ObjectId(organizationId);
  const range = defaultRange(query);
  const attendanceMatch = {
    organizationId: organizationObjectId,
    attendanceDate: { $gte: range.from, $lte: range.to },
  };
  const leaveMatch = {
    organizationId: organizationObjectId,
    startDate: { $lte: range.to },
    endDate: { $gte: range.from },
  };
  const joiningMatch = {
    organizationId: organizationObjectId,
    dateOfJoining: {
      $gte: range.fromDate,
      $lte: range.throughDate,
    },
  };

  const [
    employeeTotal,
    activeEmployees,
    inactiveEmployees,
    employeesOnLeave,
    departmentCounts,
    attendanceByStatus,
    monthlyAttendance,
    leavesByStatus,
    leaveApprovals,
    joiningTrends,
  ] = await Promise.all([
    Employee.countDocuments({ organizationId: organizationObjectId }),
    Employee.countDocuments({ organizationId: organizationObjectId, status: "active" }),
    Employee.countDocuments({ organizationId: organizationObjectId, status: "inactive" }),
    Employee.countDocuments({ organizationId: organizationObjectId, status: "on_leave" }),
    Employee.aggregate([
      { $match: { organizationId: organizationObjectId } },
      {
        $group: {
          _id: { $ifNull: ["$department", "Unassigned"] },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, department: "$_id", count: 1 } },
      { $sort: { department: 1 } },
    ]),
    Attendance.aggregate([
      { $match: attendanceMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
      { $sort: { status: 1 } },
    ]),
    Attendance.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: { $substrBytes: ["$attendanceDate", 0, 7] },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, month: "$_id", count: 1 } },
      { $sort: { month: 1 } },
    ]),
    Leave.aggregate([
      { $match: leaveMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
      { $sort: { status: 1 } },
    ]),
    Leave.aggregate([
      { $match: { ...leaveMatch, reviewedAt: { $exists: true } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, status: "$_id", count: 1 } },
      { $sort: { status: 1 } },
    ]),
    Employee.aggregate([
      { $match: joiningMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$dateOfJoining" } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, month: "$_id", count: 1 } },
      { $sort: { month: 1 } },
    ]),
  ]);

  const attendanceTotal = attendanceByStatus.reduce(
    (total, entry: { count: number }) => total + entry.count,
    0,
  );
  const leaveTotal = leavesByStatus.reduce(
    (total, entry: { count: number }) => total + entry.count,
    0,
  );

  return {
    range: { from: range.from, to: range.to },
    employees: {
      total: employeeTotal,
      active: activeEmployees,
      inactive: inactiveEmployees,
      onLeave: employeesOnLeave,
    },
    departments: departmentCounts,
    attendance: {
      total: attendanceTotal,
      byStatus: attendanceByStatus,
      monthly: monthlyAttendance,
    },
    leaves: {
      total: leaveTotal,
      byStatus: leavesByStatus,
      approvals: leaveApprovals,
    },
    joiningTrends,
  };
}
