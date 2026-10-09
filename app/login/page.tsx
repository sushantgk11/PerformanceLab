import { redirect } from "next/navigation";
import { firebaseEnabled, getSession } from "@/lib/session";
import { LoginForm } from "@/features/login";
export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  return <LoginForm firebaseEnabled={firebaseEnabled} />;
}
