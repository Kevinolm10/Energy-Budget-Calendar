import { Link } from "react-router";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none " +
  "placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

export function RegisterForm() {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" className={inputClass} />
      </div>

      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">
          Confirm password
        </label>
        <input id="confirm-password" type="password" autoComplete="new-password" placeholder="••••••••" className={inputClass} />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Create account
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