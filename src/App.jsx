import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";
import LoginPage from "./pages/LoginPage.jsx";
import OTPPage from "./pages/OTPPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";

const Guard = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          fontFamily: "'Segoe UI',sans-serif",
          background: "#111",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 390,
            minHeight: "100vh",
            background: "#f5f5f5",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/otp" element={<OTPPage />} />
            <Route
              path="/home"
              element={
                <Guard>
                  <HomePage />
                </Guard>
              }
            />
            <Route
              path="/orders"
              element={
                <Guard>
                  <OrdersPage />
                </Guard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
