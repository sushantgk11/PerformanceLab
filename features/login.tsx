"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  ArrowRight,
  FlaskConical,
  ChartNoAxesCombined,
  ShieldCheck,
} from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
export function LoginForm({ firebaseEnabled }: { firebaseEnabled: boolean }) {
  const [email, setEmail] = useState(
    firebaseEnabled ? "" : "alex@performancelab.dev",
  );
  const [password, setPassword] = useState(firebaseEnabled ? "" : "demo1234");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      let idToken: string | undefined;
      if (firebaseEnabled) {
        const auth = getFirebaseAuth();
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        idToken = await credential.user.getIdToken();
        await signOut(auth);
      }
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, idToken }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
      setPending(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <div className="brand">
          <span className="brand-icon">
            <FlaskConical size={23} />
          </span>
          performance<span className="brand-lab">lab</span>
        </div>
        <div className="login-story-content">
          <span className="login-tag">
            <span /> YOUR BUSINESS, IN FOCUS
          </span>
          <h1>
            Every signal.
            <br />A clearer picture.
          </h1>
          <p>
            Connect the dots between your customers, products, and growth. Make
            your next move with confidence.
          </p>
          <div className="login-visual">
            <div className="visual-label">
              <ChartNoAxesCombined size={20} />
              Business overview<span>Live</span>
            </div>
            <div className="visual-value">Built for your next chapter.</div>
            <div className="visual-bars">
              {[25, 40, 32, 52, 44, 66, 59, 76, 68, 86, 78, 100].map((v, i) => (
                <div key={i} style={{ height: `${v}%` }} />
              ))}
            </div>
          </div>
        </div>
        <small>THE WORKSPACE FOR FORWARD-THINKING TEAMS</small>
      </section>
      <section className="login-form-panel">
        <form onSubmit={submit} className="login-form">
          <span className="login-welcome">LET’S GET TO WORK</span>
          <h2>Welcome back</h2>
          <p>Sign in to your Performance Lab workspace.</p>
          <label>
            Email address
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <div role="alert" className="form-error">
              {error}
            </div>
          )}
          <button className="button primary login-submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign in to workspace"}
            <ArrowRight size={17} />
          </button>
          {!firebaseEnabled && (
            <div className="demo-credentials">
              <ShieldCheck size={20} />
              <div>
                <strong>Your demo workspace is ready</strong>
                <p>
                  alex@performancelab.dev
                  <br />
                  Password: demo1234
                </p>
              </div>
            </div>
          )}
          <div className="login-footnote">
            {firebaseEnabled
              ? "Secured with Firebase Authentication"
              : "Demo environment · No account required"}
          </div>
        </form>
      </section>
    </div>
  );
}
