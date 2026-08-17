import { createClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

// Environment variables or localStorage credentials or fallback demo Supabase credentials
const metaEnv = (import.meta as any).env || {};
const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('custom_supabase_url') : null;
const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('custom_supabase_key') : null;

const supabaseUrl = storedUrl || metaEnv.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = storedKey || metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demoKey';

export const isSupabaseConfigured = Boolean(
  (storedUrl || metaEnv.VITE_SUPABASE_URL) && 
  (storedKey || metaEnv.VITE_SUPABASE_ANON_KEY) &&
  !supabaseUrl.includes('xyzcompany')
);

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface AppUser {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Format a Supabase User object into an AppUser format
 */
export function formatSupabaseUser(user: SupabaseUser | null): AppUser | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    uid: user.id,
    id: user.id,
    email: user.email || null,
    displayName: meta.full_name || meta.name || user.email?.split('@')[0] || 'Traveler',
    photoURL: meta.avatar_url || meta.picture || null,
  };
}

/**
 * Sign in as a Guest (Tamu)
 */
export async function signInAsGuest(): Promise<AppUser> {
  const guestUser: AppUser = {
    uid: 'guest',
    id: 'guest',
    email: null,
    displayName: 'Tamu (Guest)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  };
  localStorage.setItem('supabase_mock_user', JSON.stringify(guestUser));
  return guestUser;
}

/**
 * Sign in using Google OAuth via Supabase (or instant Google profile fallback if keys not configured)
 */
export async function signInWithGoogle(): Promise<AppUser | null> {
  if (!isSupabaseConfigured) {
    // Instant fallback Google user session so user is never locked out
    const demoGoogleUser: AppUser = {
      uid: 'google_user_demo_' + Date.now().toString(36),
      id: 'google_user_demo_' + Date.now().toString(36),
      email: 'imamnasrulloh02@gmail.com',
      displayName: 'Imam Nasrulloh',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    };
    localStorage.setItem('supabase_mock_user', JSON.stringify(demoGoogleUser));
    return demoGoogleUser;
  }

  try {
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.warn('Supabase Google OAuth notice:', error.message);
      throw error;
    }
    return null;
  } catch (err: any) {
    console.warn('Fallback to local Google session:', err?.message);
    const demoGoogleUser: AppUser = {
      uid: 'google_user_' + Date.now().toString(36),
      id: 'google_user_' + Date.now().toString(36),
      email: 'user.google@gmail.com',
      displayName: 'Google Traveler',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    };
    localStorage.setItem('supabase_mock_user', JSON.stringify(demoGoogleUser));
    return demoGoogleUser;
  }
}

/**
 * Save custom Supabase credentials directly from UI
 */
export function saveCustomSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('custom_supabase_url', url.trim());
    localStorage.setItem('custom_supabase_key', key.trim());
    window.location.reload();
  }
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    // If Supabase not configured with live backend, fallback to local simulated auth
    if (!isSupabaseConfigured) {
      const localUser: AppUser = {
        uid: `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
        id: `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      localStorage.setItem('supabase_mock_user', JSON.stringify(localUser));
      return localUser;
    }
    throw error;
  }

  return formatSupabaseUser(data.user);
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email: string, pass: string, name?: string): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: name || email.split('@')[0],
      },
    },
  });

  if (error) {
    if (!isSupabaseConfigured) {
      const localUser: AppUser = {
        uid: `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
        id: `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
        email,
        displayName: name || email.split('@')[0],
        photoURL: null,
      };
      localStorage.setItem('supabase_mock_user', JSON.stringify(localUser));
      return localUser;
    }
    throw error;
  }

  return formatSupabaseUser(data.user);
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem('supabase_mock_user');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Supabase sign out notice:', error.message);
  }
}
