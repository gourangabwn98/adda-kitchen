// ─── src/components/BottomNav.jsx ─────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";

const YELLOW = "#f5c518";
const BLACK = "#111";

const NAV = [
  { key: "home", label: "Home", icon: "🏠", path: "/home" },
  { key: "orders", label: "All Orders", icon: "📋", path: "/orders" },
  { key: "profile", label: "Profile", icon: "👤", path: null },
];

export default function BottomNav({ active }) {
  const nav = useNavigate();
  const { logout } = useAuth();

  const handle = (item) => {
    if (!item.path) {
      if (window.confirm("Logout from kitchen?")) {
        logout();
        nav("/");
        toast.success("Logged out");
      }
      return;
    }
    nav(item.path);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 390,
        background: "#0a0a0a",
        borderTop: "1px solid #222",
        display: "flex",
        zIndex: 50,
      }}
    >
      {NAV.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => handle(item)}
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? YELLOW : "#555",
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  background: YELLOW,
                  marginTop: -2,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
