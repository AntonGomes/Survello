const API_BASE = "/py-api";

export type DilapsSubStatus =
  | "embedding"
  | "sectioning"
  | "analyzing"
  | "completed"
  | "error"
  | null;

export type DilapsRunCreate = {
  property_address: string;
  job_id?: number;
  template_file_id: number;
  context_file_ids: number[];
};

export type DilapsRunRead = {
  id: number;
  property_address: string;
  status: DilapsSubStatus;
  progress_pct: number;
  total_sections: number;
  current_section: number;
  status_message: string | null;
  error_message: string | null;
  job_id: number | null;
  created_at: string;
  updated_at: string;
};

export type DilapsFileSet = {
  leaseFile: File | null;
  leaseDocFiles: File[];
  siteNoteFiles: File[];
  surveyImageFiles: File[];
  miscFiles: File[];
};

export async function listDilapsRuns() {
  const res = await fetch(`${API_BASE}/dilaps/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to list dilaps runs");
  return (await res.json()) as DilapsRunRead[];
}

export async function createDilapsRun(body: DilapsRunCreate) {
  const res = await fetch(`${API_BASE}/dilaps/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create dilaps run");
  return (await res.json()) as DilapsRunRead;
}

export async function readDilapsRun(dilapsId: number) {
  const res = await fetch(`${API_BASE}/dilaps/${dilapsId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to read dilaps run");
  return (await res.json()) as DilapsRunRead;
}

export function buildFileList(fileSet: DilapsFileSet) {
  const entries: { file: File; clientId: string }[] = [];

  if (fileSet.leaseFile) {
    entries.push({ file: fileSet.leaseFile, clientId: "lease-0" });
  }

  fileSet.leaseDocFiles.forEach((f, i) => {
    entries.push({ file: f, clientId: `leasedoc-${i}` });
  });

  fileSet.siteNoteFiles.forEach((f, i) => {
    entries.push({ file: f, clientId: `sitenote-${i}` });
  });

  fileSet.surveyImageFiles.forEach((f, i) => {
    entries.push({ file: f, clientId: `survey-${i}` });
  });

  fileSet.miscFiles.forEach((f, i) => {
    entries.push({ file: f, clientId: `misc-${i}` });
  });

  return entries;
}
