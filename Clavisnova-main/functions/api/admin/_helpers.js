import { getSupabaseConfig, supabaseHeaders, supabaseRequest } from '../_supabase.js';

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    }
  });
}

export async function supabaseSelect(env, table, query = '') {
  getSupabaseConfig(env);
  const { res, data } = await supabaseRequest(env, `/rest/v1/${table}${query}`, {
    headers: supabaseHeaders(env, 'count=exact')
  });
  return { res, data };
}

export async function supabaseDeleteById(env, table, id) {
  getSupabaseConfig(env);
  return supabaseRequest(env, `/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: supabaseHeaders(env, 'return=minimal')
  });
}
