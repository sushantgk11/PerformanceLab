import type { Metadata } from "next";
import { Providers } from "@/providers";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Performance Lab", template: "%s · Performance Lab" },
  description:
    "Your workspace for business intelligence, customers, and commerce.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
