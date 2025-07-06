# Database Seeding System

This document explains how to use the comprehensive seeding system for the Story Management API.

## Overview

The seeding system provides:
- **Tag Seeding**: Pre-populate the database with predefined tags
- **Image Management**: Handle tag thumbnail images
- **Flexible Setup**: Easy setup and maintenance

## Quick Start

### 1. Run Migrations First
```bash
npm run migrate
```

### 2. Set Up Images (Optional)
If you have tag thumbnail images:
```bash
# Copy images from your source folder
npm run setup:images <path-to-your-images-folder>

# Example:
npm run setup:images ./tag-images
```

### 3. Seed the Database
```bash
# Seed all data
npm run seed:all

# Or seed only tags
npm run seed:tags
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run seed` | Run all seeders |
| `npm run seed:all` | Run all seeders |
| `npm run seed:tags` | Seed only tags |
| `npm run setup:images` | Set up tag images from source folder |

## Image Setup

### Expected Image Files
The system expects these image files in your source folder:

- `action.png`
- `adventure.webp`
- `fantasy.webp`
- `ancient.jpeg`
- `comedy.webp`
- `drama.webp`
- `ecchi.png`
- `male-main-protagonist.png`
- `light-hearted.png`
- `future.jpeg`
- `harem.jpeg`
- `multiple-heroines.png`
- `hentai.png`
- `horror.webp`
- `isekai.png`
- `magic.jpeg`
- `medieval.jpeg`
- `mystery.jpeg`
- `modern.jpeg`
- `mecha.jpeg`
- `military.jpeg`
- `psychological.jpeg`
- `romance.webp`
- `supernatural.jpeg`
- `sci-fi.jpeg`
- `sports.jpeg`
- `slice-of-life.jpeg`
- `school-life.jpeg`
- `thriller.webp`

### Image Setup Process
1. Create a folder with your tag images
2. Ensure images have the exact filenames listed above
3. Run: `npm run setup:images <your-folder-path>`
4. Images will be copied to `public/images/tags/`
5. URLs will be automatically generated as `/images/tags/filename`

## Tag Data

The seeder creates 30 predefined tags with:
- **Title**: Human-readable tag name
- **Thumb URL**: Path to thumbnail image
- **Short Description**: Brief description of the tag

### Sample Tags
- **Action**: Fast-paced battles and excitement
- **Adventure**: Exploration and thrilling quests
- **Fantasy**: Magic and mythical worlds
- **Romance**: Love and relationships
- **Sci-Fi**: Futuristic tech and space

## File Structure

```
backend-api/
├── seeders/
│   ├── index.js          # Main seeder orchestrator
│   └── tagSeeder.js      # Tag-specific seeder
├── public/
│   └── images/
│       └── tags/         # Tag thumbnail images
├── utils/
│   └── imageUpload.js    # Image handling utilities
├── seed.js               # Standalone seeder script
├── setup-images.js       # Image setup script
└── SEEDING.md           # This documentation
```

## API Integration

### Image Serving
Images are served statically at `/images/tags/` and can be accessed via:
- `http://localhost:3000/images/tags/action.png`
- `http://localhost:3000/images/tags/romance.webp`

### Tag Endpoints
- `GET /tags` - List all tags with pagination
- `POST /tags` - Create new tag (with image upload)
- `PUT /tags/:id` - Update tag (with image upload)
- `DELETE /tags/:id` - Delete tag (removes image)
- `GET /tags/search?q=term` - Search tags

### Image Upload
Tags support image uploads via multipart/form-data:
```bash
curl -X POST http://localhost:3000/tags \
  -F "title=New Tag" \
  -F "short_description=Description" \
  -F "image=@/path/to/image.png"
```

## Error Handling

The seeding system includes comprehensive error handling:
- **Missing Images**: Gracefully handles missing image files
- **Database Errors**: Proper error messages and rollback
- **File System Errors**: Handles permission and path issues
- **Validation**: Ensures data integrity

## Development

### Adding New Tags
1. Edit `seeders/tagSeeder.js`
2. Add new tag data to `tagData` array
3. Add corresponding image to `setup-images.js`
4. Run `npm run seed:tags`

### Customizing Images
1. Place images in `public/images/tags/`
2. Update tag data with correct filenames
3. Images are automatically served at `/images/tags/`

## Troubleshooting

### Common Issues

**Images not loading:**
- Check that images exist in `public/images/tags/`
- Verify file permissions
- Ensure correct file extensions

**Seeding fails:**
- Run migrations first: `npm run migrate`
- Check database connection
- Verify model definitions

**Image upload fails:**
- Check file size (5MB limit)
- Verify file type (jpeg, jpg, png, gif, webp)
- Ensure upload directory exists

### Debug Mode
Run seeders with verbose logging:
```bash
DEBUG=* npm run seed:tags
```

## Production Considerations

1. **Image Optimization**: Consider compressing images for better performance
2. **CDN**: Use a CDN for image serving in production
3. **Backup**: Regularly backup the `public/images/` directory
4. **Security**: Validate uploaded images and scan for malware
5. **Storage**: Consider cloud storage for large image collections 