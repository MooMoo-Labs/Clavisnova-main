export async function onRequestGet({ env }) {
  const now = Date.now();
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: now,
    version: '1.0.0',
    database: env.SUPABASE_URL ? 'configured' : 'not configured',
    registrations: 0,
    uptime: 0,
    memory_usage: 0
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
