"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Standard Server Action for Password-based Sign In
 * Compatible with standard HTML form submissions and Next.js progressive enhancement
 */
export async function signInAction(formData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const next = formData.get("next")?.toString() || "/dashboard";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return redirect(next);
}

/**
 * Standard Server Action for Candidate Sign Up
 */
export async function signUpAction(formData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("fullName")?.toString() || "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const origin = headers().get("origin") || "";
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.session) {
    return redirect("/dashboard");
  }

  return { 
    success: true, 
    message: "Confirmation link sent to your email. Please check your inbox." 
  };
}

/**
 * Standard Server Action for Sign Out
 */
export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
}

/**
 * Standard Server Action for Forgot Password
 */
export async function forgotPasswordAction(formData) {
  const email = formData.get("email")?.toString();

  if (!email) {
    return { error: "Email is required." };
  }

  const origin = headers().get("origin") || "";
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Password reset link has been dispatched to your email.",
  };
}

/**
 * Standard Server Action for In-App / Recovery Password Update
 */
export async function updatePasswordAction(formData) {
  const password = formData.get("password")?.toString();

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Password updated successfully.",
  };
}
