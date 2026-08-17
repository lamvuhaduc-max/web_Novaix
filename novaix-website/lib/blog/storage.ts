import fs from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface BlobStorage {
  put(key: string, body: Buffer, contentType: string): Promise<string>;
}

export class LocalStorageDriver implements BlobStorage {
  private uploadsDir = path.join(process.cwd(), "public", "uploads");

  async put(key: string, body: Buffer, _contentType: string): Promise<string> {
    const filePath = path.join(this.uploadsDir, key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, body);
    return `/uploads/${key.replace(/\\/g, "/")}`;
  }
}

export class R2StorageDriver implements BlobStorage {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT || "";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
    this.bucket = process.env.R2_BUCKET || "";
    this.publicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async put(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return `${this.publicUrl}/${key}`;
  }
}

export function getStorageDriver(): BlobStorage {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "r2" && process.env.R2_ACCESS_KEY_ID) {
    return new R2StorageDriver();
  }
  return new LocalStorageDriver();
}
