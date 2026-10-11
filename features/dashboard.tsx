"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  DollarSign,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useResource } from "@/hooks/use-resource";
import { getData } from "@/services/api";
import { periodStart, report, reportingEnd } from "@/services/reporting";
import {
  Badge,
  ErrorState,
  Loading,
  PageHeading,
  Pagination,
  Select,
  StatCard,
} from "@/components/ui";
import { GrowthChart, RevenueChart } from "@/components/charts";
import { date, exportCsv, money, number } from "@/utils/format";
import { useNotifications, useSettings } from "@/providers";
export function Dashboard() {
  const { settings } = useSettings();
  const notify = useNotifications();
  const [range, setRange] = useState(settings.defaultRange);
  const [page, setPage] = useState(1);
  const result = useQuery({
    queryKey: ["overview", range],
    queryFn: async () => {
      const orders = await getData("orders");
      const users = await getData("users");
      const products = await getData("products");
      return { orders, users, products };
    },
    refetchInterval: 60000,
  });
  const activity = useResource("activities", "", "overview-activity");
  if (result.isPending) return <Loading />;
  if (result.error)
    return <ErrorState error={result.error} retry={() => result.refetch()} />;
  const { orders, users, products } = result.data;
  const stats = report(
    orders,
    users,
    products,
    periodStart(Number(range)),
    reportingEnd,
  );
  const recent = [...stats.period].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeading
        title="Overview"
        description="A little perspective on how your business is doing."
      >
        <div className="date-select">
          <CalendarDays size={16} />
          <Select
            label="Dashboard date range"
            value={range}
            onChange={(value) => {
              setRange(value);
              setPage(1);
            }}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
            ]}
          />
        </div>
        <button
          className="button"
          onClick={() => {
            exportCsv("workspace-report", stats.daily);
            notify("Report exported.");
          }}
        >
          <ArrowDownToLine size={16} />
          Export report
        </button>
      </PageHeading>
      <div className="welcome-banner">
        <div>
          <span className="welcome-dot" />
          YOUR BUSINESS AT A GLANCE
          <span className="welcome-period">
            {date(periodStart(Number(range)))} – {date(reportingEnd)}
          </span>
        </div>
        <Link href="/analytics">
          View insights <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Total revenue"
          value={money(stats.revenue)}
          detail="Across non-cancelled orders"
          icon={<DollarSign size={18} />}
        />
        <StatCard
          label="Total orders"
          value={number(stats.period.length)}
          detail="Orders in this period"
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="New customers"
          value={number(stats.newUsers)}
          detail="Joined in this period"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Average order value"
          value={money(stats.aov)}
          detail="Across non-cancelled orders"
          icon={<Wallet size={18} />}
        />
      </div>
      <div className="dashboard-charts">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue overview</h2>
              <p>How your revenue is trending over time</p>
            </div>
            <span className="legend-dot">Revenue</span>
          </div>
          <div className="chart-summary">
            {money(stats.revenue)}
            <span>Total this period</span>
          </div>
          <RevenueChart data={stats.daily} />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Customer growth</h2>
              <p>New connections, every day</p>
            </div>
            <Users size={17} className="muted" />
          </div>
          <div className="chart-summary">
            {number(stats.newUsers)}
            <span>New customers</span>
          </div>
          <GrowthChart data={stats.daily} />
        </section>
      </div>
      <div className="dashboard-secondary">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Top products</h2>
              <p>Your best performers this period</p>
            </div>
            <Link className="text-link" href="/products">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="top-product-list">
            {stats.productStats.slice(0, 5).map((p, i) => (
              <div key={p.id} className="top-product">
                <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                <img src={p.image} alt={p.name} width={42} height={42} />
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.category}</small>
                </div>
                <div className="product-revenue">
                  <strong>{money(p.revenue)}</strong>
                  <small>{p.sold} units sold</small>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>The latest from your workspace</p>
            </div>
            <Link className="text-link" href="/activity">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {activity.isPending ? (
            <p className="p-5 muted">Loading activity...</p>
          ) : activity.error ? (
            <ErrorState
              error={activity.error}
              retry={() => activity.refetch()}
            />
          ) : (
            <div className="mini-activity">
              {activity.data.slice(0, 5).map((a, i) => (
                <div key={a.id}>
                  <span className={`event-icon event-${a.kind}`}>
                    {a.kind === "user" ? (
                      <Users size={15} />
                    ) : (
                      <ShoppingBag size={15} />
                    )}
                  </span>
                  <div>
                    <p>
                      <strong>{a.name}</strong> {a.action}
                    </p>
                    <small>{a.detail}</small>
                  </div>
                  <time>{i === 0 ? "Just now" : `${i * 15}m ago`}</time>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <section className="panel recent-orders">
        <div className="panel-heading">
          <div>
            <h2>Recent orders</h2>
            <p>A snapshot of your latest transactions</p>
          </div>
          <Link className="button" href="/orders">
            View all orders
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.slice((page - 1) * 5, page * 5).map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      className="text-link"
                      href={`/orders?order=${order.id}`}
                    >
                      #{order.id.slice(4)}
                    </Link>
                  </td>
                  <td>
                    <strong>{order.customer}</strong>
                    <small>{order.email}</small>
                  </td>
                  <td>{order.product}</td>
                  <td>{date(order.date)}</td>
                  <td className="amount">{money(order.total)}</td>
                  <td>
                    <Badge>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={recent.length}
          size={5}
          onChange={setPage}
        />
      </section>
    </>
  );
}
