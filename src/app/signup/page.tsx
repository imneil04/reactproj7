import Link from "next/link";
import { signup } from "@/app/signup/actions";

interface SignupPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Stockroom
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your details to get started.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        <form action={signup} className="space-y-5">
          <SignupInput id="fullName" label="Full name" type="text" autoComplete="name" />
          <SignupInput id="email" label="Email" type="email" autoComplete="email" />
          <SignupInput id="phone" label="Phone number" type="tel" autoComplete="tel" />
          <SignupInput
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            minLength={8}
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-950 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

interface SignupInputProps {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "password";
  autoComplete: string;
  minLength?: number;
}

function SignupInput({
  id,
  label,
  type,
  autoComplete,
  minLength,
}: SignupInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  );
}
