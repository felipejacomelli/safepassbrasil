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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // ✅ PRÁTICA NEXT.JS: Configuração explícita para evitar problemas de SSL em dev
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000']
    }
  },
  // ✅ CORREÇÃO: Forçar HTTP para evitar redirecionamento automático para HTTPS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
  // ✅ PRÁTICA NEXT.JS: Otimizações de performance
  logging: {
    fetches: {
      fullUrl: true, // ✅ PRÁTICA NEXT.JS: Log detalhado de fetches em desenvolvimento
    },
  },
  // ✅ PRÁTICA NEXT.JS: Configuração de cache
  onDemandEntries: {
    // Período em ms onde as páginas são mantidas em cache
    maxInactiveAge: 25 * 1000,
    // Número de páginas que devem ser mantidas simultaneamente
    pagesBufferLength: 2,
  },
  // ✅ PRÁTICA NEXT.JS: Compressão
  compress: true,
  // ✅ PRÁTICA NEXT.JS: Otimizações de bundle
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // ✅ PRÁTICA NEXT.JS: Otimizações de produção
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // ✅ PRÁTICA NEXT.JS: Separar vendor chunks
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      }
    }
    return config
  },
  // SWC minification é habilitada por padrão no Next.js 15
}

export default nextConfig
