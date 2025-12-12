# Kitchen Display System (KDS) – Next.js

A robust, modular **Kitchen Display System (KDS)** built with **Next.js**, featuring real-time order management, status updates, and seamless silent printing integration for kitchen/thermal printers.

---

## 🚀 Overview

This project implements a professional Kitchen Display System using **Next.js (App Router)**. It displays incoming kitchen orders, allows staff to update order statuses, and supports **silent printing** via a dedicated backend print service.

The UI is styled with **Tailwind CSS** and uses the **Geist** font for clarity and modern aesthetics.

---

## 📁 Project Structure

```
app/
  layout.tsx           # Root layout (includes Toaster for notifications)
  page.tsx             # Main KDS UI
  globals.css          # Global styles
components/
  PrintLayout.tsx      # Print layout for orders
  OrderCard.tsx        # Order card component
print-service/
  server.js            # Silent printing backend (Node.js/Express)
  prints/              # Folder for generated PDF receipts
public/
  ...                  # Static assets
```

---

## 🛠 Tech Stack

- **Next.js 14+ (App Router)**
- **React**
- **Tailwind CSS**
- **TypeScript**
- **Geist Google Font**
- **Node.js (Express) for print backend**
- **puppeteer** and **pdf-to-printer** for PDF generation and printing
- **sonner** for toast notifications

---

## 📦 Installation

```bash
npm install
```

---

## ▶️ Running the App

### 1. Start the Print Service (Backend)

The silent printing backend is located in the `print-service` folder. It handles PDF generation and direct printing to local/connected printers.

```bash
cd print-service
npm install
node server.js
```

- The backend will run on [http://localhost:3001](http://localhost:3001)
- All generated PDFs are saved in `print-service/prints/` with a timestamped filename.

### 2. Start the Next.js App (Frontend)

```bash
npm run dev
```

The app will be available at:  
**[http://localhost:3000](http://localhost:3000)**

---

## ✨ Features

### ✔️ Order Display & Workflow

- Order number, items, quantity, and time
- Status workflow: **Pending → Preparing → Ready**
- Fast, intuitive status updates (optimistic UI)

### ✔️ Silent Printing Integration

- **Auto-print** when order status becomes **Ready**
- "Print All" button for batch printing
- Printer selection from available local printers (via backend)
- Silent PDF generation and printing (no dialogs for real printers)
- All print jobs are logged and receipts are saved in `/prints`
- Graceful error handling and toast notifications

### ✔️ Modern UI

- Clean, mobile-friendly KDS layout
- Responsive design with Tailwind CSS
- Geist font for clarity and readability
- Toast notifications for print status and errors

---

## 🖨️ Silent Print Backend (`print-service/server.js`)

- Node.js Express server for silent printing
- Uses **puppeteer** to render HTML to PDF
- Uses **pdf-to-printer** to send PDFs directly to printers
- Lists available printers via `/printers` endpoint
- Receives print jobs via `/print` endpoint
- Serves generated PDFs via `/prints/:filename`
- All PDFs are saved with a timestamped filename for traceability

---

## 🧩 Root Layout Configuration

The project uses a custom layout with:

- Google Fonts (Geist)
- Global styles
- App Metadata
- Toaster notifications

To update the site title or description, modify the `metadata` block inside `app/layout.tsx`.

---

## 📬 Contact

For support, feature requests, or integration help, please open an issue or contact the maintainer.
