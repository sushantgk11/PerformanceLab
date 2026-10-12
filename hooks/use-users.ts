"use client";
import { useQuery } from "@tanstack/react-query";
import { getUsersPage } from "@/services/api";
import type { UserDirectoryRequest } from "@/types";

export function useUsers(options: UserDirectoryRequest) {
  return useQuery({
    queryKey: ["users-directory", options],
    queryFn: ({ signal }) => getUsersPage(options, signal),
  });
}
