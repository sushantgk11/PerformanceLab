"use client";
import { useEffect, useState } from "react";
import {
  Activity as ActivityIcon,
  ArrowDownToLine,
  Box,
  Pause,
  Play,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToActivity } from "@/services/activity";
import { useResource } from "@/hooks/use-resource";
import { useSettings } from "@/providers";
import {
  EmptyState,
  ErrorState,
  Loading,
  PageHeading,
  SearchBox,
  Select,
} from "@/components/ui";
import { date, exportCsv, number } from "@/utils/format";
import type { Activity } from "@/types";
const icons = { order: ShoppingBag, user: Users, product: Box, system: Wallet };
export function ActivityPage() {
  const result = useResource("activities", "", "feed");
  const client = useQueryClient();
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [received, setReceived] = useState(0);
  const { settings, notify } = useSettings();
  useEffect(() => {
    if (paused || !result.isSuccess) return;
    return subscribeToActivity((event) => {
      client.setQueryData<Activity[]>(
        ["feed", "activities", ""],
        (previous) => [event, ...(previous || [])],
      );
      setReceived((count) => count + 1);
    });
  }, [paused, result.isSuccess, client]);
  const rows = (result.data || []).filter(
    (event) =>
      (kind === "all" || event.kind === kind) &&
      `${event.name} ${event.action} ${event.detail}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE PULSE"
        title="Activity feed"
        description="Stay close to what’s happening across your business."
      >
        <button
          className="button"
          disabled={!rows.length}
          onClick={() => {
            exportCsv("activity", rows);
            notify("Activity log exported.");
          }}
        >
          <ArrowDownToLine size={16} />
          Export log
        </button>
        <button className="button" onClick={() => setPaused(!paused)}>
          {paused ? <Play size={15} /> : <Pause size={15} />}
          {paused ? "Resume updates" : "Pause updates"}
        </button>
      </PageHeading>
      <div className="feed-status">
        <div>
          <span className={paused ? "paused-dot" : "green-dot"} />
          <strong>
            {paused ? "Updates paused" : "Live updates connected"}
          </strong>
          <span>New events arrive throughout the day</span>
        </div>
        {settings.liveNotifications && (
          <span>
            {received} new {received === 1 ? "event" : "events"} this session
          </span>
        )}
      </div>
      <section className="panel">
        <div className="filter-bar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search activity..."
          />
          <Select
            label="Activity type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "All events" },
              { value: "order", label: "Orders" },
              { value: "user", label: "Users" },
              { value: "product", label: "Products" },
              { value: "system", label: "Payments" },
            ]}
          />
        </div>
        <div className="result-caption">
          <span>
            <ActivityIcon size={14} />
            {number(rows.length)} workspace events
          </span>
          <span>Activity log</span>
        </div>
        {result.isPending ? (
          <Loading label="Connecting to activity..." />
        ) : result.error ? (
          <ErrorState error={result.error} retry={() => result.refetch()} />
        ) : !rows.length ? (
          <EmptyState />
        ) : (
          <div className="activity-list">
            {rows.map((event) => {
              const Icon = icons[event.kind];
              return (
                <article key={event.id} className="activity-row">
                  <span className={`event-icon event-${event.kind}`}>
                    <Icon size={17} />
                  </span>
                  <div>
                    <p>
                      <strong>{event.name}</strong> {event.action}
                    </p>
                    <small>{event.detail}</small>
                  </div>
                  <span className="activity-kind">{event.kind}</span>
                  <time dateTime={event.date}>
                    {date(event.date)}
                    <small>
                      {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}{" "}
                      UTC
                    </small>
                  </time>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
