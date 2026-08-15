import { Trip } from '../types/travel';
import { ThemeColors } from '../types/theme';

const CLOUDFLARE_WORKER_URL_KEY = 'traveler_cf_worker_url';
const CLOUDFLARE_ENABLED_KEY = 'traveler_cf_enabled';

/**
 * Get current Cloudflare Worker API URL (defaults to /api/cloudflare)
 */
export function getCloudflareWorkerUrl(): string {
  const customUrl = localStorage.getItem(CLOUDFLARE_WORKER_URL_KEY);
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim().replace(/\/$/, '');
  }
  return '/api/cloudflare';
}

/**
 * Set custom Cloudflare Worker API URL
 */
export function setCloudflareWorkerUrl(url: string) {
  if (!url || url.trim().length === 0) {
    localStorage.removeItem(CLOUDFLARE_WORKER_URL_KEY);
  } else {
    localStorage.setItem(CLOUDFLARE_WORKER_URL_KEY, url.trim().replace(/\/$/, ''));
  }
}

/**
 * Is Cloudflare Database active?
 */
export function isCloudflareDbEnabled(): boolean {
  const enabled = localStorage.getItem(CLOUDFLARE_ENABLED_KEY);
  return enabled !== 'false'; // Enabled by default
}

/**
 * Set Cloudflare Database status
 */
export function setCloudflareDbEnabled(enabled: boolean) {
  localStorage.setItem(CLOUDFLARE_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Test connectivity with Cloudflare Worker & D1 Database
 */
export async function testCloudflareConnection(): Promise<{ success: boolean; engine?: string; region?: string; message: string }> {
  try {
    const baseUrl = getCloudflareWorkerUrl();
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { success: false, message: `Cloudflare Server HTTP ${res.status}` };
    }

    const data = await res.json();
    return {
      success: true,
      engine: data.engine || 'Cloudflare D1 SQL',
      region: data.region || 'Edge Local Proxy',
      message: 'Koneksi Cloudflare D1 & Worker Berhasil!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Tidak dapat terhubung ke Cloudflare: ${err.message || 'Network Error'}`
    };
  }
}

/**
 * Save or update trip in Cloudflare D1
 */
export async function saveTripToCloudflare(trip: Trip, userUid?: string): Promise<boolean> {
  if (!isCloudflareDbEnabled()) return false;
  try {
    const baseUrl = getCloudflareWorkerUrl();
    const res = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Uid': userUid || 'guest',
      },
      body: JSON.stringify(trip),
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloudflare D1 save trip notice:', err);
    return false;
  }
}

/**
 * Delete trip from Cloudflare D1
 */
export async function deleteTripFromCloudflare(tripId: string, userUid?: string): Promise<boolean> {
  if (!isCloudflareDbEnabled()) return false;
  try {
    const baseUrl = getCloudflareWorkerUrl();
    const res = await fetch(`${baseUrl}/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Uid': userUid || 'guest',
      },
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloudflare D1 delete trip notice:', err);
    return false;
  }
}

/**
 * Save user theme customization to Cloudflare D1
 */
export async function saveThemeToCloudflare(presetId: string, colors: ThemeColors, userUid?: string): Promise<boolean> {
  if (!isCloudflareDbEnabled()) return false;
  try {
    const baseUrl = getCloudflareWorkerUrl();
    const res = await fetch(`${baseUrl}/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Uid': userUid || 'guest',
      },
      body: JSON.stringify({ presetId, colors }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloudflare D1 save theme notice:', err);
    return false;
  }
}

/**
 * Get user theme customization from Cloudflare D1
 */
export async function getThemeFromCloudflare(userUid?: string): Promise<{ presetId: string; colors: ThemeColors } | null> {
  if (!isCloudflareDbEnabled()) return null;
  try {
    const baseUrl = getCloudflareWorkerUrl();
    const res = await fetch(`${baseUrl}/theme`, {
      method: 'GET',
      headers: {
        'X-User-Uid': userUid || 'guest',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.theme || null;
  } catch (err) {
    console.warn('Cloudflare D1 get theme notice:', err);
    return null;
  }
}
