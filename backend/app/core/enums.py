from enum import Enum


class UserRole(str, Enum):
    MEMBER = "member"
    ADMIN = "admin"


class RunStatus(str, Enum):
    IDLE = "idle"
    PRESIGNING = "presigning"
    UPLOADING = "uploading"
    GENERATING = "generating"
    FINALISING = "finalising"
    COMPLETED = "completed"
    ERROR = "error"


class JobStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class FeeType(str, Enum):
    FIXED = "fixed"
    HOURLY = "hourly"
    MIXED = "mixed"


class FileRole(str, Enum):
    TEMPLATE = "template"
    PREVIEW_PDF = "preview_pdf"
    ARTEFACT = "artefact"
    INPUT = "input"


class ArtefactType(str, Enum):
    DOCX = "docx"
    XLSX = "xlsx"
