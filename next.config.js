/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/settings",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;