/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tektariq/ui', '@tektariq/shared'],
  output: 'standalone',
};
module.exports = nextConfig;
