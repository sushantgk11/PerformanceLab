import { OrdersPage } from "@/features/orders";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <OrdersPage initialOrder={order} />;
}
