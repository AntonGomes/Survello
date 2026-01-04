import json
from app.main import app

def dump_openapi():
    openapi_data = app.openapi()
    with open("openapi.json", "w") as f:
        json.dump(openapi_data, f, indent=2)
    print("OpenAPI schema dumped to openapi.json")

if __name__ == "__main__":
    dump_openapi()
