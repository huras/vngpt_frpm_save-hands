import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backend';

// Create the Axios instance with the backend API URL
const api = axios.create({
    baseURL: `${BACKEND_CONFIG.API_URL}/api`,
});

export default api;