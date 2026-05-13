import { getSupabaseConfig, supabaseHeaders, supabaseRequest } from './_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
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

    getSupabaseConfig(env);
    const { res, data: body } = await supabaseRequest(env, '/rest/v1/contacts', {
      method: 'POST',
      headers: supabaseHeaders(env),
      body: JSON.stringify(row)
    });

    if (!res.ok) return json({ message: 'Insert failed', details: body }, res.status);
    return json({ id: body?.[0]?.id ?? body?.id, message: 'Contact submitted' }, 201);
  } catch (err) {
    return json({ message: 'Internal server error', error: String(err) }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
