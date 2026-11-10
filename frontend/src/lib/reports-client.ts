const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

export type OrganizationReport = {
  range: { from: string; to: string };
  employees: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
  };
  departments: { department: string; count: number }[];
  attendance: {
    total: number;
    byStatus: { status: string; count: number }[];
    monthly: { month: string; count: number }[];
  };
  leaves: {
    total: number;
    byStatus: { status: string; count: number }[];
    approvals: { status: string; count: number }[];
  };
  joiningTrends: { month: string; count: number }[];
};

export async function getOrganizationReport(
  token: string,
  range: { from?: string; to?: string } = {},
): Promise<OrganizationReport> {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  const query = params.toString();
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/reports/summary${query ? `?${query}` : ""}`,
      { headers: { Authorization: "Bearer " + token } },
    );
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
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : "Unable to load HR reports.";
    throw new Error(message);
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The server returned an invalid HR report.");
  }
  return payload.data as OrganizationReport;
}
