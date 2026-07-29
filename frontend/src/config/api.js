/**
 * Central API configuration for ApexData frontend.
 * All service URLs are read from Vite environment variables.
 * Set these in .env.local for development or in Vercel dashboard for production.
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const STRATEGY_AI_URL = import.meta.env.VITE_STRATEGY_AI_URL || 'http://localhost:8001';
export const AI_AGENT_URL = import.meta.env.VITE_AI_AGENT_URL || 'http://localhost:8000';
