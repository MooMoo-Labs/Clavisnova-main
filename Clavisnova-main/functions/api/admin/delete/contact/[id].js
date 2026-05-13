import { json, supabaseDelete } from '../../../_supabase_admin.js';

export async function onRequestGet({ params, env }) {
  const { res } = await supabaseDelete(env, 'contacts', params.id);
  if (!res.ok) return json({ success: false, message: 'Delete failed' }, res.status);
  return json({ success: true, message: 'Deleted successfully' });
}
