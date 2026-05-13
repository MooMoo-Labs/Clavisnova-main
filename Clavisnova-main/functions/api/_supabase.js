export function getSupabaseConfig(env) {
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url, key };
}

export function supabaseHeaders(env, prefer = 'return=representation') {
  const { key } = getSupabaseConfig(env);
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: prefer
  };
}

export async function supabaseRequest(env, path, init = {}) {
  const { url } = getSupabaseConfig(env);
  const res = await fetch(`${url}${path}`, init);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { res, data };
}
