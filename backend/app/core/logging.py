from __future__ import annotations

import logging


def setup_logger() -> logging.Logger:
    logger = logging.getLogger("docgen")
    logger.setLevel(logging.DEBUG)

    # Prevent duplicate handlers (hot reload, uvicorn reload)
    if logger.handlers:
        return logger

    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        fmt="[%(asctime)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    return logger


logger = setup_logger()
