import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Guards admin-only routes. If `isAdminLoggedIn` is not set in localStorage,
 * redirects to /admin-login (preserving where the user wanted to go).
 */
export function AdminProtected({ children }) {
  const location = useLocation();
  const ok = typeof window !== "undefined" && localStorage.getItem("isAdminLoggedIn") === "true";
  if (!ok) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/**
 * Guards exhibitor-only routes. If `isExhibitorLoggedIn` is not set,
 * redirects to /exhibitor-login.
 */
export function ExhibitorProtected({ children }) {
  const location = useLocation();
  const ok = typeof window !== "undefined" && localStorage.getItem("isExhibitorLoggedIn") === "true";
  if (!ok) {
    return <Navigate to="/exhibitor-login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
