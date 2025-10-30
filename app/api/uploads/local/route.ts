import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { extname, join } from "node:path";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File not provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const id = randomBytes(8).toString("hex");
    const ext = extname(file.name) || ".png";
    const dir = join(process.cwd(), "public", "uploads");
    
    // Ensure directory exists
    await mkdir(dir, { recursive: true });
    
    const filePath = join(dir, `${id}${ext}`);
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${id}${ext}`;
    return NextResponse.json({ publicId: `${id}${ext}`, url: publicPath });
    
  } catch (error) {
    console.error("Local upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


