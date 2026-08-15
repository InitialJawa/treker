/**
 * Cloudflare Worker Backend for Traveler Trip Planner
 * High performance Edge REST API for Cloudflare D1 SQL Database + KV caching
 */

export interface Env {
  DB: D1Database;
  CACHE_KV?: KVNamespace;
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
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Ping / Health Check
    if (url.pathname === '/api/health' || url.pathname === '/api/cloudflare/health') {
      return jsonResponse({
        status: 'ok',
        engine: 'Cloudflare Workers + D1',
        region: request.cf?.colo || 'EDGE',
        timestamp: new Date().toISOString(),
      });
    }

    // Extract User UID from Authorization header or X-User-Uid header
    const authHeader = request.headers.get('Authorization');
    const userUidHeader = request.headers.get('X-User-Uid');
    const userId = userUidHeader || (authHeader ? authHeader.replace('Bearer ', '') : 'guest');

    try {
      // 1. GET /api/cloudflare/trips - Fetch all trips for user
      if (url.pathname === '/api/cloudflare/trips' && request.method === 'GET') {
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

      // 2. POST /api/cloudflare/trips - Save or Update Trip
      if (url.pathname === '/api/cloudflare/trips' && request.method === 'POST') {
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

      // 3. DELETE /api/cloudflare/trips/:id - Delete Trip
      if (url.pathname.startsWith('/api/cloudflare/trips/') && request.method === 'DELETE') {
        const tripId = url.pathname.split('/')[4];
        if (!tripId) return jsonResponse({ error: 'Missing tripId' }, 400);

        await env.DB.prepare(`DELETE FROM trips WHERE id = ?`).bind(tripId).run();
        await env.DB.prepare(`DELETE FROM itinerary_days WHERE tripId = ?`).bind(tripId).run();
        await env.DB.prepare(`DELETE FROM itinerary_items WHERE tripId = ?`).bind(tripId).run();
        await env.DB.prepare(`DELETE FROM places WHERE tripId = ?`).bind(tripId).run();
        await env.DB.prepare(`DELETE FROM expenses WHERE tripId = ?`).bind(tripId).run();

        return jsonResponse({ success: true, deletedTripId: tripId });
      }

      // 4. GET /api/cloudflare/theme - Get User Custom Theme
      if (url.pathname === '/api/cloudflare/theme' && request.method === 'GET') {
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

      // 5. POST /api/cloudflare/theme - Save User Custom Theme
      if (url.pathname === '/api/cloudflare/theme' && request.method === 'POST') {
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

      return jsonResponse({ error: 'Endpoint not found' }, 404);
    } catch (err: any) {
      return jsonResponse({ error: err.message || 'Cloudflare D1 Server Error' }, 500);
    }
  }
};
