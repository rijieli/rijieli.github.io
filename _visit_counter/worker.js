// API Endpoints:
// GET /api/count?url=<article_url> - Get visit count
// POST /api/count with {"url": "<article_url>", "visits": <number>} - Set visit count
// PUT /api/count with {"url": "<article_url>"} - Increment visit count
// GET /api/health - Health check

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const DATABASE_NAME = "roger-zone";
    const TABLE_NAME = "article_visits";

    const db = env[DATABASE_NAME];

    if (!db) {
      return new Response(JSON.stringify({
        error: 'Database connection failed',
        database: DATABASE_NAME
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {
      if (path === '/api/count' && request.method === 'GET') {
        return await getVisitCount(request, db, corsHeaders, DATABASE_NAME);
      } else if (path === '/api/count' && request.method === 'POST') {
        return await updateVisitCount(request, db, corsHeaders, DATABASE_NAME);
      } else if (path === '/api/count' && request.method === 'PUT') {
        return await incrementVisitCount(request, db, corsHeaders, DATABASE_NAME);
      } else if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          database: DATABASE_NAME,
          table: TABLE_NAME
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

async function getVisitCount(request, db, corsHeaders, DATABASE_NAME) {
  const url = new URL(request.url);
  const articleUrl = url.searchParams.get('url');

  if (!articleUrl) {
    return new Response(JSON.stringify({
      error: 'URL parameter is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const result = await db.prepare(
      'SELECT visits FROM article_visits WHERE article_url = ?'
    ).bind(articleUrl).first();

    const count = result ? result.visits : 0;

    return new Response(JSON.stringify({
      url: articleUrl,
      visits: count,
      found: !!result,
      database: DATABASE_NAME
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Database error in getVisitCount:', error);
    return new Response(JSON.stringify({
      error: 'Database error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function updateVisitCount(request, db, corsHeaders, DATABASE_NAME) {
  const body = await request.json();
  const { url, visits } = body;

  if (!url || typeof visits !== 'number' || visits < 0) {
    return new Response(JSON.stringify({
      error: 'Valid URL and non-negative visits number are required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);

  try {
    const result = await db.prepare(`
      INSERT INTO article_visits (article_url, visits, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(article_url) DO UPDATE SET
        visits = excluded.visits,
        updated_at = excluded.updated_at
      WHERE article_url = excluded.article_url
    `).bind(url, visits, timestamp, timestamp).run();

    return new Response(JSON.stringify({
      success: true,
      url: url,
      visits: visits,
      changes: result.changes,
      database: DATABASE_NAME
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Database error in updateVisitCount:', error);
    return new Response(JSON.stringify({
      error: 'Database error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function incrementVisitCount(request, db, corsHeaders, DATABASE_NAME) {
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return new Response(JSON.stringify({
      error: 'URL is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const current = await db.prepare(
      'SELECT visits FROM article_visits WHERE article_url = ?'
    ).bind(url).first();

    let newCount = 1;

    if (current) {
      newCount = current.visits + 1;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const result = await db.prepare(`
      INSERT INTO article_visits (article_url, visits, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(article_url) DO UPDATE SET
        visits = excluded.visits,
        updated_at = excluded.updated_at
      WHERE article_url = excluded.article_url
    `).bind(url, newCount, timestamp, timestamp).run();

    return new Response(JSON.stringify({
      success: true,
      url: url,
      previousVisits: current ? current.visits : 0,
      newVisits: newCount,
      changes: result.changes,
      database: DATABASE_NAME
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Database error in incrementVisitCount:', error);
    return new Response(JSON.stringify({
      error: 'Database error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}