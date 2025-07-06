const { Tag } = require('../models');

const tagData = [
    // Action & Adventure Category
    {
        title: 'Action',
        thumb_url: '/images/tags/action.png',
        short_description: 'Fast-paced battles and excitement',
        category: 'action_adventure',
        keywords: 'action, battle, fight, combat, exciting, fast-paced, adrenaline, intense'
    },
    {
        title: 'Adventure',
        thumb_url: '/images/tags/adventure.webp',
        short_description: 'Exploration and thrilling quests',
        category: 'action_adventure',
        keywords: 'adventure, exploration, quest, journey, discovery, travel, expedition'
    },
    {
        title: 'Thriller',
        thumb_url: '/images/tags/thriller.webp',
        short_description: 'Suspense and intense moments',
        category: 'action_adventure',
        keywords: 'thriller, suspense, tension, intense, gripping, edge-of-seat, dramatic'
    },

    // Fantasy & Magic Category
    {
        title: 'Fantasy',
        thumb_url: '/images/tags/fantasy.webp',
        short_description: 'Magic and mythical worlds',
        category: 'fantasy_magic',
        keywords: 'fantasy, magic, mythical, magical, enchanted, mystical, supernatural'
    },
    {
        title: 'Magic',
        thumb_url: '/images/tags/magic.jpeg',
        short_description: 'Spells and enchantments',
        category: 'fantasy_magic',
        keywords: 'magic, spells, enchantments, wizard, sorcery, mystical, magical'
    },
    {
        title: 'Supernatural',
        thumb_url: '/images/tags/supernatural.jpeg',
        short_description: 'Ghosts and otherworldly beings',
        category: 'fantasy_magic',
        keywords: 'supernatural, ghost, paranormal, otherworldly, spirit, mystical'
    },

    // Sci-Fi & Future Category
    {
        title: 'Sci-Fi',
        thumb_url: '/images/tags/sci-fi.jpeg',
        short_description: 'Futuristic tech and space',
        category: 'scifi_future',
        keywords: 'sci-fi, science fiction, futuristic, technology, space, advanced, tech'
    },
    {
        title: 'Future',
        thumb_url: '/images/tags/future.jpeg',
        short_description: 'Advanced societies and tech',
        category: 'scifi_future',
        keywords: 'future, advanced, technology, modern, progressive, innovative'
    },
    {
        title: 'Mecha',
        thumb_url: '/images/tags/mecha.jpeg',
        short_description: 'Giant robots and battles',
        category: 'scifi_future',
        keywords: 'mecha, robot, giant, machine, mechanical, technology, battle'
    },

    // Historical & Period Category
    {
        title: 'Ancient',
        thumb_url: '/images/tags/ancient.jpeg',
        short_description: 'Stories set in the past',
        category: 'historical_period',
        keywords: 'ancient, historical, past, old, traditional, classical, heritage'
    },
    {
        title: 'Medieval',
        thumb_url: '/images/tags/medieval.jpeg',
        short_description: 'Kings, Kingdoms, Knights and Castles',
        category: 'historical_period',
        keywords: 'medieval, kingdom, knight, castle, royal, chivalry, middle ages'
    },

    // Drama & Emotional Category
    {
        title: 'Drama',
        thumb_url: '/images/tags/drama.webp',
        short_description: 'Emotional conflicts and tension',
        category: 'drama_emotional',
        keywords: 'drama, emotional, conflict, tension, serious, deep, meaningful'
    },
    {
        title: 'Psychological',
        thumb_url: '/images/tags/psychological.jpeg',
        short_description: 'Mind games and deep thoughts',
        category: 'drama_emotional',
        keywords: 'psychological, mind, mental, thought-provoking, deep, complex, cerebral'
    },
    {
        title: 'Mystery',
        thumb_url: '/images/tags/mystery.jpeg',
        short_description: 'Puzzles and secrets to unravel',
        category: 'drama_emotional',
        keywords: 'mystery, puzzle, secret, detective, investigation, clue, suspense'
    },

    // Romance & Relationships Category
    {
        title: 'Romance',
        thumb_url: '/images/tags/romance.webp',
        short_description: 'Love and relationships',
        category: 'romance_relationships',
        keywords: 'romance, love, relationship, romantic, couple, dating, affection'
    },
    {
        title: 'Harem',
        thumb_url: '/images/tags/harem.jpeg',
        short_description: 'Multiple romantic interests',
        category: 'romance_relationships',
        keywords: 'harem, multiple, romantic, love triangle, polyamory, relationship'
    },
    {
        title: 'Multiple Heroines',
        thumb_url: '/images/tags/multiple-heroines.png',
        short_description: 'The story features multiple female characters as secondary protagonists.',
        category: 'romance_relationships',
        keywords: 'multiple heroines, female characters, ensemble, diverse, group'
    },

    // Comedy & Light Category
    {
        title: 'Comedy',
        thumb_url: '/images/tags/comedy.webp',
        short_description: 'Humor and light-hearted fun',
        category: 'comedy_light',
        keywords: 'comedy, humor, funny, light-hearted, amusing, entertaining, joke'
    },
    {
        title: 'Light Hearted',
        thumb_url: '/images/tags/light-hearted.png',
        short_description: 'The story is light and fun',
        category: 'comedy_light',
        keywords: 'light-hearted, fun, cheerful, positive, uplifting, feel-good'
    },
    {
        title: 'Slice of Life',
        thumb_url: '/images/tags/slice-of-life.jpeg',
        short_description: 'Everyday life and moments',
        category: 'comedy_light',
        keywords: 'slice of life, everyday, daily, normal, routine, realistic, mundane'
    },

    // School & Youth Category
    {
        title: 'School Life',
        thumb_url: '/images/tags/school-life.jpeg',
        short_description: 'High school and friendships',
        category: 'school_youth',
        keywords: 'school, high school, student, education, friendship, youth, teenage'
    },
    {
        title: 'Sports',
        thumb_url: '/images/tags/sports.jpeg',
        short_description: 'Competitions and teamwork',
        category: 'school_youth',
        keywords: 'sports, competition, teamwork, athletic, game, tournament, victory'
    },

    // Military & Strategy Category
    {
        title: 'Military',
        thumb_url: '/images/tags/military.jpeg',
        short_description: 'War and strategy',
        category: 'military_strategy',
        keywords: 'military, war, strategy, army, soldier, battle, tactical, combat'
    },

    // Modern & Contemporary Category
    {
        title: 'Modern',
        thumb_url: '/images/tags/modern.jpeg',
        short_description: 'Contemporary settings',
        category: 'modern_contemporary',
        keywords: 'modern, contemporary, current, present-day, today, realistic'
    },

    // Isekai & Fantasy Worlds Category
    {
        title: 'Isekai',
        thumb_url: '/images/tags/isekai-2.jpeg',
        short_description: 'Transported to another world',
        category: 'isekai_fantasy_worlds',
        keywords: 'isekai, another world, transported, reincarnation, fantasy world, parallel'
    },

    // Character Focus Category
    {
        title: 'Male Main Protagonist',
        thumb_url: '/images/tags/male-main-protagonist.png',
        short_description: 'The main character is male',
        category: 'character_focus',
        keywords: 'male protagonist, main character, hero, lead, central character'
    },

    // Horror & Dark Category
    {
        title: 'Horror',
        thumb_url: '/images/tags/horror.webp',
        short_description: 'Fearful and eerie tales',
        category: 'horror_dark',
        keywords: 'horror, scary, frightening, eerie, dark, terrifying, spooky'
    },

    // Adult Content Category
    {
        title: 'Ecchi',
        thumb_url: '/images/tags/ecchi.png',
        short_description: 'Lighthearted sexual humor, accidental nudity, or provocative scenes but avoids explicit intercourse. Erotic scenes, but unlike hentai they do not show sexual relations directly',
        category: 'adult_content',
        keywords: 'ecchi, fanservice, provocative, suggestive, adult humor, mature'
    },
    {
        title: 'Hentai',
        thumb_url: '/images/tags/hentai.png',
        short_description: 'Erotic content.',
        category: 'adult_content',
        keywords: 'hentai, adult, erotic, explicit, mature, sexual, pornographic'
    }
];

const seedTags = async() => {
    try {
        console.log('🌱 Starting simplified tag seeding...');

        // Clear existing tags
        await Tag.destroy({ where: {} });
        console.log('🗑️  Cleared existing tags');

        // Create tags one by one to handle potential duplicates gracefully
        const createdTags = [];
        for (const tagDataItem of tagData) {
            try {
                const tag = await Tag.create(tagDataItem);
                createdTags.push(tag);
                console.log(`  ✅ Created: ${tag.title} (${tag.category})`);
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log(`  ⚠️  Skipped (already exists): ${tagDataItem.title}`);
                } else {
                    console.error(`  ❌ Error creating ${tagDataItem.title}:`, error.message);
                }
            }
        }

        console.log(`\n✅ Successfully seeded ${createdTags.length} tags`);
        console.log('\n📊 Category Distribution:');

        // Show category distribution
        const categoryCount = {};
        createdTags.forEach(tag => {
            categoryCount[tag.category] = (categoryCount[tag.category] || 0) + 1;
        });

        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} tags`);
        });

        return createdTags;
    } catch (error) {
        console.error('❌ Error seeding tags:', error);
        throw error;
    }
};

module.exports = { seedTags, tagData };