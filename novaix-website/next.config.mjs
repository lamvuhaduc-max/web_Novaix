/** Host của R2_PUBLIC_URL, dùng cho allowlist ảnh. Bỏ qua nếu chưa cấu hình. */
const r2ImageHost = (() => {
  try {
    return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  // Chỉ cho phép tối ưu ảnh từ CDN của chính mình.
  // KHÔNG dùng hostname "**": khi đó bất kỳ ai cũng gọi được /_next/image?url=<host-bất-kỳ>
  // và biến máy chủ thành proxy tải ảnh hộ (tốn băng thông, dò được endpoint nội bộ).
  images: {
    remotePatterns: r2ImageHost ? [{ protocol: "https", hostname: r2ImageHost }] : [],
  },
};

export default nextConfig;
