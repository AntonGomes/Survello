from pathlib import Path
import os 
from dotenv import load_dotenv

from fastapi import FastAPI, Response, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

STORAGE_ROOT = Path(os.environ.get("STORAGE_ROOT"))
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Dummy S3")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def path_for(key: str) -> Path:
    p = STORAGE_ROOT / key
    p.parent.mkdir(parents=True, exist_ok=True)
    return p

@app.put("/api/storage/upload")
async def put_object(key: str, request: Request):
    target = path_for(key)
    target.write_bytes(await request.body())
    return Response(
        content='{"ok": true, "key": "' + key + '"}',
        media_type="application/json",
        headers={"Access-Control-Allow-Origin": "*"},
    )

@app.get("/api/storage/download")
async def get_object(key: str):
    target = path_for(key)
    if not target.exists():
        raise HTTPException(status_code=404)
    return FileResponse(target, headers={"Access-Control-Allow-Origin": "*"})

@app.options("/api/storage/{path:path}")
async def options_object(path: str):
    return Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "PUT,GET,OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )
