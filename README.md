# Kitchen Display System (KDS) – Next.js

A clean, modular **Kitchen Display System (KDS)** built with **Next.js**, featuring order management, real-time status updates, and auto-print logic optimized for thermal printers.

---

## 🚀 Overview

This project implements a Kitchen Display System using **Next.js (App Router)**. It displays incoming kitchen orders, allows staff to update order status, and supports auto-printing when an order becomes **Ready**.

It uses **Tailwind CSS** for styling and **Geist** as the primary font.

---

## 📁 Project Structure

```
app/
  layout.tsx        # Root layout
  page.tsx          # Main KDS UI
  globals.css       # Global styles
public/
  ...               # Static assets
```

---

## 🛠 Tech Stack

- **Next.js 14+ (App Router)**
- **React**
- **Tailwind CSS**
- **TypeScript**
- **Geist Google Font**

---

## 📦 Installation

```bash
npm install
```

---

## ▶️ Running the App

```bash
npm run dev
```

The app will be available at:
**[http://localhost:3000](http://localhost:3000)**

---

## 🧩 Root Layout Configuration

The project uses a custom layout with:

- Google Fonts (Geist)
- Global styles
- App Metadata

To update the site title or description, modify the `metadata` block inside `app/layout.tsx`.

---

## ✨ Features

### ✔️ Order Display & Workflow

- Order number
- Items & quantity
- Order time
- Status: **Pending → Preparing → Ready**
- Fast, intuitive status updates (optimistic UI)

### ✔️ Auto-Print Logic (Silent Print-Like Behavior)

- Automatically triggers `window.print()` when order becomes **Ready**
- Ready to integrate with thermal printers / print proxies
- Clean layout suitable for narrow 58mm/80mm receipts

### ✔️ Modern UI

- Clean, mobile-friendly KDS layout
- Uses Geist font for clarity
- Responsive with Tailwind

---

## 📬 Contact

If you need help modifying the project, adding API integration, or improving the print layout, feel free to ask!
