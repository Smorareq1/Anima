import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api', // URL base para todas las llamadas a la API
    headers: {
        'Accept': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Si existe un token, lo añade al encabezado de autorización
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
