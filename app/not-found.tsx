import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state min-h-screen">
      <h1>Page not found</h1>
      <p>That page is not part of this workspace.</p>
      <Link className="button primary" href="/dashboard">
        Back to overview
      </Link>
    </div>
  );
}
