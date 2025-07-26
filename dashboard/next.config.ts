import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  
  // Add rewrites to serve dashboard content at the root path
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/dashboard',
      },
      {
        source: '/general',
        destination: '/dashboard/general',
      },
      {
        source: '/pens',
        destination: '/dashboard/pens',
      },
      {
        source: '/variables',
        destination: '/dashboard/variables',
      },
      {
        source: '/reports',
        destination: '/dashboard/reports',
      },
      // Proxy API calls to backend
      {
        source: '/api/chatbot/:path*',
        destination: 'http://localhost:4000/api/chatbot/:path*',
      },
    ];
  },
};

export default nextConfig;
