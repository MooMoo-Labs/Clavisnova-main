import { json, supabaseSelect } from './_helpers.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
    const limit = Math.max(1, Number(url.searchParams.get('limit') || '25'));
    const search = (url.searchParams.get('search') || '').trim();
    const offset = (page - 1) * limit;

    let query = `?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;
    if (search) {
      const q = encodeURIComponent(`or=(school_name.ilike.*${search}*,current_pianos.ilike.*${search}*,preferred_type.ilike.*${search}*,teacher_name.ilike.*${search}*,background.ilike.*${search}*,commitment.ilike.*${search}*)`);
      query = `?select=*&order=created_at.desc&limit=${limit}&offset=${offset}&${q}`;
    }

    const { res, data } = await supabaseSelect(env, 'requirements', query);
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
