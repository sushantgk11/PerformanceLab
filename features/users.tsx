"use client";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Mail,
  MapPin,
  Users as UsersIcon,
} from "lucide-react";
import { useResource } from "@/hooks/use-resource";
import { useSettings } from "@/providers";
import { setSearch, useAppDispatch, useAppSelector } from "@/store";
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
import type { User } from "@/types";
export function UsersPage() {
  const query = useAppSelector((s) => s.workspace.search);
  const dispatch = useAppDispatch();
  const { settings, notify } = useSettings();
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All");
  const [sort, setSort] = useState("name");
  const [selected, setSelected] = useState<User | null>(null);
  const result = useResource("users", query);
  const rows = (result.data || [])
    .filter(
      (user) =>
        (status === "All" || user.status === status) &&
        (role === "All" || user.role === role),
    )
    .sort((a, b) =>
      sort === "spent"
        ? b.spent - a.spent
        : sort === "joined"
          ? b.joined.localeCompare(a.joined)
          : a.name.localeCompare(b.name),
    );
  return (
    <>
      <PageHeading
        eyebrow="CUSTOMER RELATIONSHIPS"
        title="Users"
        description="The people behind your growth. All in one place."
      >
        <button
          className="button"
          disabled={!rows.length}
          onClick={() => {
            exportCsv("users", rows);
            notify("User directory exported.");
          }}
        >
          <ArrowDownToLine size={16} />
          Export users
        </button>
      </PageHeading>
      <div className="directory-summary">
        <span className="summary-symbol">
          <UsersIcon size={22} />
        </span>
        <div>
          <strong>{number(result.data?.length || 0)}</strong>
          <span>workspace users</span>
        </div>
        <div className="summary-separator" />
        <span>
          <i className="green-dot" />
          {number(
            (result.data || []).filter((u) => u.status === "Active").length,
          )}{" "}
          active
        </span>
        <span className="muted">Connected across 8 countries</span>
      </div>
      <section className="panel">
        <div className="filter-bar">
          <SearchBox
            value={query}
            onChange={(value) => dispatch(setSearch(value))}
            placeholder="Search name, email, or company..."
          />
          <div className="filter-options">
            <Select
              label="User status"
              value={status}
              onChange={setStatus}
              options={["All", "Active", "Invited", "Inactive"].map(
                (value) => ({
                  value,
                  label: value === "All" ? "All statuses" : value,
                }),
              )}
            />
            <Select
              label="User role"
              value={role}
              onChange={setRole}
              options={["All", "Admin", "Member", "Viewer"].map((value) => ({
                value,
                label: value === "All" ? "All roles" : value,
              }))}
            />
            <Select
              label="Sort users"
              value={sort}
              onChange={setSort}
              options={[
                { value: "name", label: "Name A–Z" },
                { value: "joined", label: "Recently joined" },
                { value: "spent", label: "Highest spend" },
              ]}
            />
          </div>
        </div>
        {result.isPending ? (
          <Loading label="Loading users..." />
        ) : result.error ? (
          <ErrorState error={result.error} retry={() => result.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="result-caption">
              {number(rows.length)} users <span>Workspace directory</span>
            </div>
            <div
              className="table-scroll directory-table"
              data-density={settings.density}
            >
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Total spend</th>
                    <th>
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="person-cell">
                          <img
                            src={user.avatar}
                            alt=""
                            width={34}
                            height={34}
                          />
                          <div>
                            <button
                              className="name-button"
                              onClick={() => setSelected(user)}
                            >
                              {user.name}
                            </button>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.company}
                        <small>{user.country}</small>
                      </td>
                      <td>
                        <span className="role-label">{user.role}</span>
                      </td>
                      <td>
                        <Badge>{user.status}</Badge>
                      </td>
                      <td>{date(user.joined)}</td>
                      <td className="amount">{money(user.spent)}</td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`View ${user.name}`}
                          onClick={() => setSelected(user)}
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
              {number(rows.length)} users in this view
            </div>
          </>
        )}
      </section>
      {selected && (
        <Modal title="User details" onClose={() => setSelected(null)}>
          <div className="detail-person">
            <img
              src={selected.avatar}
              alt={selected.name}
              width={72}
              height={72}
            />
            <h3>{selected.name}</h3>
            <Badge>{selected.status}</Badge>
          </div>
          <div className="detail-contact">
            <p>
              <Mail size={16} />
              {selected.email}
            </p>
            <p>
              <MapPin size={16} />
              {selected.country}
            </p>
          </div>
          <dl className="detail-grid">
            <div>
              <dt>Company</dt>
              <dd>{selected.company}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{selected.role}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{date(selected.joined)}</dd>
            </div>
            <div>
              <dt>Total spend</dt>
              <dd>{money(selected.spent)}</dd>
            </div>
            <div>
              <dt>User ID</dt>
              <dd>{selected.id}</dd>
            </div>
          </dl>
        </Modal>
      )}
    </>
  );
}
