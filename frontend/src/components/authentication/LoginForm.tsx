import { Link, useLocation, useNavigate } from "react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/auth/authContext";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      const from = location.state?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <a href="#" className="text-sm text-slate-500 hover:text-slate-900 hover:underline">
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
        Remember me
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {submitting ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-slate-500">
        No account?{" "}
        <Link to="/register" className="font-medium text-slate-900 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}