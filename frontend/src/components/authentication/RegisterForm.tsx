import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { register } from "@/api/auth";
import { useAuth } from "@/auth/authContext";

const inputClass = "block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

export function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ email, password });
      await login({ email, password });s
      navigate("/", { replace: true });
    } catch {
      setError("Could not create account. The email may already be in use.");
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
          className={inputClass}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className={inputClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {/* <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">
          Confirm password
        </label>
        <input id="confirm-password" type="password" autoComplete="new-password" placeholder="••••••••" className={inputClass} />
      </div> */}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="... disabled:opacity-50">
        {submitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-slate-900 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}