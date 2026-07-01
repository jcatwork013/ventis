/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Admin-uploaded images served from the API host.
      { protocol: "https", hostname: "api.ventis.vn" },
      { protocol: "https", hostname: "api-ventis.9bricks.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "backend" },
    ],
  },
};

export default nextConfig;
