/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "iili.io" },
      { protocol: "https", hostname: "freeimage.host" },
      { protocol: "https", hostname: "*.freeimage.host" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
