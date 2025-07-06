const { Tag } = require('../models');

const tagData = [
    // --- General Genres (with images for existing tags) ---
    { title: 'Fiction', short_description: 'Imaginative or invented stories', category: 'general', keywords: 'fiction, story, narrative, invented, imaginative', thumb_url: '/images/tags/fiction.mp4' },
    { title: 'Non-Fiction', short_description: 'Based on real events or facts', category: 'general', keywords: 'non-fiction, real, factual, documentary, biography', thumb_url: null },
    { title: 'Drama', short_description: 'Emotional conflicts and tension', category: 'drama_emotional', keywords: 'drama, emotional, conflict, tension, serious, deep, meaningful', thumb_url: '/images/tags/drama.webp' },
    { title: 'Comedy', short_description: 'Humor and light-hearted fun', category: 'comedy_light', keywords: 'comedy, humor, funny, light-hearted, amusing, entertaining, joke', thumb_url: '/images/tags/comedy.webp' },
    { title: 'Action', short_description: 'Fast-paced battles and excitement', category: 'action_adventure', keywords: 'action, battle, fight, combat, exciting, fast-paced, adrenaline, intense', thumb_url: '/images/tags/action.png' },
    { title: 'Romance', short_description: 'Love and relationships', category: 'romance_relationships', keywords: 'romance, love, relationship, romantic, couple, dating, affection', thumb_url: '/images/tags/romance.webp' },
    { title: 'Fantasy', short_description: 'Magic and mythical worlds', category: 'fantasy_magic', keywords: 'fantasy, magic, mythical, magical, enchanted, mystical, supernatural', thumb_url: '/images/tags/fantasy.webp' },
    { title: 'Sci-Fi', short_description: 'Futuristic tech and space', category: 'scifi_future', keywords: 'sci-fi, science fiction, futuristic, technology, space, advanced, tech', thumb_url: '/images/tags/sci-fi.jpeg' },
    { title: 'Horror', short_description: 'Fearful and eerie tales', category: 'horror_dark', keywords: 'horror, scary, frightening, eerie, dark, terrifying, spooky', thumb_url: '/images/tags/horror.webp' },
    { title: 'Mystery', short_description: 'Puzzles and secrets to unravel', category: 'drama_emotional', keywords: 'mystery, puzzle, secret, detective, investigation, clue, suspense', thumb_url: '/images/tags/mystery.jpeg' },
    { title: 'Adventure', short_description: 'Exploration and thrilling quests', category: 'action_adventure', keywords: 'adventure, exploration, quest, journey, discovery, travel, expedition', thumb_url: '/images/tags/adventure.webp' },
    { title: 'Slice of Life', short_description: 'Everyday life and moments', category: 'comedy_light', keywords: 'slice of life, everyday, daily, normal, routine, realistic, mundane', thumb_url: '/images/tags/slice-of-life.jpeg' },
    { title: 'Historical', short_description: 'Stories set in the past', category: 'historical_period', keywords: 'historical, past, old, traditional, classical, heritage', thumb_url: null },
    { title: 'Thriller', short_description: 'Suspense and intense moments', category: 'action_adventure', keywords: 'thriller, suspense, tension, intense, gripping, edge-of-seat, dramatic', thumb_url: '/images/tags/thriller.webp' },
    { title: 'Supernatural', short_description: 'Ghosts and otherworldly beings', category: 'fantasy_magic', keywords: 'supernatural, ghost, paranormal, otherworldly, spirit, mystical', thumb_url: '/images/tags/supernatural.jpeg' },
    { title: 'Sports', short_description: 'Competitions and teamwork', category: 'school_youth', keywords: 'sports, competition, teamwork, athletic, game, tournament, victory', thumb_url: '/images/tags/sports.jpeg' },
    { title: 'Military', short_description: 'War and strategy', category: 'military_strategy', keywords: 'military, war, strategy, army, soldier, battle, tactical, combat', thumb_url: '/images/tags/military.jpeg' },
    { title: 'School Life', short_description: 'High school and friendships', category: 'school_youth', keywords: 'school, high school, student, education, friendship, youth, teenage', thumb_url: '/images/tags/school-life.jpeg' },
    { title: 'Modern', short_description: 'Contemporary settings', category: 'modern_contemporary', keywords: 'modern, contemporary, current, present-day, today, realistic', thumb_url: '/images/tags/modern.jpeg' },
    { title: 'Ancient', short_description: 'Stories set in the past', category: 'historical_period', keywords: 'ancient, historical, past, old, traditional, classical, heritage', thumb_url: '/images/tags/ancient.jpeg' },
    { title: 'Medieval', short_description: 'Kings, Kingdoms, Knights and Castles', category: 'historical_period', keywords: 'medieval, kingdom, knight, castle, royal, chivalry, middle ages', thumb_url: '/images/tags/medieval.jpeg' },
    { title: 'Future', short_description: 'Advanced societies and tech', category: 'scifi_future', keywords: 'future, advanced, technology, modern, progressive, innovative', thumb_url: '/images/tags/future.jpeg' },
    { title: 'Isekai', short_description: 'Transported to another world', category: 'isekai_fantasy_worlds', keywords: 'isekai, another world, transported, reincarnation, fantasy world, parallel', thumb_url: '/images/tags/isekai-2.jpeg' },
    { title: 'Mecha', short_description: 'Giant robots and battles', category: 'scifi_future', keywords: 'mecha, robot, giant, machine, mechanical, technology, battle', thumb_url: '/images/tags/mecha.jpeg' },
    { title: 'Light Hearted', short_description: 'Cheerful and uplifting stories', category: 'mood', keywords: 'light-hearted, cheerful, uplifting, positive, fun, feel-good', thumb_url: '/images/tags/light-hearted.png' },
    { title: 'Psychological', short_description: 'Mind games and deep thoughts', category: 'drama_emotional', keywords: 'psychological, mind, mental, thought-provoking, deep, complex, cerebral', thumb_url: '/images/tags/psychological.jpeg' },
    { title: 'Harem', short_description: 'Multiple romantic interests', category: 'romance_relationships', keywords: 'harem, multiple, romantic, love triangle, polyamory, relationship', thumb_url: '/images/tags/harem.jpeg' },
    { title: 'Multiple Heroines', short_description: 'Multiple female protagonists', category: 'character_focus', keywords: 'multiple heroines, female characters, ensemble, diverse, group', thumb_url: '/images/tags/multiple-heroines.png' },
    { title: 'Ecchi', short_description: 'Lighthearted sexual humor', category: 'adult_content', keywords: 'ecchi, fanservice, provocative, suggestive, adult humor, mature', thumb_url: '/images/tags/ecchi.png' },
    { title: 'Hentai', short_description: 'Erotic content', category: 'adult_content', keywords: 'hentai, adult, erotic, explicit, mature, sexual, pornographic', thumb_url: '/images/tags/hentai.png' },
    { title: 'Male Main Protagonist', short_description: 'The main character is male', category: 'character_focus', keywords: 'male protagonist, main character, hero, lead, central character', thumb_url: '/images/tags/male-main-protagonist.png' },

    // --- Mood & Tone ---
    { title: 'Dark', short_description: 'Serious, grim, or tragic tone', category: 'mood', keywords: 'dark, grim, tragic, serious, somber, bleak', thumb_url: '/images/tags/dark.jpeg' },
    { title: 'Uplifting', short_description: 'Inspiring and positive stories', category: 'mood', keywords: 'uplifting, inspiring, positive, motivational, heartwarming' },
    { title: 'Tragic', short_description: 'Sad or heartbreaking stories', category: 'mood', keywords: 'tragic, sad, heartbreaking, loss, sorrow, emotional' },
    { title: 'Suspenseful', short_description: 'Stories full of suspense', category: 'mood', keywords: 'suspenseful, tension, thrilling, edge-of-seat, dramatic' },
    { title: 'Wholesome', short_description: 'Feel-good, pure, and kind stories', category: 'mood', keywords: 'wholesome, pure, kind, heartwarming, gentle, positive' },
    { title: 'Satirical', short_description: 'Satire and parody', category: 'mood', keywords: 'satirical, parody, humor, mockery, irony, sarcasm' },
    { title: 'Philosophical', short_description: 'Explores deep ideas and meaning', category: 'mood', keywords: 'philosophical, deep, meaning, existential, thought-provoking' },

    // --- Audience ---
    { title: 'Kids', short_description: 'Suitable for children', category: 'audience', keywords: 'kids, children, young, family, safe', thumb_url: '/images/tags/kids.jpeg' },
    { title: 'Teens', short_description: 'Suitable for teenagers', category: 'audience', keywords: 'teens, teenagers, young adult, coming of age', thumb_url: '/images/tags/teens.jpeg' },
    { title: 'Adults', short_description: 'Suitable for adults', category: 'audience', keywords: 'adults, mature, grown-up, explicit', thumb_url: '/images/tags/adults.jpeg' },
    { title: 'Family', short_description: 'Enjoyable for all ages', category: 'audience', keywords: 'family, all ages, everyone, together' },
    { title: 'Mature', short_description: 'For mature audiences', category: 'audience', keywords: 'mature, explicit, adult, 18+' },
    { title: 'All Ages', short_description: 'Appropriate for everyone', category: 'audience', keywords: 'all ages, everyone, universal, family' },

    // --- Subgenres & Specific Genres ---
    { title: 'Cyberpunk', short_description: 'High-tech, low-life dystopian future', category: 'scifi_future', keywords: 'cyberpunk, dystopian, future, technology, neon, hacker', thumb_url: '/images/tags/cyberpunk.jpeg' },
    { title: 'Steampunk', short_description: 'Steam-powered alternate history', category: 'historical_period', keywords: 'steampunk, steam, alternate history, gears, Victorian, retrofuturism' },
    { title: 'Space Opera', short_description: 'Epic adventures in space', category: 'scifi_future', keywords: 'space opera, epic, space, adventure, galaxy, starship' },
    { title: 'Urban Fantasy', short_description: 'Magic in a modern city', category: 'fantasy_magic', keywords: 'urban fantasy, magic, city, modern, supernatural' },
    { title: 'High Fantasy', short_description: 'Epic fantasy in a unique world', category: 'fantasy_magic', keywords: 'high fantasy, epic, world, magic, mythical, adventure' },
    { title: 'Magical Girl', short_description: 'Girls with magical powers', category: 'fantasy_magic', keywords: 'magical girl, magic, transformation, heroine, cute' },
    { title: 'Psychological Thriller', short_description: 'Mind games and suspense', category: 'drama_emotional', keywords: 'psychological, thriller, suspense, mind games, tension' },
    { title: 'Romantic Comedy', short_description: 'Love and laughs', category: 'romance_relationships', keywords: 'romantic comedy, romance, humor, love, funny' },
    { title: 'Reverse Harem', short_description: 'One girl, many boys', category: 'romance_relationships', keywords: 'reverse harem, romance, multiple boys, love triangle' },
    { title: 'Yuri', short_description: 'Girls love girls', category: 'romance_relationships', keywords: 'yuri, girls love, romance, lgbt, sapphic' },
    { title: 'Yaoi', short_description: 'Boys love boys', category: 'romance_relationships', keywords: 'yaoi, boys love, romance, lgbt, bl' },
    { title: 'Redemption', short_description: 'Seeking forgiveness and change', category: 'tropes', keywords: 'redemption, forgiveness, change, growth, atonement' },
    { title: 'Coming of Age', short_description: 'Growing up and maturing', category: 'tropes', keywords: 'coming of age, growth, maturity, youth, life lessons' },
    { title: 'Found Family', short_description: 'Friends become family', category: 'tropes', keywords: 'found family, friendship, support, belonging, home' },
    { title: 'Betrayal', short_description: 'Trust is broken', category: 'tropes', keywords: 'betrayal, trust, deception, drama, conflict', thumb_url: '/images/tags/betrayal.jpeg' },
    { title: 'Secret Identity', short_description: 'Hidden true self', category: 'tropes', keywords: 'secret identity, disguise, hidden, alter ego' },
    { title: 'Amnesia', short_description: 'Lost memories', category: 'tropes', keywords: 'amnesia, memory loss, forgotten, rediscovery', thumb_url: '/images/tags/amnesia.jpeg' },
    { title: 'Tournament Arc', short_description: 'Competition storyline', category: 'tropes', keywords: 'tournament, competition, arc, battle, challenge' },
    { title: 'Power of Friendship', short_description: 'Friendship saves the day', category: 'tropes', keywords: 'friendship, power, support, teamwork, bond' },
    { title: 'MacGuffin', short_description: 'Object that drives the plot', category: 'tropes', keywords: 'macguffin, object, plot device, quest, goal' },
    { title: 'Prophecy', short_description: 'Foretold destiny', category: 'tropes', keywords: 'prophecy, destiny, fate, prediction, legend' },
    { title: 'Secret Society', short_description: 'Hidden organizations', category: 'tropes', keywords: 'secret society, organization, hidden, conspiracy' },
    { title: 'Hidden Power', short_description: 'Undiscovered abilities', category: 'tropes', keywords: 'hidden power, ability, secret, potential' },
    { title: 'Forbidden Love', short_description: 'Love against the odds', category: 'tropes', keywords: 'forbidden love, romance, taboo, conflict' },
    { title: 'Lost Civilization', short_description: 'Ancient, forgotten societies', category: 'tropes', keywords: 'lost civilization, ancient, forgotten, ruins, history' },
    { title: 'Ancient Artifact', short_description: 'Powerful old object', category: 'tropes', keywords: 'ancient artifact, object, power, history, legend', thumb_url: '/images/tags/ancient-artifact.jpeg' },
    { title: 'Body Swap', short_description: 'Characters switch bodies', category: 'tropes', keywords: 'body swap, switch, identity, comedy, drama', thumb_url: '/images/tags/body-swap.png' },
    { title: 'Parallel Timelines', short_description: 'Multiple realities', category: 'tropes', keywords: 'parallel timelines, alternate reality, multiverse, time', thumb_url: '/images/tags/parallel-timelines.jpeg' },
    { title: 'Alternate Endings', short_description: 'Different possible outcomes', category: 'tropes', keywords: 'alternate endings, outcomes, possibilities, story', thumb_url: '/images/tags/alternate-endings.jpeg' },

    // --- Character Archetypes ---
    { title: 'Antihero', short_description: 'A flawed or morally gray protagonist', category: 'character_archetype', keywords: 'antihero, flawed, gray, protagonist, complex', thumb_url: '/images/tags/antihero.jpeg' },
    { title: 'Villain Protagonist', short_description: 'The main character is a villain', category: 'character_archetype', keywords: 'villain protagonist, villain, main character, antihero' },
    { title: 'Strong Female Lead', short_description: 'A powerful and independent woman', category: 'character_archetype', keywords: 'strong female lead, woman, heroine, independent, powerful' },
    { title: 'Mentor', short_description: 'A wise guide or teacher', category: 'character_archetype', keywords: 'mentor, guide, teacher, wisdom, support' },
    { title: 'Sidekick', short_description: 'A loyal companion', category: 'character_archetype', keywords: 'sidekick, companion, friend, support, helper' },
    { title: 'Comic Relief', short_description: 'Provides humor in the story', category: 'character_archetype', keywords: 'comic relief, humor, funny, comedy, light-hearted', thumb_url: '/images/tags/comic-relief.jpeg' },
    { title: 'Animal Companion', short_description: 'A pet or animal friend', category: 'character_archetype', keywords: 'animal companion, pet, animal, friend, support', thumb_url: '/images/tags/animal-companion.jpeg' },
    { title: 'Child Prodigy', short_description: 'A gifted young character', category: 'character_archetype', keywords: 'child prodigy, gifted, young, talented, genius', thumb_url: '/images/tags/child-prodigy.jpeg' },
    { title: 'Chosen One', short_description: 'Destined for greatness', category: 'character_archetype', keywords: 'chosen one, destiny, hero, prophecy, special', thumb_url: '/images/tags/chosen-one.jpeg' },

    // --- Settings ---
    { title: 'Post-Apocalyptic', short_description: 'After a world-ending event', category: 'setting', keywords: 'post-apocalyptic, apocalypse, survival, ruins, future' },
    { title: 'Dystopian', short_description: 'Oppressive, controlled society', category: 'setting', keywords: 'dystopian, society, control, oppression, future', thumb_url: '/images/tags/dystopian.jpeg' },
    { title: 'Utopian', short_description: 'Ideal, perfect society', category: 'setting', keywords: 'utopian, perfect, ideal, society, harmony' },
    { title: 'Virtual Reality', short_description: 'Stories set in digital worlds', category: 'setting', keywords: 'virtual reality, digital, online, game, simulation' },
    { title: 'Parallel World', short_description: 'Alternate universes', category: 'setting', keywords: 'parallel world, alternate universe, multiverse, reality', thumb_url: '/images/tags/parallel-world.jpeg' },
    { title: 'Alternate History', short_description: 'History with a twist', category: 'setting', keywords: 'alternate history, what if, historical, different', thumb_url: '/images/tags/alternate-history.jpeg' },
    { title: 'Space Colony', short_description: 'Life on other planets', category: 'setting', keywords: 'space colony, planet, space, future, sci-fi' },
    { title: 'Small Town', short_description: 'Stories in a small community', category: 'setting', keywords: 'small town, community, rural, local, village' },
    { title: 'Big City', short_description: 'Urban, bustling environments', category: 'setting', keywords: 'big city, urban, metropolis, modern, busy', thumb_url: '/images/tags/big-city.jpeg' },
    { title: 'Boarding School', short_description: 'School as a main setting', category: 'setting', keywords: 'boarding school, school, dormitory, students, youth', thumb_url: '/images/tags/boarding-school.jpeg' },
    { title: 'Haunted House', short_description: 'Ghosts and supernatural events', category: 'setting', keywords: 'haunted house, ghost, supernatural, scary, horror' },
    { title: 'Island', short_description: 'Stories set on an island', category: 'setting', keywords: 'island, sea, ocean, isolated, adventure' },
    { title: 'Desert', short_description: 'Arid, sandy environments', category: 'setting', keywords: 'desert, sand, arid, hot, survival', thumb_url: '/images/tags/desert.jpeg' },
    { title: 'Forest', short_description: 'Woods and wilderness', category: 'setting', keywords: 'forest, woods, wilderness, nature, trees' },
    { title: 'Underwater', short_description: 'Beneath the sea', category: 'setting', keywords: 'underwater, sea, ocean, aquatic, marine' },
    { title: 'Outer Space', short_description: 'Beyond Earth', category: 'setting', keywords: 'outer space, space, stars, planets, sci-fi' },

    // --- Themes ---
    { title: 'Identity', short_description: 'Exploring self and belonging', category: 'theme', keywords: 'identity, self, belonging, discovery, personal' },
    { title: 'Justice', short_description: 'Righting wrongs', category: 'theme', keywords: 'justice, right, wrong, law, fairness' },
    { title: 'Revenge', short_description: 'Seeking payback', category: 'theme', keywords: 'revenge, payback, justice, conflict' },
    { title: 'Sacrifice', short_description: 'Giving up for others', category: 'theme', keywords: 'sacrifice, selfless, giving, loss, noble' },
    { title: 'Survival', short_description: 'Staying alive against the odds', category: 'theme', keywords: 'survival, life, danger, challenge, endurance' },
    { title: 'Freedom', short_description: 'Breaking free', category: 'theme', keywords: 'freedom, liberation, escape, independence' },
    { title: 'Corruption', short_description: 'Moral decay and downfall', category: 'theme', keywords: 'corruption, decay, downfall, evil, power', thumb_url: '/images/tags/corruption.jpeg' },
    { title: 'Technology vs Nature', short_description: 'Clash of progress and environment', category: 'theme', keywords: 'technology, nature, progress, environment, clash' },
    { title: 'Tradition vs Progress', short_description: 'Old ways vs new ideas', category: 'theme', keywords: 'tradition, progress, old, new, change' },
    { title: 'Family', short_description: 'Family bonds and relationships', category: 'theme', keywords: 'family, bonds, relationship, parents, siblings' },
    { title: 'Friendship', short_description: 'The power of friends', category: 'theme', keywords: 'friendship, friends, bond, support, loyalty' },
    { title: 'Love', short_description: 'Romantic and platonic love', category: 'theme', keywords: 'love, romance, affection, care, relationship' },
    { title: 'War', short_description: 'Conflict and battle', category: 'theme', keywords: 'war, conflict, battle, fight, struggle' },
    { title: 'Peace', short_description: 'Harmony and calm', category: 'theme', keywords: 'peace, harmony, calm, resolution, nonviolence' },
    { title: 'Isolation', short_description: 'Being alone or cut off', category: 'theme', keywords: 'isolation, alone, solitude, separation' },
    { title: 'Discovery', short_description: 'Finding new things', category: 'theme', keywords: 'discovery, exploration, new, adventure, learn', thumb_url: '/images/tags/discovery.jpeg' },
    { title: 'Destiny', short_description: 'Fate and predetermined paths', category: 'theme', keywords: 'destiny, fate, future, prophecy, path', thumb_url: '/images/tags/destiny.jpeg' },
    { title: 'Hope', short_description: 'Optimism and looking forward', category: 'theme', keywords: 'hope, optimism, future, positive' },
    { title: 'Despair', short_description: 'Hopelessness and loss', category: 'theme', keywords: 'despair, hopeless, loss, sadness, tragedy', thumb_url: '/images/tags/despair.jpeg' },
];

const seedTags = async() => {
    try {
        console.log('🌱 Starting enhanced tag seeding...');

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