// ─── src/pages/OTPPage.jsx ────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP, sendOTP } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";

const YELLOW = "#f5c518";
const BLACK = "#111";
const WHITE = "#fff";

export default function OTPPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const phone = sessionStorage.getItem("otpPhone") || "";
  const name = sessionStorage.getItem("otpName") || "Kitchen Staff";
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const [loading, setLoading] = useState(false);
  const refs = Array.from({ length: 6 }, () => useRef(null));

  useEffect(() => {
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp];
    n[i] = v.slice(-1);
    setOtp(n);
    if (v && i < 5) refs[i + 1].current?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return toast.error("Enter 6-digit OTP");
    try {
      setLoading(true);
      const { data } = await verifyOTP(phone, code, name);
      login(data);
      nav("/home");
      toast.success("Welcome to Kitchen! 👨‍🍳");
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BLACK,
        display: "flex",
        flexDirection: "column",
        padding: "28px 24px",
      }}
    >
      {/* back */}
      <button
        onClick={() => nav("/")}
        style={{
          background: "none",
          border: "none",
          color: "#aaa",
          fontSize: 22,
          cursor: "pointer",
          width: 36,
          marginBottom: 24,
        }}
      >
        ‹
      </button>

      <div
        style={{ color: WHITE, fontSize: 22, fontWeight: 700, marginBottom: 6 }}
      >
        Verify OTP
      </div>
      <div
        style={{
          color: "#888",
          fontSize: 13,
          marginBottom: 32,
          lineHeight: 1.6,
        }}
      >
        Enter Verification Code
        <br />
        We have sent a 6 digit code to{" "}
        <span style={{ color: YELLOW }}>+91 {phone}</span>
        <span
          onClick={async () => {
            await sendOTP(phone);
            setTimer(120);
            setOtp(Array(6).fill(""));
            toast.success("OTP resent!");
          }}
          style={{
            color: "#e91e8c",
            marginLeft: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Re-Send
        </span>
      </div>

      {/* OTP boxes */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          justifyContent: "center",
        }}
      >
        {otp.map((v, i) => (
          <input
            key={i}
            ref={refs[i]}
            value={v}
            maxLength={1}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            style={{
              width: 46,
              height: 54,
              textAlign: "center",
              border: `2px solid ${v ? YELLOW : "#333"}`,
              borderRadius: 12,
              background: "#1a1a1a",
              color: WHITE,
              fontSize: 22,
              fontWeight: 700,
              outline: "none",
            }}
          />
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          color: "#888",
          fontSize: 13,
          marginBottom: 36,
        }}
      >
        {timer > 0 ? (
          <>
            You can resend code in{" "}
            <span style={{ color: YELLOW, fontWeight: 700 }}>
              {mm}:{ss}
            </span>
          </>
        ) : (
          <span
            onClick={async () => {
              await sendOTP(phone);
              setTimer(120);
              setOtp(Array(6).fill(""));
            }}
            style={{ color: "#e91e8c", cursor: "pointer", fontWeight: 700 }}
          >
            Resend OTP
          </span>
        )}
      </div>

      <button
        onClick={handleVerify}
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
        {loading ? "Verifying…" : "CONFIRM START"}
      </button>
    </div>
  );
}
