/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化静态资源加载
  images: {
    unoptimized: true,
  },
  // 启用压缩
  compress: true,
  // 优化构建输出
  output: 'standalone',
  // 添加安全头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
