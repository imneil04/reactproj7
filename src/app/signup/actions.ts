"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");

  if (
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof password !== "string" ||
    !fullName.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    redirect("/signup?error=Complete+all+required+fields.");
  }

  if (password.length < 8) {
    redirect("/signup?error=Password+must+be+at+least+8+characters.");
  }

  const requestHeaders = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestHeaders.get("origin") ??
    "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/");
  }

  redirect("/login?message=Check+your+email+to+confirm+your+account.");
}
