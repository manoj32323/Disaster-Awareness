/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-globe.gl', 'three', 'three-globe'],
  devIndicators: false,
};

export default nextConfig;
