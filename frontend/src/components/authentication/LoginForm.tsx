import { Link } from "react-router";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";

// const loginSchema = z.object({
//   email: z.email("Enter a valid email"),
//   password: z.string().min(1, "Password is required"),
// });

// export type LoginValues = z.infer<typeof loginSchema>

// type LoginFormProps = {
//   onSubmit: (values: LoginValues) => Promise<void>;
// };


export function LoginForm() {
  return (
    <form className="space-y-4">
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
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
        Remember me
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Log in
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