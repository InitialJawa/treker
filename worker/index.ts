/**
 * Cloudflare Worker Backend for Traveler Trip Planner
 * High performance Edge REST API for Cloudflare D1 SQL Database + Static UI Asset Serving
 */
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
// @ts-ignore
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON || '{}');

export interface Env {
  DB: D1Database;
  CACHE_KV?: KVNamespace;
  __STATIC_CONTENT?: any;
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
  ENVIRONMENT?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Uid',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Handle OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 1. Check if this is an API Route
    const isApiRequest = url.pathname.startsWith('/api/') || url.pathname === '/api' || url.pathname === '/health';

    if (isApiRequest) {
      // Ping / Health Check
      if (url.pathname === '/health' || url.pathname === '/api/health' || url.pathname === '/api/cloudflare/health') {
        return jsonResponse({
          status: 'ok',
          app: 'Treker - Traveler Trip Planner API',
          engine: 'Cloudflare Workers + D1 Database',
          database: 'Iteneradb',
          region: request.cf?.colo || 'EDGE',
          timestamp: new Date().toISOString(),
          availableEndpoints: [
            'GET  /api/cloudflare/health',
            'GET  /api/cloudflare/trips',
            'POST /api/cloudflare/trips',
            'DELETE /api/cloudflare/trips/:id',
            'GET  /api/cloudflare/theme',
            'POST /api/cloudflare/theme'
          ]
        });
      }

      // Extract User UID from Authorization header or X-User-Uid header
      const authHeader = request.headers.get('Authorization');
      const userUidHeader = request.headers.get('X-User-Uid');
      const userId = userUidHeader || (authHeader ? authHeader.replace('Bearer ', '') : 'guest');

      // Normalize path to support both /api/cloudflare/trips and /trips or /api/trips
      const path = url.pathname.replace(/^\/api\/cloudflare/, '').replace(/^\/api/, '');

      try {
        // GET /trips - Fetch all trips for user
        if (path === '/trips' && request.method === 'GET') {
          if (!env.DB) {
            return jsonResponse({ error: 'Cloudflare D1 binding (DB) not configured.' }, 500);
          }
          const { results } = await env.DB.prepare(
            `SELECT * FROM trips WHERE userId = ? OR collaborators LIKE ? ORDER BY createdAt DESC`
          ).bind(userId, `%${userId}%`).all();

          const trips = results.map((t: any) => ({
            ...t,
            isFavorite: Boolean(t.isFavorite),
            isPublicTemplate: Boolean(t.isPublicTemplate),
            collaborators: t.collaborators ? JSON.parse(t.collaborators) : [],
            memberIds: t.memberIds ? JSON.parse(t.memberIds) : [],
          }));

          return jsonResponse({ success: true, trips, count: trips.length });
        }

        // POST /trips - Save or Update Trip
        if (path === '/trips' && request.method === 'POST') {
          const body = await request.json() as any;
          const {
            id, title, destination, startDate, endDate, totalBudget,
            currency, coverImage, status, isFavorite, isPublicTemplate, collaborators, memberIds
          } = body;

          if (!id || !title) {
            return jsonResponse({ error: 'Missing id or title' }, 400);
          }

          await env.DB.prepare(`
            INSERT INTO trips (id, userId, title, destination, startDate, endDate, totalBudget, currency, coverImage, status, isFavorite, isPublicTemplate, collaborators, memberIds, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              title=excluded.title,
              destination=excluded.destination,
              startDate=excluded.startDate,
              endDate=excluded.endDate,
              totalBudget=excluded.totalBudget,
              currency=excluded.currency,
              coverImage=excluded.coverImage,
              status=excluded.status,
              isFavorite=excluded.isFavorite,
              isPublicTemplate=excluded.isPublicTemplate,
              collaborators=excluded.collaborators,
              memberIds=excluded.memberIds,
              updatedAt=CURRENT_TIMESTAMP
          `).bind(
            id,
            userId,
            title,
            destination || '',
            startDate || '',
            endDate || '',
            totalBudget || 0,
            currency || 'IDR',
            coverImage || '',
            status || 'planning',
            isFavorite ? 1 : 0,
            isPublicTemplate ? 1 : 0,
            JSON.stringify(collaborators || []),
            JSON.stringify(memberIds || [])
          ).run();

          return jsonResponse({ success: true, id });
        }

        // DELETE /trips/:id - Delete Trip
        if (path.startsWith('/trips/') && request.method === 'DELETE') {
          const tripId = path.split('/')[2];
          if (!tripId) return jsonResponse({ error: 'Missing tripId' }, 400);

          await env.DB.prepare(`DELETE FROM trips WHERE id = ?`).bind(tripId).run();
          await env.DB.prepare(`DELETE FROM itinerary_days WHERE tripId = ?`).bind(tripId).run();
          await env.DB.prepare(`DELETE FROM itinerary_items WHERE tripId = ?`).bind(tripId).run();
          await env.DB.prepare(`DELETE FROM places WHERE tripId = ?`).bind(tripId).run();
          await env.DB.prepare(`DELETE FROM expenses WHERE tripId = ?`).bind(tripId).run();

          return jsonResponse({ success: true, deletedTripId: tripId });
        }

        // GET /theme - Get User Custom Theme
        if (path === '/theme' && request.method === 'GET') {
          const { results } = await env.DB.prepare(
            `SELECT * FROM user_themes WHERE userId = ?`
          ).bind(userId).all();

          if (!results || results.length === 0) {
            return jsonResponse({ success: true, theme: null });
          }

          const row: any = results[0];
          return jsonResponse({
            success: true,
            theme: {
              presetId: row.presetId,
              colors: JSON.parse(row.colorsJson)
            }
          });
        }

        // POST /theme - Save User Custom Theme
        if (path === '/theme' && request.method === 'POST') {
          const { presetId, colors } = await request.json() as any;

          await env.DB.prepare(`
            INSERT INTO user_themes (userId, presetId, colorsJson, updatedAt)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(userId) DO UPDATE SET
              presetId=excluded.presetId,
              colorsJson=excluded.colorsJson,
              updatedAt=CURRENT_TIMESTAMP
          `).bind(userId, presetId || 'custom', JSON.stringify(colors)).run();

          return jsonResponse({ success: true, userId });
        }

        return jsonResponse({ error: 'Endpoint not found', path: url.pathname }, 404);
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'Cloudflare D1 Server Error' }, 500);
      }
    }

    // 2. Serve Static Frontend React UI Assets (HTML, CSS, JS, Images, SPA routing)
    try {
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        return await env.ASSETS.fetch(request);
      }

      return await getAssetFromKV(
        {
          request,
          waitUntil: (promise: Promise<any>) => ctx?.waitUntil?.(promise),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
          mapRequestToAsset: (req: Request) => {
            const reqUrl = new URL(req.url);
            // Single Page Application routing: if pathname has no file extension, serve index.html
            if (!reqUrl.pathname.includes('.')) {
              return mapRequestToAsset(new Request(`${reqUrl.origin}/index.html`, req));
            }
            return mapRequestToAsset(req);
          },
        }
      );
    } catch (e) {
      // Fallback to index.html for React SPA Client Side Router
      try {
        return await getAssetFromKV(
          {
            request,
            waitUntil: (promise: Promise<any>) => ctx?.waitUntil?.(promise),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: assetManifest,
            mapRequestToAsset: (req: Request) => {
              const reqUrl = new URL(req.url);
              return new Request(`${reqUrl.origin}/index.html`, req);
            },
          }
        );
      } catch (err: any) {
        return new Response('Asset not found', { status: 404 });
      }
    }
  }
};
