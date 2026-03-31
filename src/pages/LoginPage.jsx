// ─── src/pages/LoginPage.jsx ──────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTP } from "../services/authService.js";
import toast from "react-hot-toast";

const YELLOW = "#f5c518";
const BLACK = "#111";
const WHITE = "#fff";

export default function LoginPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (phone.length < 10) return toast.error("Enter valid phone number");
    try {
      setLoading(true);
      await sendOTP(phone);
      sessionStorage.setItem("otpPhone", phone);
      sessionStorage.setItem("otpName", name || "Kitchen Staff");
      nav("/otp");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: BLACK,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* top strip */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: "#e91e8c",
            borderRadius: 8,
            padding: "4px 10px",
            color: WHITE,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 1,
          }}
        >
          আড্ডা
        </div>
        <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 2 }}>
          KITCHEN DISPLAY
        </div>
      </div>

      {/* chef image */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          minHeight: 260,
        }}
      >
        <img
          src="/chef.png"
          alt="Chef"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
            opacity: 0.55,
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {/* gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 30%, #111 100%)",
          }}
        />
        {/* chef icon fallback */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 90, opacity: 0.15 }}>👨‍🍳</div>
        </div>
      </div>

      {/* bottom card */}
      <div style={{ background: BLACK, padding: "24px 24px 40px", zIndex: 2 }}>
        <div
          style={{
            color: WHITE,
            fontSize: 26,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 6,
          }}
        >
          Manage
          <br />
          Orders Faster
        </div>
        <div
          style={{
            color: "#888",
            fontSize: 12,
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Accept, Prepare And Deliver Orders In
          <br />
          Real Time
        </div>

        {/* name */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              color: "#999",
              fontSize: 11,
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            Enter Your Name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 12,
              border: "1px solid #333",
              background: "#1a1a1a",
              color: WHITE,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* phone */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              color: "#999",
              fontSize: 11,
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            Phone Number
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                padding: "13px 14px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "#1a1a1a",
                color: WHITE,
                fontSize: 14,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              🇮🇳 <span style={{ color: "#aaa" }}>+91</span>
            </div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              placeholder="123 456 7890"
              type="tel"
              style={{
                flex: 1,
                padding: "13px 16px",
                borderRadius: 12,
                border: "1px solid #333",
                background: "#1a1a1a",
                color: WHITE,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <button
          onClick={handle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 30,
            border: "none",
            background: loading ? "#555" : YELLOW,
            color: BLACK,
            fontWeight: 800,
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending…" : "CONTINUE"}
        </button>
      </div>
    </div>
  );
}
