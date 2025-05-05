import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001',
    withCredentials: true // Permet d'envoyer les cookies avec chaque requête
});

export default axiosInstance;
