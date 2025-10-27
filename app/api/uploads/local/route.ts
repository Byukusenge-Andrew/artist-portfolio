import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { extname, join } from "node:path";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "File not provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const id = randomBytes(8).toString("hex");
  const ext = extname(file.name) || ".png";
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${id}${ext}`);
  await writeFile(filePath, buffer);

  const publicPath = `/uploads/${id}${ext}`;
  return NextResponse.json({ publicId: `${id}${ext}`, url: publicPath });
}


