import axios from 'axios';

// Get the current URL of the page
const currentUrl = window.location.href;

// Parse the URL to extract the subdomain
const subdomain = currentUrl.match(/^(?:https?:\/\/)?([^\/]+)/)[1].split('.')[0];

// Create the base URL with the subdomain
const baseURL = `http://${subdomain}.localhost:8000/`;

// Create the Axios instance with the custom baseURL
const api = axios.create({
  baseURL: baseURL,
});

export default api;
