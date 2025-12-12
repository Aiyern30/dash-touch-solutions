import { Order } from "@/types/order";

export const generateInitialOrders = (): Order[] => {
  const now = Date.now();
  return [
    {
      id: "001",
      orderNumber: "#001",
      items: [
        { id: "1", name: "Nasi Lemak", quantity: 2 },
        { id: "2", name: "Teh Tarik", quantity: 2 },
        { id: "3", name: "Roti Canai", quantity: 3 },
      ],
      status: "pending",
      createdAt: new Date(now - 5 * 60000),
      updatedAt: new Date(now - 5 * 60000),
    },
    {
      id: "002",
      orderNumber: "#002",
      items: [
        { id: "4", name: "Char Kway Teow", quantity: 1 },
        { id: "5", name: "Ice Lemon Tea", quantity: 1 },
      ],
      status: "preparing",
      createdAt: new Date(now - 10 * 60000),
      updatedAt: new Date(now - 3 * 60000),
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
      createdAt: new Date(now - 15 * 60000),
      updatedAt: new Date(now - 1 * 60000),
    },
    {
      id: "004",
      orderNumber: "#004",
      items: [
        { id: "9", name: "Laksa", quantity: 1 },
        { id: "10", name: "Teh Tarik", quantity: 1 },
      ],
      status: "completed",
      createdAt: new Date(now - 20 * 60000),
      updatedAt: new Date(now - 5 * 60000),
    },
  ];
};
