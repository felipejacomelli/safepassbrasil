/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ✅ Configuração explícita para evitar problemas de SSL em dev
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000']
    }
  },
  // Desabilita minificação em desenvolvimento para debug
  swcMinify: true,
}

export default nextConfig
