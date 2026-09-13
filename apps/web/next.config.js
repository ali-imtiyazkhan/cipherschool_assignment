/** @type {import('next').NextConfig} */
const rawBackendUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:3001";

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

