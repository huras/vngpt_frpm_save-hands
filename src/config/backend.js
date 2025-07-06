// Backend configuration
export const BACKEND_CONFIG = {
    // Backend API URL
    API_URL: 'http://localhost:3056',

    // Image serving URL (same as API URL for now)
    IMAGE_URL: 'http://localhost:3056',

    // Helper function to get full image URL
    getImageUrl: (path) => {
        if (!path) return null;
        // If path already starts with http, return as is
        if (path.startsWith('http')) return path;
        // Otherwise, prepend the image URL
        return `${BACKEND_CONFIG.IMAGE_URL}${path}`;
    }
};

export default BACKEND_CONFIG;