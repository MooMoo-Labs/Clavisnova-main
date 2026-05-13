import { getSupabaseConfig, supabaseHeaders, supabaseRequest } from './_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
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

    getSupabaseConfig(env);
    const { res, data: body } = await supabaseRequest(env, '/rest/v1/requirements', {
      method: 'POST',
      headers: supabaseHeaders(env),
      body: JSON.stringify(row)
    });

    if (!res.ok) return json({ message: 'Insert failed', details: body }, res.status);
    return json({ id: body?.[0]?.id ?? body?.id, message: 'Requirements submitted successfully' }, 201);
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
