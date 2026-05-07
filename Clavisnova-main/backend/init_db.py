#!/usr/bin/env python3
"""
Simple DB initialization script for Clavisnova.
Run this locally after setting the DATABASE_URL env var (pointing to your Supabase DB).
"""
import os
import sys

from config import settings
from models import create_tables

def main():
    # Ensure DATABASE_URL is set (config.Settings reads env var)
    db_url = os.getenv("DATABASE_URL", None)
    if not db_url:
        print("ERROR: DATABASE_URL environment variable is not set.")
        print("Set it to your Supabase connection string, e.g.:")
        print("postgresql://user:pass@host:5432/postgres?sslmode=require")
        sys.exit(1)

    print("Using DATABASE_URL:", db_url)
    # create_tables() will use the models' engine which reads settings.database_url
    create_tables()
    print("✅ Tables created (or already exist).")

if __name__ == "__main__":
    main()


