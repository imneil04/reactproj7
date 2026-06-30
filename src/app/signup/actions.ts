"use server";

import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/profiles";
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

  const normalizedFullName = fullName.trim();
  const normalizedEmail = email.trim();
  const normalizedPhone = phone.trim();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: normalizedFullName,
        phone: normalizedPhone,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user && data.session) {
    const { error: profileError } = await ensureProfile(data.user, {
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
    });

    if (profileError) {
      redirect(`/signup?error=${encodeURIComponent(profileError)}`);
    }

    redirect("/");
  }

  redirect("/login?message=Account+created.+Please+sign+in.");
}

