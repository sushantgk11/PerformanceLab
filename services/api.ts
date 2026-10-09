import type { Dataset, Resource } from "@/types";
export async function getData<K extends Resource>(
  resource: K,
  query = "",
): Promise<Dataset[K]> {
  const response = await fetch(
    `/api/data/${resource}?q=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || "Unable to load data. Please try again.");
  }
  return response.json();
}
