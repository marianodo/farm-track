import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  
  // Add rewrites to serve dashboard content at the root path
  async rewrites() {
    // Helper function to get the correct API base URL
    const getApiBaseUrl = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      // Remove trailing slash and /api if present to avoid duplication
      return apiUrl.replace(/\/api\/?$/, '');
    };

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
        destination: `${getApiBaseUrl()}/api/chatbot/:path*`,
      },
    ];
  },
};

export default nextConfig;
