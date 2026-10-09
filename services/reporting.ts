import type { Order, Product, User } from "@/types";
export const reportingEnd = "2026-10-08";
export function selectPeriod(orders: Order[], start: string, end: string) {
  const from = Date.parse(`${start}T00:00:00.000Z`);
  const until = Date.parse(`${end}T23:59:59.999Z`);
  return orders.filter(
    (order) =>
      Date.parse(order.date) >= from && Date.parse(order.date) <= until,
  );
}
export function periodStart(days: number) {
  return new Date(
    Date.parse(`${reportingEnd}T00:00:00Z`) - (days - 1) * 86400000,
  )
    .toISOString()
    .slice(0, 10);
}
export function report(
  orders: Order[],
  users: User[],
  products: Product[],
  start: string,
  end: string,
) {
  const period = selectPeriod(orders, start, end);
  const paid = period.filter((order) => order.status !== "Cancelled");
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const daily = Array.from(
    {
      length: Math.max(
        1,
        Math.min(
          366,
          Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1,
        ),
      ),
    },
    (_, i) => {
      const day = new Date(Date.parse(start) + i * 86400000)
        .toISOString()
        .slice(0, 10);
      return {
        name: day.slice(5),
        revenue: Math.round(
          paid
            .filter((order) => order.date.startsWith(day))
            .reduce((sum, order) => sum + order.total, 0),
        ),
        users: users.filter((user) => user.joined.startsWith(day)).length,
        orders: period.filter((order) => order.date.startsWith(day)).length,
      };
    },
  );
  const productStats = products
    .map((product) => {
      const matches = paid.filter((order) => order.productId === product.id);
      return {
        ...product,
        revenue: matches.reduce((sum, order) => sum + order.total, 0),
        sold: matches.reduce((sum, order) => sum + order.quantity, 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
  const categoryStats = [...new Set(products.map((p) => p.category))].map(
    (category) => ({
      name: category,
      value: productStats
        .filter((p) => p.category === category)
        .reduce((sum, p) => sum + p.revenue, 0),
    }),
  );
  const countries = [...new Set(paid.map((order) => order.country))]
    .map((country) => ({
      name: country,
      value: paid
        .filter((order) => order.country === country)
        .reduce((sum, order) => sum + order.total, 0),
    }))
    .sort((a, b) => b.value - a.value);
  return {
    period,
    revenue,
    daily,
    productStats,
    categoryStats,
    countries,
    aov: paid.length ? revenue / paid.length : 0,
    customers: new Set(paid.map((order) => order.userId)).size,
    newUsers: users.filter(
      (user) =>
        user.joined.slice(0, 10) >= start && user.joined.slice(0, 10) <= end,
    ).length,
  };
}
