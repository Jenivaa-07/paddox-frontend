/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "media.formula1.com" },
      { protocol: "https", hostname: "www.formula1.com" },
      { protocol: "https", hostname: "flagcdn.com" }
    ]
  }
};

export default nextConfig;
