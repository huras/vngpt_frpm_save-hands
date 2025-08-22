// Backend configuration
export const BACKEND_CONFIG = {
    // Backend API URL - use relative path for same domain
    API_URL: '',

    // Image serving URL (same as API URL for now)
    IMAGE_URL: '',

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