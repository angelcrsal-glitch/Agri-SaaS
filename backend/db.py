import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url and not key:
    # Fallback/Warning if keys are missing to prevent crash on import, 
    # though usage will fail. using print/warning is better than hard crash often
    # but strictly we need them.
    print("Warning: SUPABASE_URL and SUPABASE_KEY not found in environment.")
    supabase = None
else:
    supabase: Client = create_client(url, key)
