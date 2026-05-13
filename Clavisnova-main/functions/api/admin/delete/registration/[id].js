import { json, supabaseDeleteById } from '../../../admin/_helpers.js';

export async function onRequestGet({ params, env }) {
  const { res } = await supabaseDeleteById(env, 'registrations', params.id);
  if (!res.ok) return json({ success: false, message: 'Delete failed' }, res.status);
  return json({ success: true, message: 'Deleted successfully' });
}
