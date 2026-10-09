import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Shell } from "@/components/shell";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  return <Shell user={user}>{children}</Shell>;
}
