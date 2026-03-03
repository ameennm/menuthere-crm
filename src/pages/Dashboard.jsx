import { useState, useMemo } from "react";
import {
  DollarSign,
  Clock,
  Users,
  Flame,
  Coffee,
  GlassWater,
  Hotel,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell } from "recharts"; // Keeping only Pie chart for mobile performance
import TopBar from "../components/TopBar";
import { getDashboardStats } from "../store/customerStore";

const PIE_COLORS = ["#22d3ee", "#34d399", "#7c5cfc"];

function formatCurrency(val) {
  return "₹" + val.toLocaleString("en-IN");
}

export default function Dashboard({ onRefresh }) {
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const stats = useMemo(
    () => getDashboardStats(dateRange, customFrom, customTo),
    [dateRange, customFrom, customTo],
  );

  const pieData = [
    { name: "Cafe", value: stats.byRestaurant.cafe },
    { name: "Juice Shop", value: stats.byRestaurant["juice-shop"] },
    { name: "Hotel", value: stats.byRestaurant.hotel },
  ].filter((d) => d.value > 0);

  return (
    <>
      <TopBar title="Dashboard" subtitle="Business Overview" onRefresh={onRefresh}>
        <Link
          to="/customers/new"
          className="btn btn-primary btn-sm"
          style={{ padding: "10px 14px", borderRadius: 50 }}
        >
          <Plus size={18} /> <span className="desktop-only">Add Customer</span>
        </Link>
      </TopBar>

      <div className="page-content">
        {/* Mobile Swipeable Date Tabs */}
        <div className="date-tabs" style={{ marginBottom: 20 }}>
          {["all", "today", "week", "month", "custom"].map((tab) => (
            <button
              key={tab}
              className={`date-tab ${dateRange === tab ? "active" : ""}`}
              onClick={() => setDateRange(tab)}
            >
              {tab === "all"
                ? "All Time"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {dateRange === "custom" && (
          <div
            className="custom-date-range"
            style={{
              marginBottom: 20,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              From:
            </span>
            <input
              type="date"
              className="form-input"
              style={{ padding: "8px 12px" }}
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              To:
            </span>
            <input
              type="date"
              className="form-input"
              style={{ padding: "8px 12px" }}
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </div>
        )}

        {/* Unified Mobile Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card green" style={{ gridColumn: "1 / -1" }}>
            <div className="stat-card-header">
              <span className="stat-card-label">Total Sales</span>
              <div className="stat-card-icon green">
                <DollarSign size={18} />
              </div>
            </div>
            <div
              className="stat-card-value"
              style={{ color: "var(--accent-green)" }}
            >
              {formatCurrency(stats.totalSales)}
            </div>
            <div className="stat-card-sub">
              {stats.paidCount} paid customers
            </div>
          </div>

          <div className="stat-card orange" style={{ gridColumn: "1 / -1" }}>
            <div className="stat-card-header">
              <span className="stat-card-label">Pending</span>
              <div className="stat-card-icon orange">
                <Clock size={18} />
              </div>
            </div>
            <div
              className="stat-card-value"
              style={{ color: "var(--accent-orange)" }}
            >
              {formatCurrency(stats.totalPending)}
            </div>
            <div className="stat-card-sub">
              {stats.pendingCount} pending payments
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-card-header">
              <span className="stat-card-label">Clients</span>
              <div className="stat-card-icon purple">
                <Users size={18} />
              </div>
            </div>
            <div className="stat-card-value">{stats.totalCustomers}</div>
          </div>

          <div className="stat-card red">
            <div className="stat-card-header">
              <span className="stat-card-label">Hot Leads</span>
              <div className="stat-card-icon red">
                <Flame size={18} />
              </div>
            </div>
            <div className="stat-card-value">{stats.hotLeads}</div>
          </div>
        </div>

        {/* Dashboard Sectioning for Desktop */}
        <div className="dashboard-grid desktop-only">
          <div
            className="card"
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: 24,
              padding: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                justifyContent: "center",
              }}
            >
              <h3 style={{ fontSize: 24, fontWeight: 700 }}>Client Mix</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Coffee color="var(--accent-cyan)" />{" "}
                <span style={{ fontSize: 16 }}>
                  {stats.byRestaurant.cafe} Cafes
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <GlassWater color="var(--accent-green)" />{" "}
                <span style={{ fontSize: 16 }}>
                  {stats.byRestaurant["juice-shop"]} Juice Shops
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Hotel color="var(--accent-primary)" />{" "}
                <span style={{ fontSize: 16 }}>
                  {stats.byRestaurant.hotel} Hotels
                </span>
              </div>
            </div>
            <div style={{ width: 200, height: 200 }}>
              {pieData.length > 0 && (
                <PieChart width={200} height={200}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </div>
          </div>
        </div>

        {/* Pending Payments List */}
        <div className="card">
          <div className="card-header">
            <h3>⏳ Needs Attention</h3>
            <span className="badge badge-pending">
              {stats.pendingCount} unpaid
            </span>
          </div>
          <div className="card-body" style={{ padding: "0 16px 16px" }}>
            {stats.pendingPayments.length > 0 ? (
              <div className="pending-list" style={{ marginTop: 16 }}>
                {stats.pendingPayments.map((c) => (
                  <div
                    key={c.id}
                    className="pending-item"
                    style={{ padding: 12 }}
                  >
                    <div className="pending-item-info">
                      <div
                        className="pending-avatar"
                        style={{ width: 36, height: 36 }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div
                          className="pending-item-name"
                          style={{ fontSize: 14 }}
                        >
                          {c.name}
                        </div>
                        <div
                          className="pending-item-details"
                          style={{ fontSize: 11 }}
                        >
                          {c.location}
                        </div>
                      </div>
                    </div>
                    <div
                      className="pending-item-amount"
                      style={{ fontSize: 15 }}
                    >
                      {formatCurrency(c.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h4>All caught up! 🎉</h4>
                <p>No pending payments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
