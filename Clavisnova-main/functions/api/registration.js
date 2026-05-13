import { getSupabaseConfig, supabaseHeaders, supabaseRequest } from './_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
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

    getSupabaseConfig(env);
    const { res, data: body } = await supabaseRequest(env, '/rest/v1/registrations', {
      method: 'POST',
      headers: supabaseHeaders(env),
      body: JSON.stringify(row)
    });

    if (!res.ok) return json({ message: 'Insert failed', details: body }, res.status);
    return json({ id: body?.[0]?.id ?? body?.id, message: 'Registration created successfully' }, 201);
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
