/**
 * Central API configuration for ApexData frontend.
 * All service URLs are read from Vite environment variables.
 *
 * For local development: copy .env.example to .env.local and fill in values.
 * For production: set these variables in the Vercel project dashboard.
 *
 * IMPORTANT: No localhost fallbacks are intentional. If a variable is missing
 * the build will still succeed, but API calls will fail with a clear network
 * error pointing at "undefined", making misconfiguration immediately obvious
 * rather than silently routing requests to localhost.
 */

if (!import.meta.env.VITE_BACKEND_URL) {
  console.error('[ApexData] VITE_BACKEND_URL is not set. Check your Vercel environment variables.');
}
if (!import.meta.env.VITE_AI_AGENT_URL) {
  console.error('[ApexData] VITE_AI_AGENT_URL is not set. Check your Vercel environment variables.');
}
if (!import.meta.env.VITE_STRATEGY_AI_URL) {
  console.error('[ApexData] VITE_STRATEGY_AI_URL is not set. Check your Vercel environment variables.');
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const AI_AGENT_URL = import.meta.env.VITE_AI_AGENT_URL;
export const STRATEGY_AI_URL = import.meta.env.VITE_STRATEGY_AI_URL;
