const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const BACKEND_ORIGIN = backendOrigin;
export const API_BASE_URL = `${backendOrigin}/api`;
