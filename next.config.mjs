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
  // ✅ CORREÇÃO: Rewrites dinâmicos baseados em ambiente
  async rewrites() {
    // Em desenvolvimento, usar localhost
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
      ]
    }
    
    // Em produção, usar a URL configurada na variável de ambiente
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reticket-backend.onrender.com'
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
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
  // ✅ PRÁTICA NEXT.JS: Configuração webpack simplificada para evitar erros de 'self'
  webpack: (config, { dev, isServer }) => {
    // ✅ CORREÇÃO: Evitar problemas com 'self' no middleware
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    if (!dev && !isServer) {
      // ✅ PRÁTICA NEXT.JS: Otimizações de produção simplificadas
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 10,
          },
        },
      }
    }
    return config
  },
  // SWC minification é habilitada por padrão no Next.js 15
}

export default nextConfig
