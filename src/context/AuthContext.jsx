// ─── src/context/AuthContext.jsx ──────────────────────────────────────────────
import { createContext, useState } from "react";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kitchenUser"));
    } catch {
      return null;
    }
  });

  const login = (d) => {
    setUser(d);
    localStorage.setItem("kitchenUser", JSON.stringify(d));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("kitchenUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
