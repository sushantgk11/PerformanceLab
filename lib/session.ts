import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

export const firebaseEnabled = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
);
const secret = () => {
  if (firebaseEnabled && !process.env.SESSION_SECRET)
    throw new Error("SESSION_SECRET is required when Firebase is configured.");
  return process.env.SESSION_SECRET || "performance-lab-local-demo-session";
};
export function signSession(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({ ...user, expires: Date.now() + 86400000 }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}
export async function getSession(): Promise<SessionUser | null> {
  const cookie = (await cookies()).get("lab-session")?.value;
  if (!cookie) return null;
  try {
    const [payload, signature] = cookie.split(".");
    const expected = createHmac("sha256", secret())
      .update(payload)
      .digest("base64url");
    if (
      !signature ||
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return null;
    const user = JSON.parse(Buffer.from(payload, "base64url").toString());
    return user.expires > Date.now()
      ? { id: user.id, name: user.name, email: user.email, mode: user.mode }
      : null;
  } catch {
    return null;
  }
}
