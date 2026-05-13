export async function onRequestGet({ env }) {
  try {
    const [registrations, requirements, contacts] = await Promise.all([
      countTable(env, 'registrations'),
      countTable(env, 'requirements'),
      countTable(env, 'contacts')
    ]);

    return json({
      success: true,
      stats: {
        registrations,
        requirements,
        total_submissions: registrations + requirements + contacts
      }
    });
  } catch (err) {
    return json({ success: false, message: 'Internal server error', error: String(err) }, 500);
  }
}

async function countTable(env, table) {
  const url = `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?select=id&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
      Prefer: 'count=exact'
    }
  });
  const count = res.headers.get('content-range');
  if (!count) return 0;
  const match = count.match(/\/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
