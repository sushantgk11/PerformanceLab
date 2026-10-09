export type UserStatus = "Active" | "Invited" | "Inactive";
export type OrderStatus = "Completed" | "Processing" | "Shipped" | "Cancelled";
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  company: string;
  country: string;
  role: string;
  status: UserStatus;
  joined: string;
  spent: number;
}
export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  rating: number;
  description: string;
}
export interface Order {
  id: string;
  userId: string;
  customer: string;
  email: string;
  productId: string;
  product: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  date: string;
  country: string;
}
export interface Activity {
  id: string;
  name: string;
  action: string;
  detail: string;
  kind: "order" | "user" | "product" | "system";
  date: string;
}
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  mode: "demo" | "firebase";
}
export interface Dataset {
  users: User[];
  products: Product[];
  orders: Order[];
  activities: Activity[];
}
export type Resource = keyof Dataset;
