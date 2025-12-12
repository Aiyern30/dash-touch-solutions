import React from "react";
import { Order } from "@/types/order";
import { formatTime } from "@/utils/formatters";

interface PrintLayoutProps {
  orders: Order[];
  printOrderId?: string;
}

export const PrintLayout: React.FC<PrintLayoutProps> = React.memo(
  ({ orders, printOrderId }) => {
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
  }
);

PrintLayout.displayName = "PrintLayout";
