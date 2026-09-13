/** @type {import('next').NextConfig} */
const defaultBackend =
  process.env.NODE_ENV === "production"
    ? "https://lld-arena-backend.onrender.com"
    : "http://localhost:3001";

const rawBackendUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  defaultBackend;

const cleanBackendUrl = rawBackendUrl.replace(/\/+$/, "");
const targetApiUrl = cleanBackendUrl.endsWith("/api")
  ? cleanBackendUrl
  : `${cleanBackendUrl}/api`;

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${targetApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

