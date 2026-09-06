/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/auth/signin?mode=signup",
        permanent: false,
      },
      {
        source: "/sign-up",
        destination: "/auth/signin?mode=signup",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/auth/signin?mode=signup",
        permanent: false,
      },
      {
        source: "/auth/signup",
        destination: "/auth/signin?mode=signup",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/auth/signin",
        permanent: false,
      },
      {
        source: "/auth/login",
        destination: "/auth/signin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
