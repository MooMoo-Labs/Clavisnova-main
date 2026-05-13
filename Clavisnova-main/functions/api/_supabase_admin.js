import { getSupabaseConfig, supabaseRequest, supabaseHeaders } from './_supabase.js';

export async function supabaseDelete(env, table, id) {
  getSupabaseConfig(env);
  return supabaseRequest(env, `/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: supabaseHeaders(env, 'return=minimal')
  });
}
