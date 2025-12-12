export type OrderStatus = "pending" | "preparing" | "ready" | "completed";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
