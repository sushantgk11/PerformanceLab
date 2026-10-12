import type {
  Dataset,
  Resource,
  User,
  UserDirectoryFilters,
  UserDirectoryRequest,
  UserDirectoryPage,
} from "@/types";
export async function getData<K extends Resource>(
  resource: K,
  query = "",
  signal?: AbortSignal,
): Promise<Dataset[K]> {
  const response = await fetch(
    `/api/data/${resource}?q=${encodeURIComponent(query)}`,
    { cache: "no-store", signal },
  );
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || "Unable to load data. Please try again.");
  }
  return response.json();
}

function userDirectoryParams(filters: UserDirectoryFilters) {
  return new URLSearchParams({
    q: filters.query,
    status: filters.status,
    role: filters.role,
    sort: filters.sort,
  });
}
async function fetchUserDirectory<T>(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/users?${params}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || "Unable to load users. Please try again.");
  }
  return response.json();
}
export function getUsersPage(
  options: UserDirectoryRequest,
  signal?: AbortSignal,
): Promise<UserDirectoryPage> {
  const params = userDirectoryParams(options);
  params.set("page", String(options.page));
  params.set("pageSize", String(options.pageSize));
  return fetchUserDirectory<UserDirectoryPage>(params, signal);
}
export function getUsersForExport(
  filters: UserDirectoryFilters,
): Promise<User[]> {
  const params = userDirectoryParams(filters);
  params.set("export", "true");
  return fetchUserDirectory<User[]>(params);
}
