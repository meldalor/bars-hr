import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "./session.js";

// Гард приватной части: без токена все /app/* уводим на логин.
export default function RequireAuth() {
    return getToken() ? <Outlet /> : <Navigate to="/login" replace />;
}
