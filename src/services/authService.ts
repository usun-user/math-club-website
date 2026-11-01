import { supabase } from "../lib/supabase";

export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({email, password});
  // You can put a "trailing comma" at the end of this list by doing "password," 
  // so that you can more easily add more parameters later, but don't have to.

  if (error) throw error;

  return data;
}

export async function login(email: string, password: string) {
  const { data, error } =
    await supabase.auth.signInWithPassword({email, password});

  if (error) throw error;

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user;
}