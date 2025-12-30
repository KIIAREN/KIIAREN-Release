import { convexAuthNextjsMiddleware } from '@convex-dev/auth/nextjs/server';

// This API route proxies Convex auth requests through Next.js
// enabling custom domain (auth.kiiaren.com) for OAuth callbacks
export const { GET, POST } = convexAuthNextjsMiddleware();
