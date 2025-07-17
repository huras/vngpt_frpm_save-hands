const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for media uploads
const storage = multer.diskStorage({
    destination: async(req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/media/tags');

        try {
            // Ensure directory exists
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|webm|ogg|mov/;
    const extname = path.extname(file.originalname).toLowerCase();

    const isImage = allowedImageTypes.test(extname) && file.mimetype.startsWith('image/');
    const isVideo = allowedVideoTypes.test(extname) && file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
        // Add media type to request for later use
        req.mediaType = isImage ? 'image' : 'video';
        return cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    },
    fileFilter: fileFilter
});

// Utility function to get media URL
const getMediaUrl = (filename) => {
    if (!filename) return null;
    return `/media/tags/${filename}`;
};

// Utility function to delete media file
const deleteMedia = async(filename) => {
    if (!filename) return;

    try {
        const filePath = path.join(__dirname, '../public/media/tags', filename);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting media file:', error);
    }
};

// Utility function to copy media from source to destination
const copyMedia = async(sourcePath, destinationFilename) => {
    try {
        const destPath = path.join(__dirname, '../public/media/tags', destinationFilename);
        await fs.copyFile(sourcePath, destPath);
        return getMediaUrl(destinationFilename);
    } catch (error) {
        console.error('Error copying media file:', error);
        throw error;
    }
};

// Utility function to detect media type from filename
const detectMediaType = (filename) => {
    if (!filename) return 'image';

    const ext = path.extname(filename).toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];

    return videoExtensions.includes(ext) ? 'video' : 'image';
};

// Utility function to get media info (type, url, etc.)
const getMediaInfo = (filename) => {
    if (!filename) return null;

    return {
        url: getMediaUrl(filename),
        type: detectMediaType(filename),
        filename: filename
    };
};

module.exports = {
    upload,
    getMediaUrl,
    deleteMedia,
    copyMedia,
    detectMediaType,
    getMediaInfo
};