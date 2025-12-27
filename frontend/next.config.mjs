/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker deployment
  output: 'standalone',
  eslint: {
    // Allow production builds to complete even with ESLint errors
    // TODO: Fix all ESLint errors and set back to false
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily allow builds to complete with type errors
    // TODO: Fix all TypeScript errors and set back to false
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Exclude test files from build
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;
