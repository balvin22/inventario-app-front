import axios from 'axios';

// Lógica inteligente:
// 1. ¿Existe una variable de entorno llamada VITE_API_URL? (En Vercel SÍ existirá).
// 2. Si no existe, asume que estás desarrollando en local y usa el 127.0.0.1.
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: baseURL,
});

export default api;