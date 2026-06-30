import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "staff" | string;

interface ProfileRow {
  role: UserRole | null;
}

interface ProfileDisplayRow {
  full_name: string | null;
}

interface ProfileUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

interface ProfileInput {
  fullName?: string;
  email?: string;
  phone?: string;
}

// Keeps public.profiles connected to the Supabase Auth user after signup.
export async function ensureProfile(user: ProfileUser, input: ProfileInput = {}) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: input.fullName ?? user.user_metadata?.full_name ?? null,
      email: input.email ?? user.email ?? null,
      phone: input.phone ?? user.user_metadata?.phone ?? null,
      // New users start as staff; promote selected users to admin in Supabase.
      role: "staff",
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    console.error("Unable to create profile", error.message);
    return { error: error.message };
  }

  return { error: null };
}

export async function getCurrentUserRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    // Missing profiles can happen for older auth users, so avoid throwing here.
    .maybeSingle();

  if (error) {
    console.error("Unable to load profile role", error.message);
    return null;
  }

  if (!data) {
    // Backfill a profile row if the auth user exists but public.profiles does not.
    const { error: profileError } = await ensureProfile(user);
    return profileError ? null : "staff";
  }

  return (data as ProfileRow).role;
}

export async function getCurrentUserFullName() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Unable to load profile name", error.message);
    return null;
  }

  if (!data) {
    const { error: profileError } = await ensureProfile(user);
    return profileError ? null : user.user_metadata?.full_name ?? null;
  }

  return (data as ProfileDisplayRow).full_name;
}

export async function isCurrentUserAdmin() {
  const role = await getCurrentUserRole();
  return role === "admin";
}
