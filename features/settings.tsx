"use client";
import { useState, type FormEvent } from "react";
import {
  Bell,
  Check,
  Laptop,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  SlidersHorizontal,
} from "lucide-react";
import { useSettings, type Settings } from "@/providers";
import { PageHeading } from "@/components/ui";
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`toggle ${checked ? "on" : ""}`}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}
export function SettingsPage() {
  const { settings, update, notify, hydrated } = useSettings();
  const [tab, setTab] = useState("Profile");
  function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    update({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")),
      title: String(form.get("title")),
    });
    notify("Profile saved.");
  }
  return (
    <>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Settings"
        description="Your profile, your preferences, your workspace."
      />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {[
            { name: "Profile", icon: UserRound },
            { name: "Appearance", icon: Sun },
            { name: "Notifications", icon: Bell },
            { name: "Preferences", icon: SlidersHorizontal },
            { name: "Permissions", icon: ShieldCheck },
          ].map((item) => (
            <button
              key={item.name}
              className={tab === item.name ? "selected" : ""}
              onClick={() => setTab(item.name)}
            >
              <item.icon size={17} />
              {item.name}
            </button>
          ))}
        </nav>
        <section className="panel settings-panel">
          {tab === "Profile" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>Personal information</h2>
                  <p>How you appear in this workspace</p>
                </div>
              </div>
              <form
                onSubmit={saveProfile}
                className="settings-form"
                key={hydrated ? "ready" : "loading"}
              >
                <div className="profile-preview">
                  <span className="profile-avatar large">
                    {settings.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <strong>{settings.name}</strong>
                    <p>{settings.title}</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label>
                    Full name
                    <input
                      name="name"
                      required
                      maxLength={80}
                      pattern=".*\S.*"
                      defaultValue={settings.name}
                    />
                  </label>
                  <label>
                    Contact email
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={settings.email}
                    />
                  </label>
                  <label className="col-span-full">
                    Job title
                    <input
                      name="title"
                      maxLength={100}
                      defaultValue={settings.title}
                    />
                  </label>
                </div>
                <p className="settings-note">
                  Profile preferences are saved in this browser. Your sign-in
                  credentials stay with your authentication provider.
                </p>
                <div className="form-actions">
                  <button className="button primary" type="submit">
                    <Check size={16} />
                    Save changes
                  </button>
                </div>
              </form>
            </>
          )}
          {tab === "Appearance" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>Appearance</h2>
                  <p>Choose a space that feels like you</p>
                </div>
              </div>
              <div className="settings-content">
                <h3>Interface theme</h3>
                <p className="muted">
                  Pick a theme or match your device settings.
                </p>
                <div className="theme-options">
                  {(
                    [
                      { value: "light", label: "Light", icon: Sun },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Laptop },
                    ] as const
                  ).map((theme) => (
                    <button
                      key={theme.value}
                      className={
                        settings.theme === theme.value ? "selected" : ""
                      }
                      onClick={() => update({ theme: theme.value })}
                    >
                      <theme.icon size={24} />
                      <span>{theme.label}</span>
                      {settings.theme === theme.value && <Check size={15} />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {tab === "Notifications" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>Notifications</h2>
                  <p>Stay informed on your terms</p>
                </div>
              </div>
              <div className="settings-content">
                <Toggle
                  label="In-app notifications"
                  description="Show notification indicators and live event counts."
                  checked={settings.liveNotifications}
                  onChange={() =>
                    update({ liveNotifications: !settings.liveNotifications })
                  }
                />
                <Toggle
                  label="Email notifications"
                  description="Your preference for order and account email updates."
                  checked={settings.emailNotifications}
                  onChange={() =>
                    update({ emailNotifications: !settings.emailNotifications })
                  }
                />
                <Toggle
                  label="Weekly digest"
                  description="Your preference for a weekly business summary."
                  checked={settings.weeklyDigest}
                  onChange={() =>
                    update({ weeklyDigest: !settings.weeklyDigest })
                  }
                />
                <p className="settings-note">
                  Email preferences are stored locally. This demo does not send
                  email.
                </p>
              </div>
            </>
          )}
          {tab === "Preferences" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>Application preferences</h2>
                  <p>Fine-tune your everyday workflow</p>
                </div>
              </div>
              <div className="settings-content">
                <div className="setting-row">
                  <div>
                    <strong>Table density</strong>
                    <p>Choose how much space to give each row.</p>
                  </div>
                  <select
                    aria-label="Table density"
                    value={settings.density}
                    onChange={(e) =>
                      update({ density: e.target.value as Settings["density"] })
                    }
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Default reporting period</strong>
                    <p>Applied when you next open a reporting view.</p>
                  </div>
                  <select
                    aria-label="Default reporting period"
                    value={settings.defaultRange}
                    onChange={(e) => update({ defaultRange: e.target.value })}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>
              </div>
            </>
          )}
          {tab === "Permissions" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>User permissions</h2>
                  <p>Manage your workspace role preferences</p>
                </div>
              </div>
              <div className="settings-content">
                <div className="permission-notice">
                  <ShieldCheck size={20} />
                  <p>
                    This is a local permission policy preview. It does not
                    change authentication or enforce access restrictions.
                  </p>
                </div>
                {Object.entries(settings.permissions).map(([role, allowed]) => (
                  <Toggle
                    key={role}
                    label={`${role} report access`}
                    description={`${role} role can export workspace reports in the policy preview.`}
                    checked={allowed}
                    onChange={() =>
                      update({
                        permissions: {
                          ...settings.permissions,
                          [role]: !allowed,
                        },
                      })
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
