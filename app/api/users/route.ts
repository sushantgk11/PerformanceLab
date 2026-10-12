import { NextRequest, NextResponse } from "next/server";
import { database } from "@/data/generate";
import { getSession } from "@/lib/session";
import { parseUserDirectoryParams, queryUserDirectory } from "@/services/users";

export async function GET(request: NextRequest) {
  if (!(await getSession()))
    return NextResponse.json(
      { error: "Your session expired. Sign in to continue." },
      { status: 401 },
    );
  let options;
  try {
    options = parseUserDirectoryParams(request.nextUrl.searchParams);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid query." },
      { status: 400 },
    );
  }
  await new Promise((resolve) => setTimeout(resolve, 260));
  const { result, matches } = queryUserDirectory(database.users, options);
  return NextResponse.json(
    request.nextUrl.searchParams.get("export") === "true" ? matches : result,
    { headers: { "Cache-Control": "no-store" } },
  );
}
