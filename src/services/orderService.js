// ─── src/services/orderService.js ────────────────────────────────────────────
import api from "./api.js";

export const getAllOrders = (params) => api.get("/orders/my", { params });
// kitchen uses admin endpoint to see ALL orders
export const getKitchenOrders = (params) =>
  api.get("/admin/orders", { params });
export const updateStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status });
