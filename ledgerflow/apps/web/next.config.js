/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '*.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Critical: ChromaDB loads dynamic scripts from unpkg during build
    // We need to completely ignore it for client builds
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'chromadb': false,
        'chromadb-default-embed': false,
      };
    }
    
    // For Edge runtime, also ignore these modules
    if (nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'chromadb': false,
        'chromadb-default-embed': false,
        '@xenova/transformers': false,
      };
    }
    
    config.externals.push(
      'chromadb-default-embed',
      '@xenova/transformers',
      'onnxruntime-node'
    );
    
    return config;
  },
  // Transpile packages that need it
  transpilePackages: [],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
