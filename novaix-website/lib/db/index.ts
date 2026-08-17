import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Kiểu khai báo lấy theo Neon (môi trường production).
 * Driver postgres-js dùng cho local có cùng API truy vấn nên ép kiểu là an toàn.
 */
type Database = NeonHttpDatabase<typeof schema>;

let instance: Database | null = null;
let localClient: ReturnType<typeof postgres> | null = null;

function isNeon(url: string) {
  return url.includes("neon.tech") || url.includes("neon.build");
}

function create(): Database {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Thiếu biến môi trường DATABASE_URL.");
  }

  if (isNeon(connectionString)) {
    return drizzleNeon(neon(connectionString), { schema });
  }

  // Postgres thường (Docker local). `max: 1` tránh cạn connection khi Next hot-reload.
  localClient = postgres(connectionString, { max: 1 });
  return drizzlePostgres(localClient, { schema }) as unknown as Database;
}

/**
 * Đóng kết nối để tiến trình thoát được. Chỉ dùng cho script chạy một lần
 * (npm run db:seed); server web không cần gọi.
 */
export async function closeDb() {
  await localClient?.end({ timeout: 5 });
  localClient = null;
  instance = null;
}

/**
 * Khởi tạo trễ: chỉ đọc DATABASE_URL khi thực sự truy vấn,
 * để `next build` không đổ vỡ khi biến môi trường chưa có.
 */
export const db = new Proxy({} as Database, {
  get: (_target, prop) => {
    instance ??= create();
    const value = Reflect.get(instance, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };
