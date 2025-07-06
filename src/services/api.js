import axios from 'axios';

// Create the Axios instance with the backend API URL
const api = axios.create({
    baseURL: 'http://localhost:3056/api',
});

export default api;