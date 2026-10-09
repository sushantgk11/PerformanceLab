import { NextRequest, NextResponse } from "next/server";
import { firebaseEnabled, getSession, signSession } from "@/lib/session";
import type { SessionUser } from "@/types";

export async function GET() {
  return NextResponse.json({ user: await getSession() });
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const body = await request.json();
    let user: SessionUser;
    if (firebaseEnabled) {
      const result = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: body.idToken }),
          cache: "no-store",
        },
      );
      const payload = await result.json();
      if (!result.ok || !payload.users?.[0])
        return NextResponse.json(
          {
            error: "Your session could not be verified. Please sign in again.",
          },
          { status: 401 },
        );
      const account = payload.users[0];
      user = {
        id: account.localId,
        name: account.displayName || account.email.split("@")[0],
        email: account.email,
        mode: "firebase",
      };
    } else {
      if (
        body.email !== "alex@performancelab.dev" ||
        body.password !== "demo1234"
      )
        return NextResponse.json(
          { error: "Use the demo email and password shown below." },
          { status: 401 },
        );
      user = {
        id: "demo-alex",
        name: "Alex Morgan",
        email: body.email,
        mode: "demo",
      };
    }
    const response = NextResponse.json({ user });
    response.cookies.set("lab-session", signSession(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      maxAge: 86400,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      {
        error: "Unable to start your session. Check the server configuration.",
      },
      { status: 500 },
    );
  }
}
export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("lab-session", "", { maxAge: 0, path: "/" });
  return response;
}
