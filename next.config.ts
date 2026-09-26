import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /**
     * Complaint photos and avatars are uploaded to Cloudinary by the API, so the
     * optimiser has to be told that host is allowed. Without this entry
     * next/image refuses the URL rather than serving an unoptimised original.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Google profile pictures, for accounts that signed up with Google.
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
