import { json, supabaseSelect } from './_helpers.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
    const limit = Math.max(1, Number(url.searchParams.get('limit') || '25'));
    const offset = (page - 1) * limit;
    const query = `?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;

    const { res, data } = await supabaseSelect(env, 'contacts', query);
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
  } catch (err) {
    return json({ success: false, message: 'Internal server error', error: String(err) }, 500);
  }
}
