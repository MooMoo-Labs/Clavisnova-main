const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function text(body, status = 200, headers = {}) {
  return new Response(body, { status, headers });
}

function corsPreflight() {
  return new Response(null, { status: 204, headers: JSON_HEADERS });
}

function supabaseBase(env) {
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE || '';
  if (!url || !key) throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return { url, key };
}

function supabaseHeaders(env, prefer = 'return=representation') {
  const { key } = supabaseBase(env);
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: prefer,
  };
}

async function supabaseRequest(env, path, init = {}) {
  const { url } = supabaseBase(env);
  const res = await fetch(`${url}${path}`, init);
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { res, data };
}

async function selectTable(env, table, query = '') {
  return supabaseRequest(env, `/rest/v1/${table}${query}`, {
    headers: supabaseHeaders(env, 'count=exact'),
  });
}

async function deleteById(env, table, id) {
  return supabaseRequest(env, `/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: supabaseHeaders(env, 'return=minimal'),
  });
}

async function countTable(env, table) {
  const { res } = await supabaseRequest(env, `/rest/v1/${table}?select=id&limit=1`, {
    headers: supabaseHeaders(env, 'count=exact'),
  });
  const contentRange = res.headers.get('content-range') || '';
  const match = contentRange.match(/\/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return lines.join('\n');
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function handleRegistration(request, env) {
  const data = await readJson(request);
  const required = ['manufacturer', 'model', 'serial', 'year', 'height', 'finish', 'color_wood', 'city_state'];
  for (const key of required) {
    if (!data[key] || String(data[key]).trim() === '') {
      return json({ message: `${key} is required` }, 400);
    }
  }

  const row = {
    manufacturer: data.manufacturer,
    model: data.model,
    serial: data.serial,
    year: Number(data.year),
    height: data.height,
    finish: data.finish,
    color_wood: data.color_wood,
    city_state: data.city_state,
    access: data.access || '',
    ip_address: request.headers.get('cf-connecting-ip') || '',
    user_agent: request.headers.get('user-agent') || '',
  };

  const { res, data: body } = await supabaseRequest(env, '/rest/v1/registrations', {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(row),
  });

  if (!res.ok) return json({ message: 'Insert failed', details: body }, res.status);
  return json({ id: body?.[0]?.id ?? body?.id, message: 'Registration created successfully' }, 201);
}

async function handleRequirements(request, env) {
  const data = await readJson(request);
  const row = {
    school_name: data.school_name || data.info1 || '',
    current_pianos: data.current_pianos || data.info2 || '',
    preferred_type: data.preferred_type || data.info3 || '',
    teacher_name: data.teacher_name || data.info4 || '',
    background: data.background || data.info5 || '',
    commitment: data.commitment || data.info6 || '',
    ip_address: request.headers.get('cf-connecting-ip') || '',
    user_agent: request.headers.get('user-agent') || '',
  };

  if (!row.school_name || !row.current_pianos || !row.preferred_type || !row.teacher_name || !row.background) {
    return json({ message: 'Missing required fields' }, 400);
  }

  const { res, data: body } = await supabaseRequest(env, '/rest/v1/requirements', {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(row),
  });

  if (!res.ok) return json({ message: 'Insert failed', details: body }, res.status);
  return json({ id: body?.[0]?.id ?? body?.id, message: 'Requirements submitted successfully' }, 201);
}

async function handleContact(request, env) {
  const data = await readJson(request);
  if (!data.message || !String(data.message).trim()) {
    return json({ message: 'Message cannot be empty' }, 400);
  }

  const row = {
    name: data.name || '',
    email: data.email || '',
    message: data.message || '',
    ip_address: request.headers.get('cf-connecting-ip') || '',
    user_agent: request.headers.get('user-agent') || '',
  };

  const { res, data: body } = await supabaseRequest(env, '/rest/v1/contacts', {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(row),
  });

  if (!res.ok) return json({ message: 'Insert failed', details: body }, res.status);
  return json({ id: body?.[0]?.id ?? body?.id, message: 'Contact submitted' }, 201);
}

async function handleAdminList(env, table, request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const limit = Math.max(1, Number(url.searchParams.get('limit') || '25'));
  const search = (url.searchParams.get('search') || '').trim();
  const offset = (page - 1) * limit;

  let query = `?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;
  if (search) {
    const filters = {
      registrations: `or=(manufacturer.ilike.*${search}*,model.ilike.*${search}*,serial.ilike.*${search}*,city_state.ilike.*${search}*)`,
      requirements: `or=(school_name.ilike.*${search}*,current_pianos.ilike.*${search}*,preferred_type.ilike.*${search}*,teacher_name.ilike.*${search}*,background.ilike.*${search}*,commitment.ilike.*${search}*)`,
      contacts: `or=(name.ilike.*${search}*,email.ilike.*${search}*,message.ilike.*${search}*)`,
    };
    query = `?select=*&order=created_at.desc&limit=${limit}&offset=${offset}&${encodeURIComponent(filters[table] || '')}`;
  }

  const { res, data } = await selectTable(env, table, query);
  if (!res.ok) return json({ success: false, message: 'Query failed', details: data }, res.status);

  const total = Number((res.headers.get('content-range') || '').split('/')?.[1] || data.length || 0);
  return json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

async function handleAdminDelete(env, table, id) {
  const { res } = await deleteById(env, table, id);
  if (!res.ok) return json({ success: false, message: 'Delete failed' }, res.status);
  return json({ success: true, message: 'Deleted successfully' });
}

async function handleAdminExport(env, table) {
  const { res, data } = await selectTable(env, table, '?select=*&order=created_at.desc&limit=1000');
  if (!res.ok) return json({ success: false, message: 'Query failed', details: data }, res.status);

  const rows = Array.isArray(data) ? data : [];
  const headers = rows.length ? Object.keys(rows[0]) : ['id'];
  const csv = toCsv(headers, rows);
  return text(csv, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${table}.csv"`,
    'Access-Control-Allow-Origin': '*',
  });
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'OPTIONS') return corsPreflight();

  if (pathname === '/' || pathname === '/index.html' || pathname === '/registration.html' || pathname === '/requirements.html' || pathname === '/admin.html') {
    if (env.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    return text('Frontend asset not found', 404);
  }

  if (pathname === '/favicon.ico') return text('', 204);
  if (pathname === '/api/' || pathname === '/api') return json({ message: 'Clavisnova Backend API', status: 'running' });
  if (pathname === '/api/health') {
    try {
      const registrations = await countTable(env, 'registrations');
      const requirements = await countTable(env, 'requirements');
      const contacts = await countTable(env, 'contacts');
      return json({
        status: 'healthy',
        timestamp: Date.now(),
        version: 'worker-1.0.0',
        database: 'configured',
        registrations,
        requirements,
        contacts,
        uptime: 0,
        memory_usage: 0,
      });
    } catch (err) {
      return json({ status: 'unhealthy', error: String(err) }, 500);
    }
  }

  if (pathname === '/api/registration' && request.method === 'POST') return handleRegistration(request, env);
  if (pathname === '/api/requirements' && request.method === 'POST') return handleRequirements(request, env);
  if (pathname === '/api/contact' && request.method === 'POST') return handleContact(request, env);

  if (pathname === '/api/admin/stats' && request.method === 'GET') {
    const [registrations, requirements, contacts] = await Promise.all([
      countTable(env, 'registrations'),
      countTable(env, 'requirements'),
      countTable(env, 'contacts'),
    ]);
    return json({
      success: true,
      stats: { registrations, requirements, total_submissions: registrations + requirements + contacts },
    });
  }

  if (pathname === '/api/admin/contacts' && request.method === 'GET') return handleAdminList(env, 'contacts', request);
  if (pathname === '/api/admin/registrations' && request.method === 'GET') return handleAdminList(env, 'registrations', request);
  if (pathname === '/api/admin/requirements' && request.method === 'GET') return handleAdminList(env, 'requirements', request);

  const deleteMatch = pathname.match(/^\/api\/admin\/delete\/(contact|registration|requirement)\/([^/]+)$/);
  if (deleteMatch && request.method === 'GET') {
    const [, table, id] = deleteMatch;
    const plural = table === 'requirement' ? 'requirements' : `${table}s`;
    return handleAdminDelete(env, plural, id);
  }

  const exportMatch = pathname.match(/^\/api\/admin\/export\/(registrations|requirements)$/);
  if (exportMatch && request.method === 'GET') {
    return handleAdminExport(env, exportMatch[1]);
  }

  return text('Not Found', 404, { 'Content-Type': 'text/plain; charset=utf-8' });
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (err) {
      return json({ message: 'Internal server error', error: String(err) }, 500);
    }
  },
};
