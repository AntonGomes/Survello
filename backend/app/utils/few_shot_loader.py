from __future__ import annotations

import json
from pathlib import Path

EXAMPLES_DIR = Path(__file__).parent.parent / "prompts" / "examples"


def load_examples() -> str:
    examples: list[dict] = []
    for path in sorted(EXAMPLES_DIR.glob("*.json")):
        with open(path) as f:
            data = json.load(f)
            if isinstance(data, list):
                examples.extend(data)
            else:
                examples.append(data)

    if not examples:
        return "No examples available."

    return json.dumps(examples, indent=2)
