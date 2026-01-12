#!/bin/bash
set -e

cd backend && uv run dump_openapi.py
cd ../frontend && npm run generate-types && npm run type-check
