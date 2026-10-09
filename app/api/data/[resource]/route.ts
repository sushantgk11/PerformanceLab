import { NextRequest, NextResponse } from "next/server";
import { database } from "@/data/generate";
import { getSession } from "@/lib/session";
import type { Resource } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  if (!(await getSession()))
    return NextResponse.json(
      { error: "Your session expired. Sign in to continue." },
      { status: 401 },
    );
  const { resource } = await params;
  if (!Object.prototype.hasOwnProperty.call(database, resource))
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  await new Promise((resolve) =>
    setTimeout(resolve, resource === "orders" ? 480 : 260),
  );
  const query = request.nextUrl.searchParams.get("q")?.toLowerCase() || "";
  const data = database[resource as Resource];
  return NextResponse.json(
    query
      ? data.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(query),
        )
      : data,
    { headers: { "Cache-Control": "no-store" } },
  );
}
