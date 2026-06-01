from supabase import create_client, Client
from config import Config
import time
import httpx

# Monkey-patch httpx.Client.send to automatically retry on dropped connections
# This gracefully handles WinError 10054 across the entire Supabase Python SDK
original_send = httpx.Client.send

def safe_send(self, *args, **kwargs):
    try:
        return original_send(self, *args, **kwargs)
    except Exception as e:
        # If the connection was dropped by the server while idle, the first attempt will raise an error.
        # The underlying httpx client will then purge the dead connection.
        # A second attempt will successfully open a fresh connection!
        time.sleep(0.1)
        return original_send(self, *args, **kwargs)

httpx.Client.send = safe_send

# Initialize Supabase Clients as singletons (connection pool is maintained natively)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
supabase_admin: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)