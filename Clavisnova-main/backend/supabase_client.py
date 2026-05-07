import os
import requests
from typing import Any, Dict, Optional

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE", "")

def _headers() -> Dict[str, str]:
    return {
        "apikey": SUPABASE_SERVICE_ROLE,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def create_registration(data: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a registration row via Supabase REST API."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
        raise RuntimeError("Supabase REST not configured (SUPABASE_URL/SUPABASE_SERVICE_ROLE)")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/registrations"
    resp = requests.post(url, json=data, headers=_headers(), timeout=10)
    resp.raise_for_status()
    # Supabase returns an array of rows when Prefer=return=representation
    json_body = resp.json()
    if isinstance(json_body, list) and len(json_body) > 0:
        return json_body[0]
    return json_body

def create_requirements(data: Dict[str, Any]) -> Dict[str, Any]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
        raise RuntimeError("Supabase REST not configured (SUPABASE_URL/SUPABASE_SERVICE_ROLE)")
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/requirements"
    resp = requests.post(url, json=data, headers=_headers(), timeout=10)
    resp.raise_for_status()
    json_body = resp.json()
    if isinstance(json_body, list) and len(json_body) > 0:
        return json_body[0]
    return json_body

def create_contact(data: Dict[str, Any]) -> Dict[str, Any]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
        raise RuntimeError("Supabase REST not configured (SUPABASE_URL/SUPABASE_SERVICE_ROLE)")
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/contacts"
    resp = requests.post(url, json=data, headers=_headers(), timeout=10)
    resp.raise_for_status()
    json_body = resp.json()
    if isinstance(json_body, list) and len(json_body) > 0:
        return json_body[0]
    return json_body


