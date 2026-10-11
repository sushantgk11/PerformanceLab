"use client";
import { useState } from "react";
import {
  ArrowDownToLine,
  DollarSign,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/services/api";
import { periodStart, report, reportingEnd } from "@/services/reporting";
import { ErrorState, Loading, PageHeading, StatCard } from "@/components/ui";
import {
  CategoryChart,
  CountryChart,
  GrowthChart,
  RevenueChart,
} from "@/components/charts";
import { exportCsv, money, number } from "@/utils/format";
import { useNotifications, useSettings } from "@/providers";
export function AnalyticsPage() {
  const { settings } = useSettings();
  const notify = useNotifications();
  const [start, setStart] = useState(
    periodStart(Number(settings.defaultRange)),
  );
  const [end, setEnd] = useState(reportingEnd);
  const [tab, setTab] = useState("Revenue");
  const result = useQuery({
    queryKey: ["analytics", start, end],
    queryFn: async () => {
      const users = await getData("users");
      const orders = await getData("orders");
      const products = await getData("products");
      return { users, orders, products };
    },
  });
  if (result.isPending) return <Loading label="Preparing your analytics..." />;
  if (result.error)
    return <ErrorState error={result.error} retry={() => result.refetch()} />;
  const stats = report(
    result.data.orders,
    result.data.users,
    result.data.products,
    start,
    end,
  );
  return (
    <>
      <PageHeading
        eyebrow="BUSINESS INTELLIGENCE"
        title="Analytics"
        description="Go beyond the numbers. Find your next opportunity."
      >
        <button
          className="button"
          onClick={() => {
            exportCsv("analytics", stats.daily);
            notify("Analytics report exported.");
          }}
        >
          <ArrowDownToLine size={16} />
          Export report
        </button>
      </PageHeading>
      <div className="analytics-toolbar">
        <div
          className="segmented-control"
          role="tablist"
          aria-label="Analytics view"
        >
          {["Revenue", "Customers", "Products"].map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "selected" : ""}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="date-range">
          <label>
            From
            <input
              type="date"
              value={start}
              min="2025-10-09"
              max={end}
              onChange={(e) => {
                if (e.target.value && e.target.value <= end)
                  setStart(e.target.value);
              }}
            />
          </label>
          <span>—</span>
          <label>
            To
            <input
              type="date"
              value={end}
              min={start}
              max={reportingEnd}
              onChange={(e) => {
                if (
                  e.target.value &&
                  e.target.value >= start &&
                  e.target.value <= reportingEnd
                )
                  setEnd(e.target.value);
              }}
            />
          </label>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Revenue"
          value={money(stats.revenue)}
          detail="Non-cancelled orders"
          icon={<DollarSign size={18} />}
        />
        <StatCard
          label="Customers purchasing"
          value={number(stats.customers)}
          detail="Unique customers this period"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Orders"
          value={number(stats.period.length)}
          detail="Across all order statuses"
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="Average order value"
          value={money(stats.aov)}
          detail="Non-cancelled orders"
          icon={<Wallet size={18} />}
        />
      </div>
      {tab === "Revenue" && (
        <>
          <section className="panel analytics-main">
            <div className="panel-heading">
              <div>
                <h2>Revenue over time</h2>
                <p>Daily revenue across your entire catalog</p>
              </div>
              <span className="legend-dot">Revenue</span>
            </div>
            <RevenueChart data={stats.daily} />
          </section>
          <div className="equal-grid">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Revenue by category</h2>
                  <p>Where your business is growing</p>
                </div>
              </div>
              <CategoryChart data={stats.categoryStats} />
            </section>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Revenue by region</h2>
                  <p>Your customers around the world</p>
                </div>
              </div>
              <CountryChart data={stats.countries} />
            </section>
          </div>
        </>
      )}
      {tab === "Customers" && (
        <>
          <section className="panel analytics-main">
            <div className="panel-heading">
              <div>
                <h2>Customer acquisition</h2>
                <p>{number(stats.newUsers)} new customers joined this period</p>
              </div>
            </div>
            <GrowthChart data={stats.daily} />
          </section>
          <div className="equal-grid">
            <section className="panel">
              <div className="panel-heading">
                <h2>Customer status</h2>
              </div>
              <CategoryChart
                currency={false}
                data={["Active", "Invited", "Inactive"].map((status) => ({
                  name: status,
                  value: result.data.users.filter((u) => u.status === status)
                    .length,
                }))}
              />
            </section>
            <section className="panel insight-card">
              <span className="eyebrow">CUSTOMER SNAPSHOT</span>
              <h2>
                {number(result.data.users.length)} people.
                <br />
                One connected business.
              </h2>
              <p>
                {number(stats.customers)} customers placed an order during the
                selected period, with{" "}
                {money(stats.customers ? stats.revenue / stats.customers : 0)}{" "}
                in average revenue per purchasing customer.
              </p>
              <small>
                Customer status reflects the entire workspace directory.
              </small>
            </section>
          </div>
        </>
      )}
      {tab === "Products" && (
        <>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Product performance</h2>
                <p>Top 20 products by revenue for the selected dates</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units sold</th>
                    <th>Revenue</th>
                    <th>Available stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.productStats.slice(0, 20).map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="person-cell">
                          <img
                            src={product.image}
                            alt=""
                            width={36}
                            height={36}
                          />
                          <strong>{product.name}</strong>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>{number(product.sold)}</td>
                      <td className="amount">{money(product.revenue)}</td>
                      <td>{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel mt-6">
            <div className="panel-heading">
              <h2>Category contribution</h2>
            </div>
            <CategoryChart data={stats.categoryStats} />
          </section>
        </>
      )}
    </>
  );
}
