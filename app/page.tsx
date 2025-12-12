import React, { useState, useRef, useEffect } from "react";
import { Clock, Printer, Check, AlertCircle } from "lucide-react";

// Types
type OrderStatus = "pending" | "preparing" | "ready";

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
    second: "2-digit",
    hour12: true,
  }).format(date);
};

const getStatusColor = (status: OrderStatus): string => {
  const colors = {
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    preparing: "bg-blue-100 text-blue-800 border-blue-300",
    ready: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[status];
};

const getStatusLabel = (status: OrderStatus): string => {
  const labels = {
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
  };
  return labels[status];
};

// Mock data generator
const generateMockOrders = (): Order[] => {
  const now = new Date();
  return [
    {
      id: "1",
      orderNumber: "#1234",
      items: [
        { id: "1", name: "Margherita Pizza", quantity: 2 },
        { id: "2", name: "Caesar Salad", quantity: 1, notes: "No croutons" },
        { id: "3", name: "Garlic Bread", quantity: 1 },
      ],
      status: "pending",
      createdAt: new Date(now.getTime() - 5 * 60000),
      updatedAt: new Date(now.getTime() - 5 * 60000),
    },
    {
      id: "2",
      orderNumber: "#1235",
      items: [
        { id: "4", name: "Pepperoni Pizza", quantity: 1 },
        { id: "5", name: "Buffalo Wings", quantity: 12, notes: "Extra spicy" },
      ],
      status: "preparing",
      createdAt: new Date(now.getTime() - 10 * 60000),
      updatedAt: new Date(now.getTime() - 3 * 60000),
    },
    {
      id: "3",
      orderNumber: "#1236",
      items: [
        { id: "6", name: "Veggie Burger", quantity: 1 },
        { id: "7", name: "French Fries", quantity: 2 },
        { id: "8", name: "Coke", quantity: 2 },
      ],
      status: "ready",
      createdAt: new Date(now.getTime() - 15 * 60000),
      updatedAt: new Date(now.getTime() - 1 * 60000),
    },
    {
      id: "4",
      orderNumber: "#1237",
      items: [
        { id: "9", name: "Spaghetti Carbonara", quantity: 1 },
        { id: "10", name: "Tiramisu", quantity: 2 },
      ],
      status: "pending",
      createdAt: new Date(now.getTime() - 2 * 60000),
      updatedAt: new Date(now.getTime() - 2 * 60000),
    },
  ];
};

// Order Card Component
const OrderCard: React.FC<{
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}> = ({ order, onStatusChange }) => {
  const statusProgression: OrderStatus[] = ["pending", "preparing", "ready"];
  const currentIndex = statusProgression.indexOf(order.status);
  const nextStatus = statusProgression[currentIndex + 1];

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b-2 ${getStatusColor(order.status)}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{order.orderNumber}</h3>
          <span className="text-sm font-semibold uppercase px-3 py-1 rounded-full bg-white bg-opacity-50">
            {getStatusLabel(order.status)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-sm opacity-80">
          <Clock size={14} />
          <span>{formatTime(order.createdAt)}</span>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg">{item.quantity}x</span>
                <span className="text-gray-800">{item.name}</span>
              </div>
              {item.notes && (
                <div className="ml-8 text-sm text-gray-600 italic flex items-start gap-1">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  {item.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        {nextStatus ? (
          <button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {nextStatus === "ready" ? (
              <>
                <Check size={18} />
                Mark as Ready
              </>
            ) : (
              `Start Preparing`
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-700 font-semibold py-2">
            <Check size={18} />
            Order Complete
          </div>
        )}
      </div>
    </div>
  );
};

// Print Layout Component (hidden, used for printing)
const PrintLayout: React.FC<{ orders: Order[] }> = ({ orders }) => {
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

        {orders.map((order, idx) => (
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
              {order.orderNumber} - {getStatusLabel(order.status).toUpperCase()}
            </div>
            <div style={{ fontSize: "10px", marginBottom: "8px" }}>
              Time: {formatTime(order.createdAt)}
            </div>
            {order.items.map((item, itemIdx) => (
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
          <p style={{ margin: 0 }}>Total Orders: {orders.length}</p>
        </div>
      </div>
    </div>
  );
};

// Main KDS Component
const KitchenDisplaySystem: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastPrintTime, setLastPrintTime] = useState<Date | null>(null);
  const printRef = useRef<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(generateMockOrders());
  }, []);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      )
    );
  };

  const handleSilentPrint = () => {
    if (printRef.current) return;
    printRef.current = true;

    setTimeout(() => {
      window.print();
      setLastPrintTime(new Date());
      printRef.current = false;
    }, 100);
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="no-print">
        {/* Header */}
        <header className="bg-white shadow-sm border-b-2 border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Kitchen Display System
              </h1>
              <div className="flex items-center gap-4">
                {lastPrintTime && (
                  <span className="text-sm text-gray-600">
                    Last print: {formatTime(lastPrintTime)}
                  </span>
                )}
                <button
                  onClick={handleSilentPrint}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print Orders
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Column */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Pending ({pendingOrders.length})
              </h2>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>

            {/* Preparing Column */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Preparing ({preparingOrders.length})
              </h2>
              <div className="space-y-4">
                {preparingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>

            {/* Ready Column */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Ready ({readyOrders.length})
              </h2>
              <div className="space-y-4">
                {readyOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Hidden Print Layout */}
      <PrintLayout orders={orders} />
    </div>
  );
};

export default KitchenDisplaySystem;
