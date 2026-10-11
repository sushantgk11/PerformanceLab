"use client";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/services/api";
import type { Resource } from "@/types";
export function useResource<K extends Resource>(
  resource: K,
  query = "",
  scope = "directory",
) {
  return useQuery({
    queryKey: [scope, resource, query],
    queryFn: ({ signal }) => getData(resource, query, signal),
  });
}
