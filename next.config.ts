// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Игнорируем ошибки TypeScript
  },
  eslint: {
    ignoreDuringBuilds: true, // Игнорируем ошибки ESLint
  },
};

module.exports = nextConfig;