import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # load .env once globally

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing from environment")

DB_ROOT = Path("/Users/anton/Development/docgen/db")
DB_ROOT.mkdir(exist_ok=True, parents=True)

# OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)
