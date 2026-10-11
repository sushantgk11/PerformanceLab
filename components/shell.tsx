"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Users,
  X,
  ChartNoAxesCombined,
  FlaskConical,
  Check,
} from "lucide-react";
import { useClock, useNotifications, useSettings } from "@/providers";
import {
  dismissNotification,
  setSearch,
  useAppDispatch,
  useAppSelector,
} from "@/store";
import type { SessionUser } from "@/types";
const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/activity", label: "Activity feed", icon: Activity },
];
const notifications = [
  {
    id: "report",
    title: "Your workspace is ready",
    text: "Explore the latest revenue and customer insights.",
  },
  {
    id: "inventory",
    title: "Inventory review",
    text: "Some products are running low. Review your catalog.",
  },
  {
    id: "team",
    title: "Welcome to Performance Lab",
    text: "Your team’s next chapter starts here.",
  },
];
export function Shell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const { settings } = useSettings();
  const notify = useNotifications();
  const dispatch = useAppDispatch();
  const { search, dismissedNotifications } = useAppSelector((s) => s.workspace);
  const unread = notifications.filter(
    (n) => !dismissedNotifications.includes(n.id),
  );
  const name = user.mode === "demo" ? settings.name : user.name;
  async function logout() {
    setLogoutPending(true);
    try {
      const response = await fetch("/api/auth", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to sign out");
      router.replace("/login");
      router.refresh();
    } catch {
      notify("Sign out failed. Please try again.");
      setLogoutPending(false);
    }
  }
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <Link href="/dashboard" className="brand">
          <span className="brand-icon">
            <FlaskConical size={22} />
          </span>
          performance<span className="brand-lab">lab</span>
        </Link>
        <div className="workspace-picker">
          <span className="workspace-avatar">P</span>
          <div>
            <strong>Acme workspace</strong>
            <small>Enterprise plan</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobile(false)}
              className={`nav-link ${path === item.href ? "active" : ""}`}
            >
              <item.icon size={19} />
              {item.label}
              {item.href === "/activity" && <span className="live-nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="note-icon">
              <ChartNoAxesCombined size={20} />
            </span>
            <strong>A clearer view of growth.</strong>
            <p>
              All your business insights,
              <br />
              one connected workspace.
            </p>
            <Link href="/analytics">
              Explore analytics <ArrowUpRight size={16} />
            </Link>
          </div>
          <Link
            href="/settings"
            onClick={() => setMobile(false)}
            className={`nav-link ${path === "/settings" ? "active" : ""}`}
          >
            <Settings size={19} />
            Settings
          </Link>
          <div className="sidebar-user">
            <span className="profile-avatar">
              {name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <strong>{name}</strong>
              <small>
                {user.mode === "demo" ? "Demo administrator" : "Administrator"}
              </small>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              disabled={logoutPending}
              onClick={logout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {navigation.find((n) => n.href === path)?.label || "Settings"}
            </strong>
          </div>
          <div className="header-tools">
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/users");
              }}
            >
              <Search size={16} />
              <input
                ref={searchInput}
                aria-label="Search workspace users"
                placeholder="Search workspace..."
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
              />
              <kbd>
                <Command size={11} /> K
              </kbd>
            </form>
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={19} />
                {unread.length > 0 && settings.liveNotifications && <i />}
              </button>
              {showNotifications && (
                <div className="notification-panel">
                  <div className="panel-heading">
                    <h3>Notifications</h3>
                    <button
                      className="icon-button"
                      aria-label="Close notifications"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {unread.length ? (
                    unread.map((n) => (
                      <div className="notification" key={n.id}>
                        <div>
                          <strong>{n.title}</strong>
                          <p>{n.text}</p>
                        </div>
                        <button
                          aria-label={`Dismiss ${n.title}`}
                          className="icon-button"
                          onClick={() => dispatch(dismissNotification(n.id))}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="muted p-5">You’re all caught up.</p>
                  )}
                </div>
              )}
            </div>
            <div className="header-divider" />
            <Link
              href="/settings"
              aria-label="Profile settings"
              className="profile-avatar small"
            >
              {name[0]}
            </Link>
          </div>
        </header>
        <main>
          {children}
          <footer className="page-footer">
            <span>
              Performance Lab <span className="footer-dot">·</span> Acme
              workspace
            </span>
            <span className="system-status">
              <i />
              All systems operational
              <FooterClock />
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function FooterClock() {
  const now = useClock();
  if (!now) return null;
  return (
    <span className="footer-clock">
      {" "}
      ·{" "}
      {new Date(now).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );
}
