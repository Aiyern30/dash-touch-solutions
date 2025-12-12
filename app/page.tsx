"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Printer } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { generateInitialOrders } from "@/data/orders";
import { OrderCard } from "@/components/OrderCard";
import { PrintLayout } from "@/components/PrintLayout";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [printOrderId, setPrintOrderId] = useState<string | undefined>();
  const printingRef = useRef(false);

  // Add printer states
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [isPrinterLoading, setIsPrinterLoading] = useState(true);

  // Generate initial orders only once on client side using lazy initialization
  const [orders, setOrders] = useState<Order[]>(() => {
    // This function only runs once during initialization
    if (typeof window === "undefined") {
      return []; // Return empty array during SSR
    }
    return generateInitialOrders();
  });

  // Check if we're on client side
  const isClient = typeof window !== "undefined";

  // Add print service configuration
  const PRINT_SERVICE_URL = "http://localhost:3001/print";
  const PRINTERS_URL = "http://localhost:3001/printers";

  // Fetch available printers on mount
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch(PRINTERS_URL);
        if (!response.ok) throw new Error("Failed to fetch printers");

        const data = await response.json();
        setPrinters(data.printers || []);

        // Load saved printer from localStorage or use first printer
        const savedPrinter = localStorage.getItem("selectedPrinter");
        if (savedPrinter && data.printers.includes(savedPrinter)) {
          setSelectedPrinter(savedPrinter);
        } else if (data.printers.length > 0) {
          setSelectedPrinter(data.printers[0]);
        }
      } catch (error) {
        console.error("Failed to fetch printers:", error);
      } finally {
        setIsPrinterLoading(false);
      }
    };

    if (isClient) {
      fetchPrinters();
    }
  }, [isClient]);

  // Handle printer selection change
  const handlePrinterChange = useCallback((printerName: string) => {
    setSelectedPrinter(printerName);
    localStorage.setItem("selectedPrinter", printerName);
  }, []);

  const silentPrint = useCallback(async () => {
    console.log(
      "[FRONTEND] silentPrint called, selectedPrinter:",
      selectedPrinter
    );

    if (!selectedPrinter) {
      alert("Please select a printer first");
      return;
    }

    try {
      console.log("[FRONTEND] About to query .print-content...");
      const printContent = document.querySelector(".print-content");
      console.log("[FRONTEND] printContent element:", printContent);
      console.log("[FRONTEND] printContent found:", !!printContent);

      if (!printContent) {
        console.error("[FRONTEND] Print content not found!");
        alert("Print content not found. Please try again.");
        return;
      }

      const wasHidden = printContent.classList.contains("hidden");
      if (wasHidden) {
        console.log("[FRONTEND] Temporarily showing print content...");
        printContent.classList.remove("hidden");
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      const htmlContent = (printContent as HTMLElement).innerHTML;
      console.log("[FRONTEND] HTML content length:", htmlContent.length);
      console.log("[FRONTEND] HTML preview:", htmlContent.substring(0, 200));

      if (wasHidden) {
        printContent.classList.add("hidden");
      }

      if (!htmlContent || htmlContent.length < 100) {
        console.error("[FRONTEND] HTML content seems empty or too short");
        alert("Print content is empty. Please try again.");
        return;
      }

      console.log("[FRONTEND] Sending print request to:", PRINT_SERVICE_URL);
      const response = await fetch(PRINT_SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: htmlContent,
          printerName: selectedPrinter,
        }),
      });

      console.log("[FRONTEND] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Print failed");
      }

      const result = await response.json();
      console.log("[FRONTEND] Print result:", result);

      // Show confirmation to user
      alert(`✓ Printed successfully to: ${selectedPrinter}`);
    } catch (error) {
      console.error("[FRONTEND] Silent print failed:", error);
      console.error("[FRONTEND] Error stack:", (error as Error).stack);
      alert("Silent print failed: " + (error as Error).message);
    }
  }, [selectedPrinter, PRINT_SERVICE_URL]);

  // Memoized handler with double-print prevention
  const handleStatusChange = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      console.log(`[FRONTEND] Status change: ${orderId} -> ${newStatus}`);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date() }
            : order
        )
      );

      // Auto-print when order becomes ready (with guard)
      if (newStatus === "ready") {
        console.log("[FRONTEND] Status is ready, checking print conditions...");
        console.log("[FRONTEND] printingRef.current:", printingRef.current);
        console.log("[FRONTEND] printOrderId:", printOrderId);

        if (!printingRef.current && printOrderId !== orderId) {
          console.log("[FRONTEND] Triggering auto-print for order:", orderId);
          printingRef.current = true;
          setPrintOrderId(orderId);

          setTimeout(async () => {
            await silentPrint();
            setPrintOrderId(undefined);
            printingRef.current = false;
          }, 150);
        } else {
          console.log(
            "[FRONTEND] Print blocked - already printing or same order"
          );
        }
      }
    },
    [printOrderId, silentPrint]
  );

  const handlePrintOrder = useCallback(
    async (orderId: string) => {
      console.log("[FRONTEND] handlePrintOrder called for:", orderId);

      if (printingRef.current) {
        console.log("[FRONTEND] Already printing, skipping");
        return;
      }

      printingRef.current = true;
      setPrintOrderId(orderId);

      setTimeout(async () => {
        await silentPrint();
        setPrintOrderId(undefined);
        printingRef.current = false;
      }, 100);
    },
    [silentPrint]
  );

  const handlePrintAll = useCallback(async () => {
    console.log("[FRONTEND] handlePrintAll called");

    if (printingRef.current) {
      console.log("[FRONTEND] Already printing, skipping");
      return;
    }

    printingRef.current = true;
    setPrintOrderId(undefined);

    setTimeout(async () => {
      await silentPrint();
      printingRef.current = false;
    }, 100);
  }, [silentPrint]);

  const handleFilterChange = useCallback((filter: OrderStatus | "all") => {
    setActiveFilter(filter);
  }, []);

  const getOrderCount = useCallback(
    (status: OrderStatus) => orders.filter((o) => o.status === status).length,
    [orders]
  );

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  // Show loading state during SSR only
  if (!isClient || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Kitchen Display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center gap-3">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Kitchen Display System
              </h1>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Printer Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPrinter}
                    onChange={(e) => handlePrinterChange(e.target.value)}
                    disabled={isPrinterLoading || printers.length === 0}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 sm:px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPrinterLoading ? (
                      <option>Loading printers...</option>
                    ) : printers.length === 0 ? (
                      <option>No printers found</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Select printer
                        </option>
                        {printers.map((printer) => (
                          <option key={printer} value={printer}>
                            {printer}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <button
                  onClick={handlePrintAll}
                  disabled={!selectedPrinter || printingRef.current}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-3 sm:px-6 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={18} className="hidden sm:block" />
                  <Printer size={16} className="sm:hidden" />
                  <span className="hidden sm:inline">Print All</span>
                  <span className="sm:hidden">Print</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {orders.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                Total Orders
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-900">
                {getOrderCount("pending")}
              </div>
              <div className="text-xs sm:text-sm text-yellow-700 mt-1">
                Pending
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                {getOrderCount("preparing")}
              </div>
              <div className="text-xs sm:text-sm text-blue-700 mt-1">
                Preparing
              </div>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-green-900">
                {getOrderCount("ready")}
              </div>
              <div className="text-xs sm:text-sm text-green-700 mt-1">
                Ready
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide">
            {(
              ["all", "pending", "preparing", "ready", "completed"] as const
            ).map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors capitalize shrink-0 text-sm sm:text-base ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
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

      <PrintLayout orders={orders} printOrderId={printOrderId} />
    </div>
  );
}
