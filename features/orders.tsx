"use client";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpRight, ShoppingBag, X } from "lucide-react";
import { useResource } from "@/hooks/use-resource";
import { useNotifications, useSettings } from "@/providers";
import {
  clearSelection,
  toggleOrder,
  useAppDispatch,
  useAppSelector,
} from "@/store";
import {
  Badge,
  EmptyState,
  ErrorState,
  Loading,
  Modal,
  PageHeading,
  SearchBox,
  Select,
} from "@/components/ui";
import { date, exportCsv, money, number } from "@/utils/format";
import type { Order } from "@/types";
export function OrdersPage({ initialOrder = "" }: { initialOrder?: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Order | null>(null);
  const [initialOpen, setInitialOpen] = useState(Boolean(initialOrder));
  const { settings } = useSettings();
  const notify = useNotifications();
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector((s) => s.workspace.selectedOrders);
  const result = useResource("orders", query);
  const rows = (result.data || [])
    .filter((order) => status === "All" || order.status === status)
    .sort((a, b) =>
      sort === "total"
        ? b.total - a.total
        : sort === "oldest"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date),
    );
  const detail =
    selected ||
    (initialOpen ? result.data?.find((o) => o.id === initialOrder) : null);
  return (
    <>
      <PageHeading
        eyebrow="COMMERCE"
        title="Orders"
        description="From first checkout to final delivery. Every order, connected."
      >
        <button
          className="button"
          disabled={!rows.length}
          onClick={() => {
            exportCsv(
              "orders",
              selectedIds.length
                ? (result.data || []).filter((o) => selectedIds.includes(o.id))
                : rows,
            );
            notify("Orders exported.");
          }}
        >
          <ArrowDownToLine size={16} />
          Export {selectedIds.length ? "selected" : "orders"}
        </button>
      </PageHeading>
      <div className="directory-summary">
        <span className="summary-symbol">
          <ShoppingBag size={22} />
        </span>
        <div>
          <strong>{number(result.data?.length || 0)}</strong>
          <span>total orders</span>
        </div>
        <div className="summary-separator" />
        <span>
          <i className="green-dot" />
          {number(
            (result.data || []).filter((o) => o.status === "Completed").length,
          )}{" "}
          completed
        </span>
        <span className="muted">A complete view of your transactions</span>
      </div>
      <section className="panel">
        <div className="filter-bar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search order, customer, or product..."
          />
          <div className="filter-options">
            <Select
              label="Order status"
              value={status}
              onChange={setStatus}
              options={[
                "All",
                "Completed",
                "Processing",
                "Shipped",
                "Cancelled",
              ].map((value) => ({
                value,
                label: value === "All" ? "All statuses" : value,
              }))}
            />
            <Select
              label="Sort orders"
              value={sort}
              onChange={setSort}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "total", label: "Highest value" },
              ]}
            />
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="selection-bar">
            {selectedIds.length} orders selected
            <button onClick={() => dispatch(clearSelection())}>
              Clear selection
              <X size={14} />
            </button>
          </div>
        )}
        {result.isPending ? (
          <Loading label="Loading orders..." />
        ) : result.error ? (
          <ErrorState error={result.error} retry={() => result.refetch()} />
        ) : !rows.length ? (
          <EmptyState />
        ) : (
          <>
            <div className="result-caption">
              {number(rows.length)} orders<span>All transactions · USD</span>
            </div>
            <div
              className="table-scroll directory-table"
              data-density={settings.density}
            >
              <table>
                <thead>
                  <tr>
                    <th>
                      <span className="sr-only">Select</span>
                    </th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => (
                    <tr
                      key={order.id}
                      className={
                        selectedIds.includes(order.id) ? "selected-row" : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${order.id}`}
                          checked={selectedIds.includes(order.id)}
                          onChange={() => dispatch(toggleOrder(order.id))}
                        />
                      </td>
                      <td>
                        <button
                          className="name-button teal"
                          onClick={() => setSelected(order)}
                        >
                          #{order.id.slice(4)}
                        </button>
                      </td>
                      <td>
                        <strong>{order.customer}</strong>
                        <small>{order.email}</small>
                      </td>
                      <td>
                        {order.product}
                        <small>
                          {order.quantity}{" "}
                          {order.quantity === 1 ? "item" : "items"}
                        </small>
                      </td>
                      <td>{date(order.date)}</td>
                      <td className="amount">{money(order.total)}</td>
                      <td>
                        <Badge>{order.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`View ${order.id}`}
                          onClick={() => setSelected(order)}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-bottom">
              {number(rows.length)} orders in this view
            </div>
          </>
        )}
      </section>
      {detail && (
        <Modal
          title={`Order #${detail.id.slice(4)}`}
          onClose={() => {
            setSelected(null);
            setInitialOpen(false);
          }}
        >
          <div className="order-detail-heading">
            <div>
              <div className="eyebrow">ORDER TOTAL</div>
              <h3>{money(detail.total)}</h3>
            </div>
            <Badge>{detail.status}</Badge>
          </div>
          <dl className="detail-grid">
            <div>
              <dt>Customer</dt>
              <dd>{detail.customer}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{detail.email}</dd>
            </div>
            <div>
              <dt>Placed on</dt>
              <dd>{date(detail.date)}</dd>
            </div>
            <div>
              <dt>Destination</dt>
              <dd>{detail.country}</dd>
            </div>
          </dl>
          <div className="order-line-item">
            <div>
              <strong>{detail.product}</strong>
              <small>
                {detail.productId} · Quantity {detail.quantity}
              </small>
            </div>
            <strong>{money(detail.total)}</strong>
          </div>
          <p className="detail-description">
            Order totals are in USD. This workspace uses a sample transaction
            ledger.
          </p>
        </Modal>
      )}
    </>
  );
}
