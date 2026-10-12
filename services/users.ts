import type { User, UserDirectoryRequest, UserDirectoryPage } from "@/types";

export function parseUserDirectoryParams(
  params: URLSearchParams,
): UserDirectoryRequest {
  const query = params.get("q") || "";
  const status = params.get("status") || "All";
  const role = params.get("role") || "All";
  const sort = params.get("sort") || "name";
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 100);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    throw new Error(
      "Page must be a positive integer; pageSize must be between 1 and 100.",
    );
  }
  if (
    !["All", "Active", "Invited", "Inactive"].includes(status) ||
    !["All", "Admin", "Member", "Viewer"].includes(role) ||
    !["name", "joined", "spent"].includes(sort)
  ) {
    throw new Error("Invalid user filter or sort order.");
  }
  return { query, status, role, sort, page, pageSize };
}

export function queryUserDirectory(
  users: User[],
  options: UserDirectoryRequest,
) {
  const query = options.query.toLowerCase();
  const searched = query
    ? users.filter((user) => JSON.stringify(user).toLowerCase().includes(query))
    : users;
  const matches = searched.filter(
    (user) =>
      (options.status === "All" || user.status === options.status) &&
      (options.role === "All" || user.role === options.role),
  );
  matches.sort((a, b) => {
    const comparison =
      options.sort === "spent"
        ? b.spent - a.spent
        : options.sort === "joined"
          ? b.joined.localeCompare(a.joined)
          : a.name.localeCompare(b.name);
    return comparison || a.id.localeCompare(b.id);
  });
  const page = Math.min(
    options.page,
    Math.max(1, Math.ceil(matches.length / options.pageSize)),
  );
  const result: UserDirectoryPage = {
    users: matches.slice(
      (page - 1) * options.pageSize,
      page * options.pageSize,
    ),
    total: matches.length,
    matchedTotal: searched.length,
    activeCount: searched.filter((user) => user.status === "Active").length,
    page,
    pageSize: options.pageSize,
  };
  return { result, matches };
}
