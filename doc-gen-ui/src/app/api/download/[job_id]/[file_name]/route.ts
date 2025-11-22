import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { job_id: string; file_name: string } }
) {
  const { job_id, file_name } = params;

  // file_name is already decoded by Next in most cases,
  // but this is safe if you encoded it on the client.
  const decodedName = decodeURIComponent(file_name);
  console.log("templateFile name ", decodedName)

  const filePath = path.join(
    "/Users/anton/Development/docgen",
    "db",
    job_id,
    "output",
    decodedName
  );
  console.log("Download file path:", filePath)

  try {
    const fileBuffer = await fs.readFile(filePath);
    const uint8 = new Uint8Array(fileBuffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${decodedName}"`,
      },
    });
  } catch (err) {
    console.error("Error reading file", err);
    return new NextResponse("File not found", { status: 404 });
  }
}