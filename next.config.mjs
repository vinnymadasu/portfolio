/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',           // static export — deploys to GitHub Pages
  images: { unoptimized: true },
  basePath: isProd ? basePath : '',
  assetPrefix: isProd && basePath ? basePath + '/' : undefined,
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
