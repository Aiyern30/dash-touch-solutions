import React from "react";
import { OrderStatus } from "@/types/order";

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(
  ({ status }) => {
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
  }
);

StatusBadge.displayName = "StatusBadge";
