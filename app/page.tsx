"use client";

import React, { useState } from "react";
import { Clock, Printer } from "lucide-react";

// Types
type OrderStatus = "pending" | "preparing" | "ready" | "completed";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Utility functions
const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  return `${minutes} min ago`;
};

// Initial mock data
const INITIAL_ORDERS: Order[] = [
  {
    id: "001",
    orderNumber: "#001",
    items: [
      { id: "1", name: "Nasi Lemak", quantity: 2 },
      { id: "2", name: "Teh Tarik", quantity: 2 },
      { id: "3", name: "Roti Canai", quantity: 3 },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000),
  },
  {
    id: "002",
    orderNumber: "#002",
    items: [
      { id: "4", name: "Char Kway Teow", quantity: 1 },
      { id: "5", name: "Ice Lemon Tea", quantity: 1 },
    ],
    status: "preparing",
    createdAt: new Date(Date.now() - 10 * 60000),
    updatedAt: new Date(Date.now() - 3 * 60000),
  },
  {
    id: "003",
    orderNumber: "#003",
    items: [
      { id: "6", name: "Nasi Goreng", quantity: 1 },
      { id: "7", name: "Mee Goreng", quantity: 1 },
      { id: "8", name: "Teh O", quantity: 2 },
    ],
    status: "ready",
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(Date.now() - 1 * 60000),
  },
  {
    id: "004",
    orderNumber: "#004",
    items: [
      { id: "9", name: "Laksa", quantity: 1 },
      { id: "10", name: "Teh Tarik", quantity: 1 },
    ],
    status: "completed",
    createdAt: new Date(Date.now() - 20 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000),
  },
];

// Status Badge Component
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    preparing: "bg-blue-100 text-blue-800 border border-blue-300",
    ready: "bg-green-100 text-green-800 border border-green-300",
    completed: "bg-gray-100 text-gray-600 border border-gray-300",
  };

  const labels = {
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

// Order Card Component
const OrderCard: React.FC<{
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onPrintOrder: (orderId: string) => void;
}> = ({ order, onStatusChange, onPrintOrder }) => {
  const statusProgression: OrderStatus[] = [
    "pending",
    "preparing",
    "ready",
    "completed",
  ];
  const currentIndex = statusProgression.indexOf(order.status);
  const nextStatus = statusProgression[currentIndex + 1];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {order.orderNumber}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{formatTime(order.createdAt)}</span>
            <span>•</span>
            <span>{getTimeAgo(order.createdAt)}</span>
          </div>
        </div>
        <button
          onClick={() => onPrintOrder(order.id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Print Order"
        >
          <Printer size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Items */}
      <div className="px-4 py-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <span className="text-gray-900">{item.name}</span>
            <span className="font-bold text-gray-900">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
        <StatusBadge status={order.status} />
        {nextStatus && order.status !== "completed" && (
          <button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Advance →
          </button>
        )}
      </div>
    </div>
  );
};

// Print Layout Component
const PrintLayout: React.FC<{ orders: Order[]; printOrderId?: string }> = ({
  orders,
  printOrderId,
}) => {
  const ordersToPrint = printOrderId
    ? orders.filter((o) => o.id === printOrderId)
    : orders;

  return (
    <div className="print-only" style={{ display: "none" }}>
      <style>{`
        @media print {
          .print-only { display: block !important; }
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; font-family: monospace; }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>
      <div style={{ width: "80mm", padding: "5mm", fontSize: "12px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "10px",
            borderBottom: "2px dashed #000",
            paddingBottom: "10px",
          }}
        >
          <h2 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
            KITCHEN ORDERS
          </h2>
          <p style={{ margin: 0, fontSize: "10px" }}>
            Printed: {formatTime(new Date())}
          </p>
        </div>

        {ordersToPrint.map((order) => (
          <div
            key={order.id}
            style={{
              marginBottom: "15px",
              borderBottom: "1px dashed #000",
              paddingBottom: "10px",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "5px",
              }}
            >
              {order.orderNumber} - {order.status.toUpperCase()}
            </div>
            <div style={{ fontSize: "10px", marginBottom: "8px" }}>
              Time: {formatTime(order.createdAt)}
            </div>
            {order.items.map((item) => (
              <div key={item.id} style={{ marginBottom: "5px" }}>
                <div style={{ fontWeight: "bold" }}>
                  {item.quantity}x {item.name}
                </div>
                {item.notes && (
                  <div
                    style={{
                      fontSize: "10px",
                      marginLeft: "15px",
                      fontStyle: "italic",
                    }}
                  >
                    Note: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        <div
          style={{ textAlign: "center", marginTop: "15px", fontSize: "10px" }}
        >
          <p style={{ margin: 0 }}>Total Orders: {ordersToPrint.length}</p>
        </div>
      </div>
    </div>
  );
};

// Main KDS Component
const KitchenDisplaySystem: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [printOrderId, setPrintOrderId] = useState<string | undefined>();

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      )
    );
  };

  const handlePrintOrder = (orderId: string) => {
    setPrintOrderId(orderId);
    setTimeout(() => {
      window.print();
      setPrintOrderId(undefined);
    }, 100);
  };

  const handlePrintAll = () => {
    setPrintOrderId(undefined);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getOrderCount = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Kitchen Display System
              </h1>
              <button
                onClick={handlePrintAll}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                Print All
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-3xl font-bold text-gray-900">
                {orders.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Orders</div>
            </div>
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
              <div className="text-3xl font-bold text-yellow-900">
                {getOrderCount("pending")}
              </div>
              <div className="text-sm text-yellow-700 mt-1">Pending</div>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="text-3xl font-bold text-blue-900">
                {getOrderCount("preparing")}
              </div>
              <div className="text-sm text-blue-700 mt-1">Preparing</div>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <div className="text-3xl font-bold text-green-900">
                {getOrderCount("ready")}
              </div>
              <div className="text-sm text-green-700 mt-1">Ready</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter("preparing")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "preparing"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Preparing
            </button>
            <button
              onClick={() => setActiveFilter("ready")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "ready"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Ready
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPrintOrder={handlePrintOrder}
              />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders in this status</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print Layout */}
      <PrintLayout orders={orders} printOrderId={printOrderId} />
    </div>
  );
};

export default KitchenDisplaySystem;
