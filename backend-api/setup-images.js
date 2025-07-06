#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { copyImage } = require('./utils/imageUpload');

const setupImages = async(sourceFolder) => {
    try {
        console.log('🖼️  Setting up tag images...\n');

        if (!sourceFolder) {
            console.error('❌ Please provide the source folder path');
            console.log('Usage: node setup-images.js <source-folder-path>');
            console.log('Example: node setup-images.js ./tag-images');
            process.exit(1);
        }

        // Check if source folder exists
        try {
            await fs.access(sourceFolder);
        } catch (error) {
            console.error(`❌ Source folder not found: ${sourceFolder}`);
            process.exit(1);
        }

        // Define the expected image files
        const expectedImages = [
            'action.png',
            'adventure.webp',
            'fantasy.webp',
            'ancient.jpeg',
            'comedy.webp',
            'drama.webp',
            'ecchi.png',
            'male-main-protagonist.png',
            'light-hearted.png',
            'future.jpeg',
            'harem.jpeg',
            'multiple-heroines.png',
            'hentai.png',
            'horror.webp',
            'isekai.png',
            'magic.jpeg',
            'medieval.jpeg',
            'mystery.jpeg',
            'modern.jpeg',
            'mecha.jpeg',
            'military.jpeg',
            'psychological.jpeg',
            'romance.webp',
            'supernatural.jpeg',
            'sci-fi.jpeg',
            'sports.jpeg',
            'slice-of-life.jpeg',
            'school-life.jpeg',
            'thriller.webp'
        ];

        const imagesDir = path.join(__dirname, 'public/images/tags');

        // Ensure images directory exists
        await fs.mkdir(imagesDir, { recursive: true });

        let copiedCount = 0;
        let missingCount = 0;

        for (const imageFile of expectedImages) {
            const sourcePath = path.join(sourceFolder, imageFile);

            try {
                await fs.access(sourcePath);
                await copyImage(sourcePath, imageFile);
                console.log(`✅ Copied: ${imageFile}`);
                copiedCount++;
            } catch (error) {
                console.log(`⚠️  Missing: ${imageFile}`);
                missingCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`  ✅ Copied: ${copiedCount} images`);
        console.log(`  ⚠️  Missing: ${missingCount} images`);

        if (missingCount > 0) {
            console.log(`\n💡 Place the missing images in: ${sourceFolder}`);
            console.log(`   Then run this script again.`);
        }

        console.log(`\n🎉 Image setup completed!`);
        console.log(`   Images are now available at: /images/tags/`);

    } catch (error) {
        console.error('❌ Error setting up images:', error);
        process.exit(1);
    }
};

// Get source folder from command line arguments
const sourceFolder = process.argv[2];
setupImages(sourceFolder);