import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env";

const storageDirectory = path.resolve(
  env.DOCUMENT_STORAGE_DIR ?? path.join(process.cwd(), "storage", "private-documents"),
);

const extensions: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "text/plain": ".txt",
};

function storagePath(key: string): string {
  if (!/^[a-f0-9]{64}\.(pdf|jpg|png|txt)$/.test(key)) {
    throw new Error("Invalid private document storage key.");
  }
  return path.join(storageDirectory, key);
}

export async function storePrivateDocument(
  content: Buffer,
  contentType: string,
): Promise<string> {
  const extension = extensions[contentType];
  if (!extension) {
    throw new Error("Unsupported private document content type.");
  }

  await mkdir(storageDirectory, { recursive: true, mode: 0o700 });
  const key = `${randomBytes(32).toString("hex")}${extension}`;
  await writeFile(storagePath(key), content, { flag: "wx", mode: 0o600 });
  return key;
}

export async function readPrivateDocument(key: string): Promise<Buffer> {
  return readFile(storagePath(key));
}

export async function removePrivateDocument(key: string): Promise<void> {
  await unlink(storagePath(key));
}
