import tokenize
from io import StringIO


def extract_comments(code: str) -> str:
    """Extract # comments and docstrings from Python code."""
    import ast

    comments: list[str] = []

    # Extract # comments using the tokenizer
    tok = tokenize.generate_tokens(StringIO(code).readline)
    for ttype, tstring, *_ in tok:
        if ttype == tokenize.COMMENT:
            comments.append(tstring.lstrip("#").strip())

    # Extract docstrings using the AST
    try:
        tree = ast.parse(code)
    except SyntaxError:
        tree = None

    if tree:
        for node in ast.walk(tree):
            if isinstance(
                node, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)
            ):
                doc = ast.get_docstring(node)
                if doc:
                    comments.append(doc)

    return "\n".join(comments)
