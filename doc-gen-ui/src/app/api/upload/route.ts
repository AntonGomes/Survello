import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export const runtime = "nodejs"; // required for streaming and file IO

// Where Next.js stores uploaded files
const DB_ROOT = "/Users/anton/Development/docgen/db";

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const template = form.get("templateFiles") as File | null;
  const contextFiles = form.getAll("contextFiles") as File[];

  // Generate job ID
  const jobId = randomUUID();

  // Create job directory
  const jobDir = path.join(DB_ROOT, jobId);
  await fs.mkdir(jobDir, { recursive: true });

  // Directories for template + context
  const templateDir = path.join(jobDir, "template");
  const contextDir = path.join(jobDir, "context");

  await fs.mkdir(templateDir, { recursive: true });
  await fs.mkdir(contextDir, { recursive: true });

  // Save template
  if (template) {
    const buffer = Buffer.from(await template.arrayBuffer());
    await fs.writeFile(path.join(templateDir, template.name), buffer);
  }

  // Save context files
  for (const file of contextFiles) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(contextDir, file.name), buffer);
  }

  // Return job ID so frontend can open EventSource
  return NextResponse.json({ jobId });
}