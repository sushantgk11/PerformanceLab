import type { Activity } from "@/types";
export function subscribeToActivity(onEvent: (event: Activity) => void) {
  let count = 0;
  const timer = setInterval(() => {
    count += 1;
    onEvent({
      id: `LIVE-${Date.now()}-${count}`,
      name: ["Olivia Bennett", "Liam Chen", "Priya Patel", "James Morgan"][
        count % 4
      ],
      action: [
        "placed an order",
        "joined the workspace",
        "updated a product",
        "completed a payment",
      ][count % 4],
      kind: (["order", "user", "product", "system"] as const)[count % 4],
      detail: [
        "New checkout received",
        "Workspace invitation accepted",
        "Inventory updated",
        "Payment received",
      ][count % 4],
      date: new Date().toISOString(),
    });
  }, 8000);
  return () => clearInterval(timer);
}
