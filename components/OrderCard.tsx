import React, { useCallback } from "react";
import { Clock, Printer } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { formatTime, getTimeAgo } from "@/utils/formatters";
import { StatusBadge } from "./StatusBadge";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onPrintOrder: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = React.memo(
  ({ order, onStatusChange, onPrintOrder }) => {
    const statusProgression: OrderStatus[] = [
      "pending",
      "preparing",
      "ready",
      "completed",
    ];
    const currentIndex = statusProgression.indexOf(order.status);
    const nextStatus = statusProgression[currentIndex + 1];

    const handleAdvance = useCallback(() => {
      if (nextStatus) {
        onStatusChange(order.id, nextStatus);
      }
    }, [order.id, nextStatus, onStatusChange]);

    const handlePrint = useCallback(() => {
      onPrintOrder(order.id);
    }, [order.id, onPrintOrder]);

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
            onClick={handlePrint}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Print Order"
            aria-label="Print this order"
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
              onClick={handleAdvance}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              aria-label={`Advance order to ${nextStatus}`}
            >
              Advance →
            </button>
          )}
        </div>
      </div>
    );
  }
);

OrderCard.displayName = "OrderCard";
