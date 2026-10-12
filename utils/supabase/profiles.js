import { createClient } from "./client";

/**
 * Fetch profile data for a candidate by user ID from Supabase PostgreSQL
 */
export async function getProfile(userId) {
  if (!userId) return null;
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Could not fetch profile from public.profiles:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Error querying profiles table:", err);
    return null;
  }
}

/**
 * Upsert profile data for a candidate in Supabase PostgreSQL
 */
export async function updateProfileData(userId, profileUpdates) {
  if (!userId) return null;
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...profileUpdates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn("Could not upsert into public.profiles:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Error updating profile in public.profiles:", err);
    return null;
  }
}
