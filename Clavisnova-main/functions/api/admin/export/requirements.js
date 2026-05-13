import { json, supabaseSelect } from '../_helpers.js';

export async function onRequestGet({ env }) {
  try {
    const { res, data } = await supabaseSelect(env, 'requirements', '?select=*&order=created_at.desc');
    if (!res.ok) return json({ success: false, message: 'Query failed', details: data }, res.status);
    return json({ success: true, data });
  } catch (err) {
    return json({ success: false, message: 'Internal server error', error: String(err) }, 500);
  }
}
