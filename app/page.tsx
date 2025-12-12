"use client";

import React, { useState, useCallback, useRef } from "react";
import { Printer } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { generateInitialOrders } from "@/data/orders";
import { OrderCard } from "@/components/OrderCard";
import { PrintLayout } from "@/components/PrintLayout";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [printOrderId, setPrintOrderId] = useState<string | undefined>();
  const printingRef = useRef(false);

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

  // Memoized handler with double-print prevention
  const handleStatusChange = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date() }
            : order
        )
      );

      // Auto-print when order becomes ready (with guard)
      if (
        newStatus === "ready" &&
        !printingRef.current &&
        printOrderId !== orderId
      ) {
        printingRef.current = true;
        setPrintOrderId(orderId);

        setTimeout(() => {
          window.print();
          setPrintOrderId(undefined);
          printingRef.current = false;
        }, 150);
      }
    },
    [printOrderId]
  );

  const handlePrintOrder = useCallback((orderId: string) => {
    if (printingRef.current) return;

    printingRef.current = true;
    setPrintOrderId(orderId);

    setTimeout(() => {
      window.print();
      setPrintOrderId(undefined);
      printingRef.current = false;
    }, 100);
  }, []);

  const handlePrintAll = useCallback(() => {
    if (printingRef.current) return;

    printingRef.current = true;
    setPrintOrderId(undefined);

    setTimeout(() => {
      window.print();
      printingRef.current = false;
    }, 100);
  }, []);

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
              <button
                onClick={handlePrintAll}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-3 sm:px-6 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                <Printer size={18} className="hidden sm:block" />
                <Printer size={16} className="sm:hidden" />
                <span className="hidden sm:inline">Print All</span>
                <span className="sm:hidden">Print</span>
              </button>
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
              <div className="text-xs sm:text-sm text-green-700 mt-1">Ready</div>
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
