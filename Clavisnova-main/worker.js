const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

function cors() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

function getSupabaseConfig(env) {
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE || '';
  if (!url || !key) {
    throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url, key };
}

function supabaseHeaders(env, prefer = 'return=representation') {
  const { key } = getSupabaseConfig(env);
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: prefer
  };
}

async function supabaseRequest(env, path, init = {}) {
  const { url } = getSupabaseConfig(env);
  const res = await fetch(`${url}${path}`, init);
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { res, data };
}

async function supabaseSelect(env, table, query = '') {
  return supabaseRequest(env, `/rest/v1/${table}${query}`, {
    headers: supabaseHeaders(env, 'count=exact')
  });
}

async function supabaseDeleteById(env, table, id) {
  return supabaseRequest(env, `/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: supabaseHeaders(env, 'return=minimal')
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function handleHealth(env) {
  return json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0',
    database: env.SUPABASE_URL ? 'configured' : 'not configured',
    registrations: 0,
    uptime: 0,
    memory_usage: 0
  });
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
    user_agent: request.headers.get('user-agent') || ''
  };

  const { res, data: body } = await supabaseRequest(env, '/rest/v1/registrations', {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(row)
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
    user_agent: request.headers.get('user-agent') || ''
  };

  const { res, data: body } = await supabaseRequest(env, '/rest/v1/requirements', {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(row)
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
    user_agent: request.headers.get('user-agent') || ''
  };

  const { res, data: body } = await supabaseRequest(env, '/rest/v1/contacts', {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(row)
  });

  if (!res.ok) return json({ message: 'Insert failed', details: body }, res.status);
  return json({ id: body?.[0]?.id ?? body?.id, message: 'Contact submitted' }, 201);
}

async function handleCount(env, table) {
  const { res } = await supabaseSelect(env, table, '?select=id&limit=1');
  const range = res.headers.get('content-range');
  if (!range) return 0;
  const match = range.match(/\/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

async function handleAdminStats(env) {
  const [registrations, requirements, contacts] = await Promise.all([
    handleCount(env, 'registrations'),
    handleCount(env, 'requirements'),
    handleCount(env, 'contacts')
  ]);

  return json({
    success: true,
    stats: {
      registrations,
      requirements,
      total_submissions: registrations + requirements + contacts
    }
  });
}

async function handleAdminList(env, table, request, searchFields = []) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const limit = Math.max(1, Number(url.searchParams.get('limit') || '25'));
  const search = (url.searchParams.get('search') || '').trim();
  const offset = (page - 1) * limit;

  let query = `?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;
  if (search && searchFields.length) {
    const filter = searchFields.map((field) => `${field}.ilike.*${search}*`).join(',');
    query = `?select=*&order=created_at.desc&limit=${limit}&offset=${offset}&or=(${filter})`;
  }

  const { res, data } = await supabaseSelect(env, table, query);
  if (!res.ok) return json({ success: false, message: 'Query failed', details: data }, res.status);

  const total = Number(res.headers.get('content-range')?.split('/')?.[1] || data.length || 0);
  return json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit))
    }
  });
}

async function handleAdminDelete(env, table, id) {
  const { res } = await supabaseDeleteById(env, table, id);
  if (!res.ok) return json({ success: false, message: 'Delete failed' }, res.status);
  return json({ success: true, message: 'Deleted successfully' });
}

async function handleAdminExport(env, table) {
  const { res, data } = await supabaseSelect(env, table, '?select=*&order=created_at.desc');
  if (!res.ok) return json({ success: false, message: 'Query failed', details: data }, res.status);
  return json({ success: true, data });
}

function isMethod(request, method) {
  return request.method.toUpperCase() === method;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return cors();

    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({
        message: 'Clavisnova Backend API',
        frontend: env.FRONTEND_URL || 'https://your-frontend-domain.pages.dev',
        docs: '/api/health'
      }), { headers: jsonHeaders });
    }

    if (url.pathname === '/api/health' && isMethod(request, 'GET')) return handleHealth(env);
    if (url.pathname === '/api/registration' && isMethod(request, 'POST')) return handleRegistration(request, env);
    if (url.pathname === '/api/requirements' && isMethod(request, 'POST')) return handleRequirements(request, env);
    if (url.pathname === '/api/contact' && isMethod(request, 'POST')) return handleContact(request, env);

    if (url.pathname === '/api/admin/stats' && isMethod(request, 'GET')) return handleAdminStats(env);
    if (url.pathname === '/api/admin/contacts' && isMethod(request, 'GET')) return handleAdminList(env, 'contacts', request, []);
    if (url.pathname === '/api/admin/registrations' && isMethod(request, 'GET')) return handleAdminList(env, 'registrations', request, ['manufacturer', 'model', 'serial', 'city_state']);
    if (url.pathname === '/api/admin/requirements' && isMethod(request, 'GET')) return handleAdminList(env, 'requirements', request, ['school_name', 'current_pianos', 'preferred_type', 'teacher_name', 'background', 'commitment']);

    if (url.pathname.startsWith('/api/admin/delete/registration/') && isMethod(request, 'GET')) {
      return handleAdminDelete(env, 'registrations', url.pathname.split('/').pop());
    }
    if (url.pathname.startsWith('/api/admin/delete/requirement/') && isMethod(request, 'GET')) {
      return handleAdminDelete(env, 'requirements', url.pathname.split('/').pop());
    }
    if (url.pathname.startsWith('/api/admin/delete/contact/') && isMethod(request, 'GET')) {
      return handleAdminDelete(env, 'contacts', url.pathname.split('/').pop());
    }

    if (url.pathname === '/api/admin/export/registrations' && isMethod(request, 'GET')) return handleAdminExport(env, 'registrations');
    if (url.pathname === '/api/admin/export/requirements' && isMethod(request, 'GET')) return handleAdminExport(env, 'requirements');

    return new Response('Not Found', { status: 404 });
  }
};
