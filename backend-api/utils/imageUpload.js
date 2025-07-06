const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: async(req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/images/tags');

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

// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Utility function to get image URL
const getImageUrl = (filename) => {
    if (!filename) return null;
    return `/images/tags/${filename}`;
};

// Utility function to delete image
const deleteImage = async(filename) => {
    if (!filename) return;

    try {
        const filePath = path.join(__dirname, '../public/images/tags', filename);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

// Utility function to copy image from source to destination
const copyImage = async(sourcePath, destinationFilename) => {
    try {
        const destPath = path.join(__dirname, '../public/images/tags', destinationFilename);
        await fs.copyFile(sourcePath, destPath);
        return getImageUrl(destinationFilename);
    } catch (error) {
        console.error('Error copying image:', error);
        throw error;
    }
};

module.exports = {
    upload,
    getImageUrl,
    deleteImage,
    copyImage
};