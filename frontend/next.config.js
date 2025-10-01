/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_MCP_PROXY: process.env.NEXT_PUBLIC_API_MCP_PROXY || '/api/mcp-proxy',
  },
  async rewrites() {
    return [
      {
        source: '/api/mcp-proxy/:path*',
        destination: `${process.env.MCP_SERVER_URL || 'http://localhost:4000'}/mcp/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
