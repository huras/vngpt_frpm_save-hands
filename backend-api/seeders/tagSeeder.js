const { Tag } = require('../models');

const tagData = [{
        title: 'Action',
        thumb_url: '/images/tags/action.png',
        short_description: 'Fast-paced battles and excitement'
    },
    {
        title: 'Adventure',
        thumb_url: '/images/tags/adventure.webp',
        short_description: 'Exploration and thrilling quests'
    },
    {
        title: 'Fantasy',
        thumb_url: '/images/tags/fantasy.webp',
        short_description: 'Magic and mythical worlds'
    },
    {
        title: 'Ancient',
        thumb_url: '/images/tags/ancient.jpeg',
        short_description: 'Stories set in the past'
    },
    {
        title: 'Comedy',
        thumb_url: '/images/tags/comedy.webp',
        short_description: 'Humor and light-hearted fun'
    },
    {
        title: 'Drama',
        thumb_url: '/images/tags/drama.webp',
        short_description: 'Emotional conflicts and tension'
    },
    {
        title: 'Ecchi',
        thumb_url: '/images/tags/ecchi.png',
        short_description: 'Lighthearted sexual humor, accidental nudity, or provocative scenes but avoids explicit intercourse. Erotic scenes, but unlike hentai they do not show sexual relations directly'
    },
    {
        title: 'Male Main Protagonist',
        thumb_url: '/images/tags/male-main-protagonist.png',
        short_description: 'The main character is male'
    },
    {
        title: 'Light Hearted',
        thumb_url: '/images/tags/light-hearted.png',
        short_description: 'The story is light and fun'
    },
    {
        title: 'Future',
        thumb_url: '/images/tags/future.jpeg',
        short_description: 'Advanced societies and tech'
    },
    {
        title: 'Harem',
        thumb_url: '/images/tags/harem.jpeg',
        short_description: 'Multiple romantic interests'
    },
    {
        title: 'Multiple Heroines',
        thumb_url: '/images/tags/multiple-heroines.png',
        short_description: 'The story features multiple female characters as secondary protagonists.'
    },
    {
        title: 'Hentai',
        thumb_url: '/images/tags/hentai.png',
        short_description: 'Erotic content.'
    },
    {
        title: 'Horror',
        thumb_url: '/images/tags/horror.webp',
        short_description: 'Fearful and eerie tales'
    },
    {
        title: 'Isekai',
        thumb_url: '/images/tags/isekai-2.jpeg',
        short_description: 'Transported to another world'
    },
    {
        title: 'Magic',
        thumb_url: '/images/tags/magic.jpeg',
        short_description: 'Spells and enchantments'
    },
    {
        title: 'Medieval',
        thumb_url: '/images/tags/medieval.jpeg',
        short_description: 'Kings, Kingdoms, Knights and Castles'
    },
    {
        title: 'Mystery',
        thumb_url: '/images/tags/mystery.jpeg',
        short_description: 'Puzzles and secrets to unravel'
    },
    {
        title: 'Modern',
        thumb_url: '/images/tags/modern.jpeg',
        short_description: 'Contemporary settings'
    },
    {
        title: 'Mecha',
        thumb_url: '/images/tags/mecha.jpeg',
        short_description: 'Giant robots and battles'
    },
    {
        title: 'Military',
        thumb_url: '/images/tags/military.jpeg',
        short_description: 'War and strategy'
    },
    {
        title: 'Psychological',
        thumb_url: '/images/tags/psychological.jpeg',
        short_description: 'Mind games and deep thoughts'
    },
    {
        title: 'Romance',
        thumb_url: '/images/tags/romance.webp',
        short_description: 'Love and relationships'
    },
    {
        title: 'Supernatural',
        thumb_url: '/images/tags/supernatural.jpeg',
        short_description: 'Ghosts and otherworldly beings'
    },
    {
        title: 'Sci-Fi',
        thumb_url: '/images/tags/sci-fi.jpeg',
        short_description: 'Futuristic tech and space'
    },
    {
        title: 'Sports',
        thumb_url: '/images/tags/sports.jpeg',
        short_description: 'Competitions and teamwork'
    },
    {
        title: 'Slice of Life',
        thumb_url: '/images/tags/slice-of-life.jpeg',
        short_description: 'Everyday life and moments'
    },
    {
        title: 'School Life',
        thumb_url: '/images/tags/school-life.jpeg',
        short_description: 'High school and friendships'
    },
    {
        title: 'Thriller',
        thumb_url: '/images/tags/thriller.webp',
        short_description: 'Suspense and intense moments'
    }
];

const seedTags = async() => {
    try {
        console.log('🌱 Starting tag seeding...');

        // Clear existing tags
        await Tag.destroy({ where: {} });
        console.log('🗑️  Cleared existing tags');

        // Create tags one by one to handle potential duplicates gracefully
        const createdTags = [];
        for (const tagDataItem of tagData) {
            try {
                const tag = await Tag.create(tagDataItem);
                createdTags.push(tag);
                console.log(`  ✅ Created: ${tag.title}`);
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log(`  ⚠️  Skipped (already exists): ${tagDataItem.title}`);
                } else {
                    console.error(`  ❌ Error creating ${tagDataItem.title}:`, error.message);
                }
            }
        }

        console.log(`\n✅ Successfully seeded ${createdTags.length} tags`);

        return createdTags;
    } catch (error) {
        console.error('❌ Error seeding tags:', error);
        throw error;
    }
};

module.exports = { seedTags, tagData };