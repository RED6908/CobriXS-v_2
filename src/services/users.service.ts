import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types/database";

export async function getUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "vendedor"
): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ role })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updateUserName(
  userId: string,
  name: string
): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ name })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function createUserProfile(
  userId: string,
  name: string,
  role: "admin" | "vendedor"
): Promise<void> {
  const { error } = await supabase.from("user_profiles").insert({
    user_id: userId,
    name,
    role,
  });
  if (error) throw error;
}
