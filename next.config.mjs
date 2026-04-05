/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do NOT use output: 'standalone' for AWS Amplify Hosting SSR.
  // Standalone adds .next/standalone/ (traced node_modules + server) while .next/server still
  // exists — often ~300MB+ total and exceeds Amplify's ~220MB deploy artifact cap.
  // Amplify Hosting compute bundles from the default .next layout (see AWS deploy-nextjs-app docs).
  // For self-hosted Docker with standalone, use a separate build profile or Dockerfile that sets output.
  // Smaller deploy artifact (Amplify ~220MB output limit); omit client source maps in production
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,

  // Enable image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eventapp-media-bucket.s3.us-east-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'mosc.in',
      },
      {
        protocol: 'https',
        hostname: 'www.mosc-temp.com',
      },
      {
        protocol: 'https',
        hostname: 'img.rocket.new',
      },
      // Strapi CMS (News Portal - article covers, ad slots)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },

  // Runtime config removed (deprecated in Next 16). Use process.env / AMPLIFY_ prefix in Amplify.

  // Enable SWC minification for improved performance
  // swcMinify: true,

  // Customize webpack config if needed
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack config here if needed
    return config;
  },

  // Production builds use `next build --webpack` (see package.json). Local `npm run dev` also
  // uses `--webpack` so dev matches production and avoids Windows Turbopack junction panics
  // (see next-panic + spurious "Can't resolve lucide-react" loops).
  turbopack: {},

  // Clerk FAPI proxy is now handled by clerkMiddleware's frontendApiProxy option (v7+).
  // The old manual rewrite for /__clerk/* has been removed because it didn't forward
  // required headers (Clerk-Proxy-Url, Clerk-Secret-Key, X-Forwarded-For).
  async rewrites() {
    return [];
  },

  // Configure headers if needed
  async headers() {
    return [
      // Global CORS headers for all API routes (essential for mobile browsers)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      // Specific headers for file upload endpoint
      {
        source: '/api/proxy/event-medias/upload-multiple',
        headers: [
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      // CRITICAL FIX: Cache-busting headers for mobile browsers
      // Prevents aggressive caching of JavaScript bundles that can cause stale code execution
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Allow Next.js static assets to be cached (they have unique hashes)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Enable experimental features if needed
  experimental: {
    // Allow large multipart bodies (e.g. multi-file media upload) so middleware does not truncate at 10MB
    proxyClientMaxBodySize: '100mb',
    serverActions: {
      bodySizeLimit: '50mb', // Increase from default 1mb to 50mb for file uploads
    },
  },

  // Keep large / native deps out of the webpack server bundle; load from node_modules at runtime.
  // Shrinks .next/server (helps stay under Amplify SSR ~220MB deploy artifact cap).
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'sharp',
    'stripe',
    'xlsx',
    '@zxing/library',
    '@zxing/browser',
    'svix',
    'jsonwebtoken',
  ],

  env: {
    // Clerk environment variables
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,

    // API JWT credentials (prioritize AMPLIFY_ prefix for AWS Amplify)
    API_JWT_USER: process.env.AMPLIFY_API_JWT_USER || process.env.API_JWT_USER,
    API_JWT_PASS: process.env.AMPLIFY_API_JWT_PASS || process.env.API_JWT_PASS,
    AMPLIFY_API_JWT_USER: process.env.AMPLIFY_API_JWT_USER,
    AMPLIFY_API_JWT_PASS: process.env.AMPLIFY_API_JWT_PASS,
    NEXT_PUBLIC_API_JWT_USER: process.env.NEXT_PUBLIC_API_JWT_USER,
    NEXT_PUBLIC_API_JWT_PASS: process.env.NEXT_PUBLIC_API_JWT_PASS,
    NEXT_PUBLIC_API_BASE_URL: process.env.AMPLIFY_NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
    // Tenant ID and Payment Method Domain ID (prioritize AMPLIFY_ prefix for AWS Amplify)
    NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID,
    AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID,
    // Homepage cache: separate client cache by environment (local/dev/staging/production)
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'local'),
    NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID || process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
    AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,

    // Stripe environment variables
    // CRITICAL: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET removed from env section
    // They are only in serverRuntimeConfig (lines 26-27) to prevent build-time exposure
    // Server-side code can access process.env directly, so env section is not needed
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.AMPLIFY_NEXT_PUBLIC_APP_URL,
    /** Inbound address for public contact form (FcUnitedContactForm); proxy forwards to backend. */
    NEXT_PUBLIC_CONTACT_TO_EMAIL: process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL,
    NEXT_PUBLIC_MOSC_CONTACT_TO_EMAIL: process.env.NEXT_PUBLIC_MOSC_CONTACT_TO_EMAIL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    NEXT_PUBLIC_STRIPE_MAX_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID,
    NEXT_PUBLIC_STRIPE_ULTRA_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_ULTRA_PRICE_ID,

    // Givebutter (donate button / campaign page URL; event fund embed widget)
    NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID: process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID,
    NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID: process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID,

    // Memberstack (member portal; client-side widget uses public key; optional plan/price IDs for signup and checkout)
    NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY,
    NEXT_PUBLIC_MEMBERSTACK_PROJECT_ID: process.env.NEXT_PUBLIC_MEMBERSTACK_PROJECT_ID,
    NEXT_PUBLIC_MEMBERSTACK_FREE_PLAN_ID: process.env.NEXT_PUBLIC_MEMBERSTACK_FREE_PLAN_ID,
    NEXT_PUBLIC_MEMBERSTACK_BRONZE_PRICE_ID: process.env.NEXT_PUBLIC_MEMBERSTACK_BRONZE_PRICE_ID,

    // Additional environment variables required in production
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    POOLED_URL: process.env.POOLED_URL,
    NEXT_PUBLIC_CLERK_FRONTEND_API: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,

    // Strapi CMS (News Portal - MOSC)
    NEXT_PUBLIC_STRAPI_URL: process.env.AMPLIFY_NEXT_PUBLIC_STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL,
    AMPLIFY_NEXT_PUBLIC_STRAPI_URL: process.env.AMPLIFY_NEXT_PUBLIC_STRAPI_URL,
    STRAPI_API_TOKEN: process.env.AMPLIFY_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN,
    AMPLIFY_STRAPI_API_TOKEN: process.env.AMPLIFY_STRAPI_API_TOKEN,

    // Liturgical Calendar API (Syro-Malabar / SMCIM) – server-only token for /api/liturgy
    LITURGY_API_TOKEN: process.env.AMPLIFY_LITURGY_API_TOKEN || process.env.LITURGY_API_TOKEN,
    AMPLIFY_LITURGY_API_TOKEN: process.env.AMPLIFY_LITURGY_API_TOKEN,

    // Liturgical Calendar data source (strapi | external)
    LITURGY_DATA_SOURCE: process.env.LITURGY_DATA_SOURCE || process.env.AMPLIFY_LITURGY_DATA_SOURCE || 'external',
    AMPLIFY_LITURGY_DATA_SOURCE: process.env.AMPLIFY_LITURGY_DATA_SOURCE,
  },
};

export default nextConfig;

