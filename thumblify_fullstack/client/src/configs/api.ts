// src/configs/api.ts
import axios from 'axios';
import { auth } from './firebase';



const api = axios.create({
    baseURL: '',   // ← change karo, ab relative path use hoga
    withCredentials: true
})



// Request interceptor
api.interceptors.request.use(
    async (config) => {
        try {
            const token = localStorage.getItem('authToken');
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (auth.currentUser) {
                // If token not in localStorage but user is logged in
                const newToken = await auth.currentUser.getIdToken();
                localStorage.setItem('authToken', newToken);
                config.headers.Authorization = `Bearer ${newToken}`;
            }
            
            return config;
        } catch (error) {
            console.error('Interceptor error:', error);
            return config;
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                if (auth.currentUser) {
                    const newToken = await auth.currentUser.getIdToken(true);
                    localStorage.setItem('authToken', newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;