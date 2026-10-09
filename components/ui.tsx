"use client";
import { useEffect, useRef, type ReactNode } from "react";
import {
  Search,
  X,
  ArrowUpRight,
  Inbox,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSettings } from "@/providers";

export function PageHeading({
  eyebrow = "WORKSPACE",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function Badge({ children }: { children: string }) {
  return (
    <span className={`badge badge-${children.toLowerCase()}`}>
      <span />
      {children}
    </span>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-box">
      <Search size={17} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="icon-button"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
export function StatCard({
  label,
  value,
  trend,
  detail,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  detail: string;
  icon: ReactNode;
}) {
  const { settings } = useSettings();
  return (
    <div className="stat-card" data-density={settings.density}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <div className="stat-bottom">
        {trend && (
          <span className="trend">
            <ArrowUpRight size={13} />
            {trend}
          </span>
        )}
        <span>{detail}</span>
      </div>
    </div>
  );
}
export function Loading({
  label = "Loading workspace data...",
}: {
  label?: string;
}) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      <p>{label}</p>
      <div className="skeleton-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} />
        ))}
      </div>
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div className="empty-state" role="alert">
      <AlertCircle />
      <h3>We couldn’t load this view</h3>
      <p>{error.message}</p>
      <button className="button" onClick={retry}>
        <RefreshCw size={15} />
        Try again
      </button>
    </div>
  );
}
export function EmptyState() {
  return (
    <div className="empty-state">
      <Inbox size={32} />
      <h3>No results found</h3>
      <p>Try another search or adjust your filters.</p>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      element?.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-inner">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            aria-label="Close details"
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Pagination({
  page,
  total,
  size,
  onChange,
}: {
  page: number;
  total: number;
  size: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <span>
        {total ? (page - 1) * size + 1 : 0}–{Math.min(page * size, total)} of{" "}
        {total.toLocaleString()} results
      </span>
      <div>
        <button
          className="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={15} />
          Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
