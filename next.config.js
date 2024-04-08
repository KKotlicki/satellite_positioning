/** @type {import('next').NextConfig} */
const nextConfig = {
  target: "serverless",
  exportTrailingSlash: true,
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