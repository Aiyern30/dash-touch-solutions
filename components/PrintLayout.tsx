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
      <div className="print-content" style={{ display: "none" }}>
        <style>{`
          @media print {
            .print-only { display: block !important; }
            .no-print { display: none !important; }
            * {
              font-family: 'Courier New', Courier, monospace;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            @page { 
              size: 80mm auto;
              margin: 0;
            }
          }
        `}</style>

        <div
          style={{
            width: "80mm",
            padding: "4mm 3mm",
            fontSize: "11px",
            lineHeight: "1.3",
            color: "#000",
          }}
        >
          {/* ===== HEADER ===== */}
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              KITCHEN TICKET
            </div>

            <div style={{ marginTop: "2px", fontSize: "10px" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div style={{ fontSize: "10px" }}>
              Printed: {formatTime(new Date())}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px dashed #000",
              margin: "4px 0 8px 0",
            }}
          />

          {/* ===== ORDERS ===== */}
          {ordersToPrint.map((order, index) => (
            <div key={order.id} style={{ marginBottom: "10px" }}>
              {/* ORDER NUMBER SECTION */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {order.orderNumber}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "2px 6px",
                    border: "2px solid #000",
                    borderRadius: "3px",
                    textTransform: "uppercase",
                  }}
                >
                  {order.status}
                </div>
              </div>

              {/* Order Time */}
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                <strong>Time:</strong> {formatTime(order.createdAt)}
              </div>

              <div
                style={{ borderTop: "1px dotted #000", marginBottom: "6px" }}
              />

              {/* ITEMS */}
              {order.items.map((item) => (
                <div key={item.id} style={{ marginBottom: "6px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div
                      style={{
                        marginTop: "2px",
                        fontSize: "10px",
                        padding: "3px 5px",
                        borderLeft: "2px solid #000",
                      }}
                    >
                      NOTE: {item.notes}
                    </div>
                  )}
                </div>
              ))}

              {/* ITEM COUNT */}
              <div
                style={{
                  textAlign: "right",
                  borderTop: "1px dotted #000",
                  paddingTop: "4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                Total Items:{" "}
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>

              {/* Divider */}
              {index < ordersToPrint.length - 1 && (
                <div
                  style={{
                    borderTop: "1px dashed #000",
                    margin: "10px 0",
                  }}
                />
              )}
            </div>
          ))}

          {/* FOOTER */}
          <div
            style={{
              textAlign: "center",
              marginTop: "6px",
              paddingTop: "6px",
              borderTop: "1px solid #000",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>
              TOTAL ORDERS: {ordersToPrint.length}
            </div>
            <div style={{ fontSize: "9px", marginTop: "3px", color: "#666" }}>
              Kitchen Display System
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintLayout.displayName = "PrintLayout";
