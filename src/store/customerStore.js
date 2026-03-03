// ============================================================
// Customer Store — Optimistic UI + Background D1 Sync
//
// How it works:
// 1. Local state (in-memory + localStorage) is the source of truth for the UI
// 2. Every mutation instantly updates local state → UI re-renders immediately
// 3. API call fires in the background to sync with D1
// 4. On app load, we fetch from D1 to hydrate local state
// ============================================================

import { customerAPI, dashboardAPI } from "./api";

const STORAGE_KEY = "menuthere_customers";
let listeners = [];
let customers = loadLocal();
let isHydrated = false;

// ---- Local persistence ----
function loadLocal() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

// ---- Reactive subscriptions ----
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function notify() {
  saveLocal();
  listeners.forEach((fn) => fn(customers));
}

// ---- Generate ID ----
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export async function hydrate() {
  if (isHydrated) return;
  try {
    const remote = await customerAPI.getAll();
    if (Array.isArray(remote)) {
      customers = remote;
      notify();
    }
    isHydrated = true;
  } catch (err) {
    console.warn("Could not fetch from API, using local data:", err.message);
    isHydrated = true;
  }
}

// Force a fresh fetch from DB regardless of hydration state
export async function forceHydrate() {
  try {
    const remote = await customerAPI.getAll();
    if (Array.isArray(remote)) {
      customers = remote;
      notify();
    }
  } catch (err) {
    console.warn("Force refresh failed, keeping existing data:", err.message);
    throw err;
  }
}

// ---- CRUD (optimistic) ----

export function getCustomers() {
  return [...customers];
}

export function addCustomer(data) {
  const now = new Date().toISOString();
  const newCustomer = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  // 1. Instant local update
  customers = [newCustomer, ...customers];
  notify();

  // 2. Background sync
  customerAPI
    .create(data)
    .then((remote) => {
      // Replace temp record with server record (gets server ID)
      customers = customers.map((c) =>
        c.id === newCustomer.id ? { ...remote } : c,
      );
      saveLocal();
    })
    .catch((err) => {
      console.error("Background sync failed (create):", err);
    });

  return newCustomer;
}

export function updateCustomer(id, updates) {
  // 1. Instant local update
  const now = new Date().toISOString();
  let updated = null;
  customers = customers.map((c) => {
    if (c.id === id) {
      updated = { ...c, ...updates, updatedAt: now };
      return updated;
    }
    return c;
  });
  notify();

  // 2. Background sync
  customerAPI.update(id, updates).catch((err) => {
    console.error("Background sync failed (update):", err);
  });

  return updated;
}

export function deleteCustomer(id) {
  // 1. Instant local removal
  customers = customers.filter((c) => c.id !== id);
  notify();

  // 2. Background sync
  customerAPI.delete(id).catch((err) => {
    console.error("Background sync failed (delete):", err);
  });

  return customers;
}

export function getCustomerById(id) {
  return customers.find((c) => c.id === id) || null;
}

// ---- Dashboard helpers (work on local data for instant results) ----

export function getFilteredCustomers(dateRange, customFrom, customTo) {
  const now = new Date();
  const all = getCustomers();

  if (dateRange === "all") return all;

  let startDate;
  if (dateRange === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (dateRange === "week") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
  } else if (dateRange === "month") {
    startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (dateRange === "custom" && customFrom && customTo) {
    startDate = new Date(customFrom);
    const endDate = new Date(customTo);
    endDate.setHours(23, 59, 59, 999);
    return all.filter((c) => {
      const d = new Date(c.createdAt);
      return d >= startDate && d <= endDate;
    });
  }

  if (!startDate) return all;
  return all.filter((c) => new Date(c.createdAt) >= startDate);
}

export function getDashboardStats(dateRange, customFrom, customTo) {
  const filtered = getFilteredCustomers(dateRange, customFrom, customTo);
  const all = getCustomers();

  // Exclude not-interested: they are lost leads, don't count in financials
  const active = (c) => c.status !== 'not-interested';

  const totalSales = filtered
    .filter((c) => active(c))
    .reduce((sum, c) => sum + (parseFloat(c.paidAmount) || 0), 0);

  const totalPending = all
    .filter((c) => active(c) && c.paymentStatus === "pending")
    .reduce((sum, c) => {
      const pending = (parseFloat(c.amount) || 0) - (parseFloat(c.paidAmount) || 0);
      return sum + (pending > 0 ? pending : 0);
    }, 0);

  const pendingCount = all.filter((c) => active(c) && c.paymentStatus === "pending").length;
  const paidCount = filtered.filter((c) => active(c) && c.paymentStatus === "paid").length;
  const hotLeads = filtered.filter((c) => c.status === "hot").length;
  const warmLeads = filtered.filter((c) => c.status === "warm").length;
  const lostLeads = filtered.filter((c) => c.status === "not-interested").length;
  const totalCustomers = filtered.filter(active).length;

  const byRestaurant = {
    restaurant: filtered.filter((c) => c.restaurantType === "restaurant")
      .length,
    cafe: filtered.filter((c) => c.restaurantType === "cafe").length,
    "juice-shop": filtered.filter((c) => c.restaurantType === "juice-shop")
      .length,
    hotel: filtered.filter((c) => c.restaurantType === "hotel").length,
  };

  // Daily sales for chart (last 7 days)
  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const daySales = all
      .filter(
        (c) =>
          active(c) &&
          c.createdAt &&
          c.createdAt.startsWith(dayStr),
      )
      .reduce((sum, c) => sum + (parseFloat(c.paidAmount) || 0), 0);
    dailySales.push({ date: dayLabel, sales: daySales });
  }

  // Pending payments list — exclude not-interested
  const pendingPayments = all
    .filter((c) => c.status !== 'not-interested' && c.paymentStatus === "pending")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    totalSales,
    totalPending,
    pendingCount,
    paidCount,
    hotLeads,
    warmLeads,
    lostLeads,
    totalCustomers,
    byRestaurant,
    dailySales,
    pendingPayments,
  };
}
