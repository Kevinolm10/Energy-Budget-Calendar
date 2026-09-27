import { useState } from "react";
import { useAuth } from "@/auth/authContext";

export function LogoutButton() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logout();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}