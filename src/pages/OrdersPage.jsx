import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getKitchenOrders, updateStatus } from "../services/orderService.js";
import BottomNav from "../components/BottomNav.jsx";

const YELLOW = "#f5c518";
const BLACK = "#111";
const WHITE = "#fff";
const DARK = "#1a1a1a";
const GREEN = "#4caf50";
const RED = "#f44336";

const STATUS_COLOR = {
  Placed: { bg: "#1e3a5f", color: "#64b5f6", dot: "#378ADD" },
  Preparing: { bg: "#3e2a00", color: "#ffb74d", dot: "#BA7517" },
  Ready: { bg: "#1b3a2a", color: "#81c784", dot: "#1D9E75" },
  Completed: { bg: "#222", color: "#aaa", dot: "#666" },
  Cancelled: { bg: "#3a1a1a", color: "#ef9a9a", dot: "#f44336" },
  Delivered: { bg: "#1b3a2a", color: "#81c784", dot: "#1D9E75" },
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
      ? `${m}m ago`
      : `${Math.floor(m / 60)}h ago`;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch = useCallback(async () => {
    try {
      const r = await getKitchenOrders({ limit: 100 });
      setOrders(r.data?.orders || []);
    } catch {
      toast.error("Failed to load");
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

  const counts = {
    total: orders.length,
    pending: orders.filter((o) =>
      ["Placed", "Preparing", "Ready"].includes(o.status),
    ).length,
    completed: orders.filter((o) => o.status === "Completed").length,
    cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      !q ||
      o.orderId?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.items?.some((i) => i.name.toLowerCase().includes(q))
    );
  });

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
      <div style={{ padding: "14px 18px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <div style={{ color: WHITE, fontWeight: 800, fontSize: 18 }}>
            {counts.completed} Orders Completed
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: GREEN,
                marginTop: 6,
              }}
            />
            <span style={{ color: GREEN, fontSize: 11, fontWeight: 600 }}>
              Live
            </span>
          </div>
        </div>

        {/* mini stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            { l: "Total", v: counts.total, c: "#aaa" },
            { l: "Active", v: counts.pending, c: YELLOW },
            { l: "Done", v: counts.completed, c: GREEN },
            { l: "Cancelled", v: counts.cancelled, c: RED },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                flex: 1,
                background: DARK,
                borderRadius: 8,
                padding: "8px 10px",
                textAlign: "center",
                border: "1px solid #222",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>
                {s.v}
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: DARK,
            borderRadius: 10,
            padding: "9px 14px",
            border: "1px solid #2a2a2a",
            marginBottom: 4,
          }}
        >
          <span style={{ color: "#555" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find Order ID / Items / Customer"
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

      {/* list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 18px 80px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#555" }}>
            Loading…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#555",
              fontSize: 13,
            }}
          >
            No orders found
          </div>
        )}
        {filtered.map((o) => (
          <AllOrderCard key={o._id} order={o} onStatus={handleStatus} />
        ))}
      </div>

      <BottomNav active="orders" />
    </div>
  );
}

// ── AllOrderCard ──────────────────────────────────────────────────────────────
function AllOrderCard({ order, onStatus }) {
  const sc = STATUS_COLOR[order.status] || STATUS_COLOR.Placed;
  const tc = TYPE_COLOR[order.orderType] || TYPE_COLOR.Dining;

  return (
    <div
      style={{
        background: DARK,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        border: "1px solid #2a2a2a",
      }}
    >
      {/* top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: YELLOW, fontWeight: 700, fontSize: 12 }}>
            {order.orderId}
          </span>
          <span
            style={{
              background: tc.bg,
              color: tc.color,
              padding: "2px 8px",
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {order.orderType}
          </span>
          {order.tableNo && (
            <span style={{ color: "#666", fontSize: 10 }}>
              T{order.tableNo}
            </span>
          )}
        </div>
        <span style={{ color: "#555", fontSize: 10 }}>
          {timeAgo(order.createdAt)}
        </span>
      </div>

      {/* customer + status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#888", fontSize: 12 }}>
          {order.user?.name || "Guest"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: sc.dot,
            }}
          />
          <span
            style={{
              background: sc.bg,
              color: sc.color,
              padding: "2px 8px",
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* items */}
      <div style={{ marginBottom: 10 }}>
        {order.items?.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#bbb",
              padding: "3px 0",
              borderBottom:
                i < order.items.length - 1 ? "1px solid #222" : "none",
            }}
          >
            <span>
              <span style={{ color: YELLOW, fontWeight: 700 }}>
                {item.qty}×
              </span>{" "}
              {item.name}
            </span>
            <span style={{ color: "#666" }}>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {/* total + actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: YELLOW, fontWeight: 700, fontSize: 13 }}>
          ₹{Math.round(order.total)}
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          {order.status === "Placed" && (
            <>
              <button
                onClick={() => onStatus(order._id, "Cancelled")}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: "none",
                  background: "rgba(244,67,54,.15)",
                  color: RED,
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Reject Orders
              </button>
              <button
                onClick={() => onStatus(order._id, "Preparing")}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: "none",
                  background: "rgba(76,175,80,.15)",
                  color: GREEN,
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Accept Orders
              </button>
            </>
          )}
          {order.status === "Preparing" && (
            <button
              onClick={() => onStatus(order._id, "Ready")}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "none",
                background: "rgba(245,197,24,.15)",
                color: YELLOW,
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Mark Ready
            </button>
          )}
          {order.status === "Ready" && (
            <button
              onClick={() => onStatus(order._id, "Completed")}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "none",
                background: "rgba(29,158,117,.15)",
                color: "#1D9E75",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
