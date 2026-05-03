const backendOrigin = (import.meta.env.VITE_API_URL || 'https://backend-production-d5256.up.railway.app').replace(/\/$/, '');

export const BACKEND_ORIGIN = backendOrigin;
export const API_BASE_URL = `${backendOrigin}/api`;
