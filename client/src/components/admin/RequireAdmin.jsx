import { Navigate, Outlet } from "react-router-dom";

export default function RequireAdmin() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const rawUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!token || !rawUser) return <Navigate to="/login" replace />;

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    return <Navigate to="/login" replace />;
  }

  const isAdmin =
    Number(user?.role) === 1 ||
    user?.role === "admin" ||
    user?.roles?.some((r) => r?.name === "admin" || Number(r?.id) === 1);

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
