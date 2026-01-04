from app.schemas.file_schemas import FileStore
from app.core.enums import FileRole

try:
    FileStore(
        storage_key="some/key.pdf",
        file_name="file.pdf",
        mime_type="application/pdf",
        data=b"some data",
        role=FileRole.INPUT
    )
    print("Success!")
except Exception as e:
    print(e)
