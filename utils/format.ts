export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
export const number = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
export const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
export function exportCsv(name: string, rows: object[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const quote = (value: unknown) =>
    `"${String(value ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const content = [
    headers.map(quote).join(","),
    ...rows.map((row) =>
      headers
        .map((key) => quote((row as Record<string, unknown>)[key]))
        .join(","),
    ),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
