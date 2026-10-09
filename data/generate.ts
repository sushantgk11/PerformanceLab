import type { Activity, Dataset, Order, Product, User } from "@/types";

const firstNames = [
  "Olivia",
  "Liam",
  "Amelia",
  "Noah",
  "Sophia",
  "Ethan",
  "Isabella",
  "Arjun",
  "Mia",
  "Lucas",
  "Ava",
  "Oliver",
  "Charlotte",
  "Elijah",
  "Harper",
  "Mateo",
  "Priya",
  "James",
  "Yuki",
  "Daniel",
  "Chloe",
  "Leo",
  "Zara",
  "Benjamin",
  "Nora",
  "Gabriel",
  "Fatima",
  "Henry",
  "Grace",
  "Alexander",
  "Layla",
  "Sebastian",
];
const lastNames = [
  "Bennett",
  "Chen",
  "Patel",
  "Morgan",
  "Wilson",
  "Kim",
  "Taylor",
  "Garcia",
  "Anderson",
  "Martin",
  "Thompson",
  "Singh",
  "Robinson",
  "Lee",
  "Walker",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Young",
  "Hall",
  "Allen",
  "Wright",
  "Scott",
  "Green",
  "Adams",
  "Baker",
  "Nelson",
  "Carter",
  "Mitchell",
  "Perez",
  "Roberts",
];
const companies = [
  "Acme Studio",
  "Linear Labs",
  "Northstar",
  "Layers",
  "Orbit Digital",
  "Meridian",
  "Forma",
  "Notion Works",
  "Arc Systems",
  "Vercel Studio",
  "Atlas Group",
  "Lumen",
];
const countries = [
  "United States",
  "United Kingdom",
  "India",
  "Germany",
  "Canada",
  "Australia",
  "Japan",
  "France",
];
export const categories = [
  "Electronics",
  "Accessories",
  "Workspace",
  "Lifestyle",
  "Audio",
];
const catalog = [
  ["Studio Headphones", "Audio", "photo-1505740420928-5e560c06d30e"],
  ["Everyday Backpack", "Accessories", "photo-1553062407-98eeb64c6a62"],
  ["Mechanical Keyboard", "Electronics", "photo-1587829741301-dc798b83add3"],
  ["Minimal Desk Lamp", "Workspace", "photo-1507473885765-e6ed057f782c"],
  ["Ceramic Coffee Cup", "Lifestyle", "photo-1514228742587-6b1558fcca3d"],
  ["Wireless Speaker", "Audio", "photo-1608043152269-423dbba4e7e1"],
  ["Classic Watch", "Accessories", "photo-1524805444758-089113d48a6d"],
  ["Desk Chair", "Workspace", "photo-1592789705501-f9ae4278a9c9"],
  ["Instant Camera", "Electronics", "photo-1516035069371-29a1b244cc32"],
  ["Travel Bottle", "Lifestyle", "photo-1602143407151-7111542de6e8"],
];
const variants = [
  "Essential",
  "Pro",
  "Air",
  "Studio",
  "Plus",
  "Classic",
  "Mini",
  "Signature",
  "Edition",
  "Max",
];
const DAY = 86400000;

export function generateData(): Dataset {
  const anchor = Date.UTC(2026, 9, 8, 12);
  const users: User[] = Array.from({ length: 10000 }, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last =
      lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    return {
      id: `USR-${String(i + 1).padStart(5, "0")}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@${["gmail.com", "outlook.com", "example.com"][i % 3]}`,
      avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
      company: companies[i % companies.length],
      country: countries[i % countries.length],
      role: ["Member", "Member", "Admin", "Viewer"][i % 4],
      status: i % 13 === 0 ? "Invited" : i % 7 === 0 ? "Inactive" : "Active",
      joined: new Date(anchor - ((i * 17) % 720) * DAY).toISOString(),
      spent: 0,
    };
  });
  const products: Product[] = Array.from({ length: 1000 }, (_, i) => {
    const base = catalog[i % catalog.length];
    return {
      id: `PRD-${String(i + 1).padStart(4, "0")}`,
      name: `${base[0]} ${variants[Math.floor(i / 10) % 10]} ${Math.floor(i / 100) + 1}`,
      category: base[1],
      image: `https://images.unsplash.com/${base[2]}?auto=format&fit=crop&w=700&q=85&sig=${i + 1}`,
      price: Math.round((24 + ((i * 37) % 470) + 0.99) * 100) / 100,
      stock: (i * 19) % 240,
      rating: Math.round((3.6 + (i % 15) / 10) * 10) / 10,
      description:
        "Thoughtfully designed for the way you work and live. Made with considered materials, a refined finish, and dependable everyday functionality. Includes a two-year limited warranty.",
    };
  });
  const orders: Order[] = Array.from({ length: 10000 }, (_, i) => {
    const user = users[(i * 37) % users.length];
    const product = products[(i * 13) % products.length];
    const quantity = (i % 4) + 1;
    const status = (
      [
        "Completed",
        "Completed",
        "Shipped",
        "Processing",
        "Completed",
        "Cancelled",
      ] as const
    )[i % 6];
    const total = Math.round(product.price * quantity * 100) / 100;
    if (status !== "Cancelled") user.spent += total;
    return {
      id: `ORD-${String(24001 + i)}`,
      userId: user.id,
      customer: user.name,
      email: user.email,
      productId: product.id,
      product: product.name,
      quantity,
      total,
      status,
      country: user.country,
      date: new Date(
        anchor - (i % 365) * DAY - (i % 24) * 3600000,
      ).toISOString(),
    };
  });
  const activities: Activity[] = Array.from({ length: 12000 }, (_, i) => ({
    id: `EVT-${i + 1}`,
    name: users[i % users.length].name,
    action: [
      "placed an order",
      "joined the workspace",
      "updated a product",
      "completed a payment",
    ][i % 4],
    detail: [
      orders[i % orders.length].id,
      companies[i % companies.length],
      products[i % products.length].name,
      "Payment received",
    ][i % 4],
    kind: (["order", "user", "product", "system"] as const)[i % 4],
    date: new Date(anchor - i * 900000).toISOString(),
  }));
  return { users, products, orders, activities };
}

export const database = generateData();
