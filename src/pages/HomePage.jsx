import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getKitchenOrders, updateStatus } from "../services/orderService.js";
import BottomNav from "../components/BottomNav.jsx";

const YELLOW = "#f5c518";
const BLACK = "#111";
const WHITE = "#fff";
const DARK = "#1a1a1a";
const GREEN = "#4caf50";
const RED = "#f44336";

const STATUS_TABS = ["New", "Preparing", "Delivered", "Completed"];

const STATUS_COLOR = {
  Placed: { bg: "#1e3a5f", color: "#64b5f6", label: "New" },
  Preparing: { bg: "#3e2a00", color: "#ffb74d", label: "Preparing" },
  Ready: { bg: "#1b3a2a", color: "#81c784", label: "Ready" },
  Delivered: { bg: "#1b3a2a", color: "#81c784", label: "Delivered" },
  Completed: { bg: "#2a2a2a", color: "#aaa", label: "Completed" },
  Cancelled: { bg: "#3a1a1a", color: "#ef9a9a", label: "Cancelled" },
};

const TYPE_COLOR = {
  Dining: { bg: "#2a1a3a", color: "#ce93d8" },
  "Take Away": { bg: "#1a2a3a", color: "#90caf9" },
};

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  return m < 1
    ? "Just now"
    : m < 60
      ? `${m} min ago`
      : `${Math.floor(m / 60)} hr ago`;
};

export default function HomePage() {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("New");
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const r = await getKitchenOrders({ limit: 100 });
      setOrders(r.data?.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, [fetch]);

  const handleStatus = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      setOrders((p) =>
        p.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
      toast.success(`→ ${newStatus}`);
    } catch {
      toast.error("Update failed");
    }
  };

  // filter by tab
  const tabMap = {
    New: "Placed",
    Preparing: "Preparing",
    // Ready: "Ready",
    Delivered: "Delivered",
    Completed: "Completed",
  };
  const active = orders.filter((o) => {
    if (tab === "New") return o.status === "Placed";
    if (tab === "Preparing") return o.status === "Preparing";
    if (tab === "Ready") return o.status === "Ready";
    if (tab === "Delivered") return o.status === "Delivered";
    if (tab === "Completed")
      return ["Completed", "Cancelled"].includes(o.status);
    return true;
  });

  const counts = {
    New: orders.filter((o) => o.status === "Placed").length,
    Preparing: orders.filter((o) => o.status === "Preparing").length,
    Ready: orders.filter((o) => o.status === "Ready").length,
    Delivered: orders.filter((o) => o.status === "Delivered").length,
    Completed: orders.filter((o) =>
      ["Completed", "Cancelled"].includes(o.status),
    ).length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BLACK,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* header */}
      <div
        style={{
          padding: "14px 18px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ color: YELLOW, fontWeight: 800, fontSize: 18 }}>
            {counts.New > 0 ? `${counts.New} Pending Orders` : "Pending Orders"}
          </div>
          <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#e91e8c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          👨‍🍳
        </div>
      </div>

      {/* status tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "14px 18px 0",
          overflowX: "auto",
        }}
      >
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              whiteSpace: "nowrap",
              padding: "7px 16px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: tab === t ? YELLOW : "#222",
              color: tab === t ? BLACK : "#888",
            }}
          >
            {t}
            {counts[t] > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: tab === t ? "rgba(0,0,0,.2)" : "#333",
                  color: tab === t ? BLACK : "#ccc",
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: 11,
                }}
              >
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* search row */}
      <div style={{ padding: "12px 18px 0", display: "flex", gap: 10 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#1a1a1a",
            borderRadius: 10,
            padding: "9px 14px",
            border: "1px solid #2a2a2a",
          }}
        >
          <span style={{ color: "#555", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Find Order Items / Order ID"
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: WHITE,
              fontSize: 12,
              flex: 1,
            }}
          />
        </div>
      </div>

      {/* orders list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px 80px" }}>
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#555",
              fontSize: 13,
            }}
          >
            Loading…
          </div>
        )}

        {!loading && active.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>👨‍🍳</div>
            <div
              style={{
                color: WHITE,
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              No Pending Orders
            </div>
            <div style={{ color: "#555", fontSize: 13, lineHeight: 1.6 }}>
              All caught up! New Orders At This Moment
              <br />
              Waiting for Customer Orders.
            </div>
            <button
              onClick={fetch}
              style={{
                marginTop: 20,
                padding: "12px 28px",
                background: YELLOW,
                color: BLACK,
                border: "none",
                borderRadius: 25,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Refresh Orders
            </button>
          </div>
        )}

        {active.map((o) => (
          <OrderCard key={o._id} order={o} onStatus={handleStatus} />
        ))}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

// ── inline OrderCard ──────────────────────────────────────────────────────────
function OrderCard({ order, onStatus }) {
  const sc = STATUS_COLOR[order.status] || STATUS_COLOR.Placed;
  const tc = TYPE_COLOR[order.orderType] || TYPE_COLOR.Dining;

  const nextStatus = {
    Placed: "Preparing",
    Preparing: "Delivered",
    Delivered: "Completed",
  }[order.status];

  const nextLabel = {
    Placed: "Start Preparing",
    Preparing: "Mark Delivered",
    // Delivered: "Complete Order",
  }[order.status];

  return (
    <div
      style={{
        background: DARK,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        border: "1px solid #2a2a2a",
      }}
    >
      {/* header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: sc.bg,
              color: sc.color,
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {sc.label}
          </span>
          <span
            style={{
              background: tc.bg,
              color: tc.color,
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {order.orderType}
          </span>
          {order.tableNo && (
            <span style={{ color: "#888", fontSize: 11 }}>
              Table {order.tableNo}
            </span>
          )}
        </div>
        <span style={{ color: "#555", fontSize: 11 }}>
          {timeAgo(order.createdAt)}
        </span>
      </div>

      {/* order id + customer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ color: YELLOW, fontWeight: 700, fontSize: 13 }}>
          {order.orderId}
        </span>
        <span style={{ color: "#888", fontSize: 12 }}>
          {order.user?.name || "Guest"}
        </span>
      </div>

      {/* items */}
      <div
        style={{
          background: "#141414",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 12,
        }}
      >
        {order.items?.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 0",
              borderBottom:
                i < order.items.length - 1 ? "1px solid #222" : "none",
              fontSize: 13,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  color: YELLOW,
                  fontWeight: 700,
                  fontSize: 12,
                  background: "#2a2000",
                  padding: "1px 7px",
                  borderRadius: 8,
                }}
              >
                {item.qty}×
              </span>
              <span style={{ color: WHITE }}>{item.name}</span>
            </div>
            <span style={{ color: "#888" }}>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {/* total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          fontSize: 13,
        }}
      >
        <span style={{ color: "#666" }}>Total</span>
        <span style={{ color: YELLOW, fontWeight: 700 }}>
          ₹{Math.round(order.total)}
        </span>
      </div>

      {/* action buttons */}
      {order.status !== "Completed" && order.status !== "Cancelled" && (
        <div style={{ display: "flex", gap: 8 }}>
          {order.status === "Placed" && (
            <button
              onClick={() => onStatus(order._id, "Cancelled")}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 25,
                border: "none",
                background: RED,
                color: WHITE,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Reject Order
            </button>
          )}
          {nextStatus && (
            <button
              onClick={() => onStatus(order._id, nextStatus)}
              style={{
                flex: 2,
                padding: "11px 0",
                borderRadius: 25,
                border: "none",
                background: nextStatus === "Completed" ? "#1D9E75" : GREEN,
                color: WHITE,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {nextLabel}
            </button>
          )}
        </div>
      )}

      {order.status === "Cancelled" && (
        <div
          style={{
            textAlign: "center",
            padding: "8px",
            color: RED,
            fontWeight: 600,
            fontSize: 13,
            background: "#2a0000",
            borderRadius: 10,
          }}
        >
          Order Cancelled
        </div>
      )}
    </div>
  );
}
