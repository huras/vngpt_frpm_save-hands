const { Tag } = require('../models');

const tagData = [
    // --- General Genres (with images for existing tags) ---
    { title: 'Fiction', short_description: 'Imaginative or invented stories', category: 'general', keywords: 'fiction, story, narrative, invented, imaginative', media_url: '/media/tags/fiction.mp4', media_type: 'video' },
    { title: 'Non-Fiction', short_description: 'Based on real events or facts', category: 'general', keywords: 'non-fiction, real, factual, documentary, biography', media_url: null, media_type: 'image' },
    { title: 'Drama', short_description: 'Emotional conflicts and tension', category: 'drama_emotional', keywords: 'drama, emotional, conflict, tension, serious, deep, meaningful', media_url: '/media/tags/drama.webp', media_type: 'image' },
    { title: 'Comedy', short_description: 'Humor and light-hearted fun', category: 'comedy_light', keywords: 'comedy, humor, funny, light-hearted, amusing, entertaining, joke', media_url: '/media/tags/comedy.webp', media_type: 'image' },
    { title: 'Action', short_description: 'Fast-paced battles and excitement', category: 'action_adventure', keywords: 'action, battle, fight, combat, exciting, fast-paced, adrenaline, intense', media_url: '/media/tags/action.png', media_type: 'image' },
    { title: 'Romance', short_description: 'Love and relationships', category: 'romance_relationships', keywords: 'romance, love, relationship, romantic, couple, dating, affection', media_url: '/media/tags/romance.webp', media_type: 'image' },
    { title: 'Fantasy', short_description: 'Magic and mythical worlds', category: 'fantasy_magic', keywords: 'fantasy, magic, mythical, magical, enchanted, mystical, supernatural', media_url: '/media/tags/fantasy.webp', media_type: 'image' },
    { title: 'Sci-Fi', short_description: 'Futuristic tech and space', category: 'scifi_future', keywords: 'sci-fi, science fiction, futuristic, technology, space, advanced, tech', media_url: '/media/tags/sci-fi.jpeg', media_type: 'image' },
    { title: 'Horror', short_description: 'Fearful and eerie tales', category: 'horror_dark', keywords: 'horror, scary, frightening, eerie, dark, terrifying, spooky', media_url: '/media/tags/horror.webp', media_type: 'image' },
    { title: 'Mystery', short_description: 'Puzzles and secrets to unravel', category: 'drama_emotional', keywords: 'mystery, puzzle, secret, detective, investigation, clue, suspense', media_url: '/media/tags/mystery.jpeg', media_type: 'image' },
    { title: 'Adventure', short_description: 'Exploration and thrilling quests', category: 'action_adventure', keywords: 'adventure, exploration, quest, journey, discovery, travel, expedition', media_url: '/media/tags/adventure.webp', media_type: 'image' },
    { title: 'Slice of Life', short_description: 'Everyday life and moments', category: 'comedy_light', keywords: 'slice of life, everyday, daily, normal, routine, realistic, mundane', media_url: '/media/tags/slice-of-life.jpeg', media_type: 'image' },
    { title: 'Historical', short_description: 'Stories set in the past', category: 'historical_period', keywords: 'historical, past, old, traditional, classical, heritage', media_url: null, media_type: 'image' },
    { title: 'Thriller', short_description: 'Suspense and intense moments', category: 'action_adventure', keywords: 'thriller, suspense, tension, intense, gripping, edge-of-seat, dramatic', media_url: '/media/tags/thriller.webp', media_type: 'image' },
    { title: 'Supernatural', short_description: 'Ghosts and otherworldly beings', category: 'fantasy_magic', keywords: 'supernatural, ghost, paranormal, otherworldly, spirit, mystical', media_url: '/media/tags/supernatural.jpeg', media_type: 'image' },
    { title: 'Sports', short_description: 'Competitions and teamwork', category: 'school_youth', keywords: 'sports, competition, teamwork, athletic, game, tournament, victory', media_url: '/media/tags/sports.jpeg', media_type: 'image' },
    { title: 'Military', short_description: 'War and strategy', category: 'military_strategy', keywords: 'military, war, strategy, army, soldier, battle, tactical, combat', media_url: '/media/tags/military.jpeg', media_type: 'image' },
    { title: 'School Life', short_description: 'High school and friendships', category: 'school_youth', keywords: 'school, high school, student, education, friendship, youth, teenage', media_url: '/media/tags/school-life.jpeg', media_type: 'image' },
    { title: 'Modern', short_description: 'Contemporary settings', category: 'modern_contemporary', keywords: 'modern, contemporary, current, present-day, today, realistic', media_url: '/media/tags/modern.jpeg', media_type: 'image' },
    { title: 'Ancient', short_description: 'Stories set in the past', category: 'historical_period', keywords: 'ancient, historical, past, old, traditional, classical, heritage', media_url: '/media/tags/ancient.jpeg', media_type: 'image' },
    { title: 'Medieval', short_description: 'Kings, Kingdoms, Knights and Castles', category: 'historical_period', keywords: 'medieval, kingdom, knight, castle, royal, chivalry, middle ages', media_url: '/media/tags/medieval.jpeg', media_type: 'image' },
    { title: 'Future', short_description: 'Advanced societies and tech', category: 'scifi_future', keywords: 'future, advanced, technology, modern, progressive, innovative', media_url: '/media/tags/future.jpeg', media_type: 'image' },
    { title: 'Isekai', short_description: 'Transported to another world', category: 'isekai_fantasy_worlds', keywords: 'isekai, another world, transported, reincarnation, fantasy world, parallel', media_url: '/media/tags/isekai-2.jpeg', media_type: 'image' },
    { title: 'Mecha', short_description: 'Giant robots and battles', category: 'scifi_future', keywords: 'mecha, robot, giant, machine, mechanical, technology, battle', media_url: '/media/tags/mecha.jpeg', media_type: 'image' },
    { title: 'Light Hearted', short_description: 'Cheerful and uplifting stories', category: 'mood', keywords: 'light-hearted, cheerful, uplifting, positive, fun, feel-good', media_url: '/media/tags/light-hearted.png', media_type: 'image' },
    { title: 'Psychological', short_description: 'Mind games and deep thoughts', category: 'drama_emotional', keywords: 'psychological, mind, mental, thought-provoking, deep, complex, cerebral', media_url: '/media/tags/psychological.jpeg', media_type: 'image' },
    { title: 'Harem', short_description: 'Multiple romantic interests', category: 'romance_relationships', keywords: 'harem, multiple, romantic, love triangle, polyamory, relationship', media_url: '/media/tags/harem.jpeg', media_type: 'image' },
    { title: 'Multiple Heroines', short_description: 'Multiple female protagonists', category: 'character_focus', keywords: 'multiple heroines, female characters, ensemble, diverse, group', media_url: '/media/tags/multiple-heroines.png', media_type: 'image' },
    { title: 'Ecchi', short_description: 'Lighthearted sexual humor', category: 'adult_content', keywords: 'ecchi, fanservice, provocative, suggestive, adult humor, mature', media_url: '/media/tags/ecchi.png', media_type: 'image' },
    { title: 'Hentai', short_description: 'Erotic content', category: 'adult_content', keywords: 'hentai, adult, erotic, explicit, mature, sexual, pornographic', media_url: '/media/tags/hentai.png', media_type: 'image' },
    { title: 'Male Main Protagonist', short_description: 'The main character is male', category: 'character_focus', keywords: 'male protagonist, main character, hero, lead, central character', media_url: '/media/tags/male-main-protagonist.png', media_type: 'image' },

    // --- Mood & Tone ---
    { title: 'Dark', short_description: 'Serious, grim, or tragic tone', category: 'mood', keywords: 'dark, grim, tragic, serious, somber, bleak', media_url: '/media/tags/dark.jpeg', media_type: 'image' },
    { title: 'Uplifting', short_description: 'Inspiring and positive stories', category: 'mood', keywords: 'uplifting, inspiring, positive, motivational, heartwarming', media_url: null, media_type: 'video' },
    { title: 'Tragic', short_description: 'Sad or heartbreaking stories', category: 'mood', keywords: 'tragic, sad, heartbreaking, loss, sorrow, emotional', media_url: null, media_type: 'video' },
    { title: 'Suspenseful', short_description: 'Stories full of suspense', category: 'mood', keywords: 'suspenseful, tension, thrilling, edge-of-seat, dramatic', media_url: null, media_type: 'video' },
    { title: 'Wholesome', short_description: 'Feel-good, pure, and kind stories', category: 'mood', keywords: 'wholesome, pure, kind, heartwarming, gentle, positive', media_url: null, media_type: 'video' },
    { title: 'Satirical', short_description: 'Satire and parody', category: 'mood', keywords: 'satirical, parody, humor, mockery, irony, sarcasm', media_url: null, media_type: 'video' },
    { title: 'Philosophical', short_description: 'Explores deep ideas and meaning', category: 'mood', keywords: 'philosophical, deep, meaning, existential, thought-provoking', media_url: null, media_type: 'video' },

    // --- Audience ---
    { title: 'Kids', short_description: 'Suitable for children', category: 'audience', keywords: 'kids, children, young, family, safe', media_url: '/media/tags/kids.jpeg', media_type: 'image' },
    { title: 'Teens', short_description: 'Suitable for teenagers', category: 'audience', keywords: 'teens, teenagers, young adult, coming of age', media_url: '/media/tags/teens.jpeg', media_type: 'image' },
    { title: 'Adults', short_description: 'Suitable for adults ONLY!', category: 'audience', keywords: 'adults, mature, grown-up, explicit', media_url: '/media/tags/adults.jpeg', media_type: 'image' },
    { title: 'Family', short_description: 'Enjoyable for all ages', category: 'audience', keywords: 'family, all ages, everyone, together', media_url: null, media_type: 'video' },
    { title: 'Mature', short_description: 'For mature audiences', category: 'audience', keywords: 'mature, explicit, adult, 18+', media_url: null, media_type: 'video' },
    { title: 'All Ages', short_description: 'Appropriate for everyone', category: 'audience', keywords: 'all ages, everyone, universal, family', media_url: null, media_type: 'video' },

    // --- Subgenres & Specific Genres ---
    { title: 'Cyberpunk', short_description: 'High-tech, low-life dystopian future', category: 'scifi_future', keywords: 'cyberpunk, dystopian, future, technology, neon, hacker', media_url: '/media/tags/cyberpunk.jpeg', media_type: 'image' },
    { title: 'Steampunk', short_description: 'Steam-powered alternate history', category: 'historical_period', keywords: 'steampunk, steam, alternate history, gears, Victorian, retrofuturism', media_url: null, media_type: 'video' },
    { title: 'Space Opera', short_description: 'Epic adventures in space', category: 'scifi_future', keywords: 'space opera, epic, space, adventure, galaxy, starship', media_url: null, media_type: 'video' },
    { title: 'Urban Fantasy', short_description: 'Magic in a modern city', category: 'fantasy_magic', keywords: 'urban fantasy, magic, city, modern, supernatural', media_url: null, media_type: 'video' },
    { title: 'High Fantasy', short_description: 'Epic fantasy in a unique world', category: 'fantasy_magic', keywords: 'high fantasy, epic, world, magic, mythical, adventure', media_url: null, media_type: 'video' },
    { title: 'Magical Girl', short_description: 'Girls with magical powers', category: 'fantasy_magic', keywords: 'magical girl, magic, transformation, heroine, cute', media_url: "/media/tags/magical-girl.jpeg", media_type: 'image' },
    { title: 'Psychological Thriller', short_description: 'Mind games and suspense', category: 'drama_emotional', keywords: 'psychological, thriller, suspense, mind games, tension', media_url: null, media_type: 'video' },
    { title: 'Romantic Comedy', short_description: 'Love and laughs', category: 'romance_relationships', keywords: 'romantic comedy, romance, humor, love, funny', media_url: null, media_type: 'video' },
    { title: 'Reverse Harem', short_description: 'One girl, many boys', category: 'romance_relationships', keywords: 'reverse harem, romance, multiple boys, love triangle', media_url: null, media_type: 'video' },
    { title: 'Yuri', short_description: 'Girls love girls', category: 'romance_relationships', keywords: 'yuri, girls love, romance, lgbt, sapphic', media_url: null, media_type: 'video' },
    { title: 'Yaoi', short_description: 'Boys love boys', category: 'romance_relationships', keywords: 'yaoi, boys love, romance, lgbt, bl', media_url: null, media_type: 'video' },
    { title: 'Redemption', short_description: 'Seeking forgiveness and change', category: 'tropes', keywords: 'redemption, forgiveness, change, growth, atonement', media_url: null, media_type: 'video' },
    { title: 'Coming of Age', short_description: 'Growing up and maturing', category: 'tropes', keywords: 'coming of age, growth, maturity, youth, life lessons', media_url: "/media/tags/coming-of-age.jpeg", media_type: 'image' },
    { title: 'Found Family', short_description: 'Friends become family', category: 'tropes', keywords: 'found family, friendship, support, belonging, home', media_url: null, media_type: 'video' },
    { title: 'Betrayal', short_description: 'Trust is broken', category: 'tropes', keywords: 'betrayal, trust, deception, drama, conflict', media_url: '/media/tags/betrayal.jpeg', media_type: 'image' },
    { title: 'Secret Identity', short_description: 'Hidden true self', category: 'tropes', keywords: 'secret identity, disguise, hidden, alter ego', media_url: null, media_type: 'video' },
    { title: 'Amnesia', short_description: 'Lost memories', category: 'tropes', keywords: 'amnesia, memory loss, forgotten, rediscovery', media_url: '/media/tags/amnesia.jpeg', media_type: 'image' },
    { title: 'Tournament Arc', short_description: 'Competition storyline', category: 'tropes', keywords: 'tournament, competition, arc, battle, challenge', media_url: null, media_type: 'video' },
    { title: 'Power of Friendship', short_description: 'Friendship saves the day', category: 'tropes', keywords: 'friendship, power, support, teamwork, bond', media_url: null, media_type: 'video' },
    { title: 'MacGuffin', short_description: 'Object that drives the plot', category: 'tropes', keywords: 'macguffin, object, plot device, quest, goal', media_url: null, media_type: 'video' },
    { title: 'Prophecy', short_description: 'Foretold destiny', category: 'tropes', keywords: 'prophecy, destiny, fate, prediction, legend', media_url: null, media_type: 'video' },
    { title: 'Secret Society', short_description: 'Hidden organizations', category: 'tropes', keywords: 'secret society, organization, hidden, conspiracy', media_url: null, media_type: 'video' },
    { title: 'Hidden Power', short_description: 'Undiscovered abilities', category: 'tropes', keywords: 'hidden power, ability, secret, potential', media_url: null, media_type: 'video' },
    { title: 'Forbidden Love', short_description: 'Love against the odds', category: 'tropes', keywords: 'forbidden love, romance, taboo, conflict', media_url: null, media_type: 'video' },
    { title: 'Lost Civilization', short_description: 'Ancient, forgotten societies', category: 'tropes', keywords: 'lost civilization, ancient, forgotten, ruins, history', media_url: null, media_type: 'video' },
    { title: 'Ancient Artifact', short_description: 'Powerful old object', category: 'tropes', keywords: 'ancient artifact, object, power, history, legend', media_url: '/media/tags/ancient-artifact.jpeg', media_type: 'image' },
    { title: 'Body Swap', short_description: 'Characters switch bodies', category: 'tropes', keywords: 'body swap, switch, identity, comedy, drama', media_url: '/media/tags/body-swap.png', media_type: 'image' },
    { title: 'Parallel Timelines', short_description: 'Multiple realities', category: 'tropes', keywords: 'parallel timelines, alternate reality, multiverse, time', media_url: '/media/tags/parallel-timelines.jpeg', media_type: 'image' },
    { title: 'Alternate Endings', short_description: 'Different possible outcomes', category: 'tropes', keywords: 'alternate endings, outcomes, possibilities, story', media_url: '/media/tags/alternate-endings.jpeg', media_type: 'image' },

    // --- Character Archetypes ---
    { title: 'Antihero', short_description: 'A flawed or morally gray protagonist', category: 'character_archetype', keywords: 'antihero, flawed, gray, protagonist, complex', media_url: '/media/tags/antihero.jpeg', media_type: 'image' },
    { title: 'Villain Protagonist', short_description: 'The main character is a villain', category: 'character_archetype', keywords: 'villain protagonist, villain, main character, antihero', media_url: null, media_type: 'video' },
    { title: 'Strong Female Lead', short_description: 'A powerful and independent woman', category: 'character_archetype', keywords: 'strong female lead, woman, heroine, independent, powerful', media_url: null, media_type: 'video' },
    { title: 'Mentor', short_description: 'A wise guide or teacher', category: 'character_archetype', keywords: 'mentor, guide, teacher, wisdom, support', media_url: null, media_type: 'video' },
    { title: 'Sidekick', short_description: 'A loyal companion', category: 'character_archetype', keywords: 'sidekick, companion, friend, support, helper', media_url: null, media_type: 'video' },
    { title: 'Comic Relief', short_description: 'Provides humor in the story', category: 'character_archetype', keywords: 'comic relief, humor, funny, comedy, light-hearted', media_url: '/media/tags/comic-relief.jpeg', media_type: 'image' },
    { title: 'Animal Companion', short_description: 'A pet or animal friend', category: 'character_archetype', keywords: 'animal companion, pet, animal, friend, support', media_url: '/media/tags/animal-companion.jpeg', media_type: 'image' },
    { title: 'Child Prodigy', short_description: 'A gifted young character', category: 'character_archetype', keywords: 'child prodigy, gifted, young, talented, genius', media_url: '/media/tags/child-prodigy.jpeg', media_type: 'image' },
    { title: 'Chosen One', short_description: 'Destined for greatness', category: 'character_archetype', keywords: 'chosen one, destiny, hero, prophecy, special', media_url: '/media/tags/chosen-one.jpeg', media_type: 'image' },

    // --- Settings ---
    { title: 'Post-Apocalyptic', short_description: 'After a world-ending event', category: 'setting', keywords: 'post-apocalyptic, apocalypse, survival, ruins, future', media_url: null, media_type: 'video' },
    { title: 'Dystopian', short_description: 'Oppressive, controlled society', category: 'setting', keywords: 'dystopian, society, control, oppression, future', media_url: '/media/tags/dystopian.jpeg', media_type: 'image' },
    { title: 'Utopian', short_description: 'Ideal, perfect society', category: 'setting', keywords: 'utopian, perfect, ideal, society, harmony', media_url: null, media_type: 'video' },
    { title: 'Virtual Reality', short_description: 'Stories set in digital worlds', category: 'setting', keywords: 'virtual reality, digital, online, game, simulation', media_url: null, media_type: 'video' },
    { title: 'Parallel World', short_description: 'Alternate universes', category: 'setting', keywords: 'parallel world, alternate universe, multiverse, reality', media_url: '/media/tags/parallel-world.jpeg', media_type: 'image' },
    { title: 'Alternate History', short_description: 'History with a twist', category: 'setting', keywords: 'alternate history, what if, historical, different', media_url: '/media/tags/alternate-history.jpeg', media_type: 'image' },
    { title: 'Space Colony', short_description: 'Life on other planets', category: 'setting', keywords: 'space colony, planet, space, future, sci-fi', media_url: null, media_type: 'video' },
    { title: 'Small Town', short_description: 'Stories in a small community', category: 'setting', keywords: 'small town, community, rural, local, village', media_url: null, media_type: 'video' },
    { title: 'Big City', short_description: 'Urban, bustling environments', category: 'setting', keywords: 'big city, urban, metropolis, modern, busy', media_url: '/media/tags/big-city.jpeg', media_type: 'image' },
    { title: 'Boarding School', short_description: 'School as a main setting', category: 'setting', keywords: 'boarding school, school, dormitory, students, youth', media_url: '/media/tags/boarding-school.jpeg', media_type: 'image' },
    { title: 'Haunted House', short_description: 'Ghosts and supernatural events', category: 'setting', keywords: 'haunted house, ghost, supernatural, scary, horror', media_url: null, media_type: 'video' },
    { title: 'Island', short_description: 'Stories set on an island', category: 'setting', keywords: 'island, sea, ocean, isolated, adventure', media_url: null, media_type: 'video' },
    { title: 'Desert', short_description: 'Arid, sandy environments', category: 'setting', keywords: 'desert, sand, arid, hot, survival', media_url: '/media/tags/desert.jpeg', media_type: 'image' },
    { title: 'Forest', short_description: 'Woods and wilderness', category: 'setting', keywords: 'forest, woods, wilderness, nature, trees', media_url: null, media_type: 'video' },
    { title: 'Underwater', short_description: 'Beneath the sea', category: 'setting', keywords: 'underwater, sea, ocean, aquatic, marine', media_url: null, media_type: 'video' },
    { title: 'Outer Space', short_description: 'Beyond Earth', category: 'setting', keywords: 'outer space, space, stars, planets, sci-fi', media_url: null, media_type: 'video' },

    // --- Themes ---
    { title: 'Identity', short_description: 'Exploring self and belonging', category: 'theme', keywords: 'identity, self, belonging, discovery, personal', media_url: null, media_type: 'video' },
    { title: 'Justice', short_description: 'Righting wrongs', category: 'theme', keywords: 'justice, right, wrong, law, fairness', media_url: null, media_type: 'video' },
    { title: 'Revenge', short_description: 'Seeking payback', category: 'theme', keywords: 'revenge, payback, justice, conflict', media_url: null, media_type: 'video' },
    { title: 'Sacrifice', short_description: 'Giving up for others', category: 'theme', keywords: 'sacrifice, selfless, giving, loss, noble', media_url: null, media_type: 'video' },
    { title: 'Survival', short_description: 'Staying alive against the odds', category: 'theme', keywords: 'survival, life, danger, challenge, endurance', media_url: null, media_type: 'video' },
    { title: 'Freedom', short_description: 'Breaking free', category: 'theme', keywords: 'freedom, liberation, escape, independence', media_url: null, media_type: 'video' },
    { title: 'Corruption', short_description: 'Moral decay and downfall', category: 'theme', keywords: 'corruption, decay, downfall, evil, power', media_url: '/media/tags/corruption.jpeg', media_type: 'image' },
    { title: 'Technology vs Nature', short_description: 'Clash of progress and environment', category: 'theme', keywords: 'technology, nature, progress, environment, clash', media_url: null, media_type: 'video' },
    { title: 'Tradition vs Progress', short_description: 'Old ways vs new ideas', category: 'theme', keywords: 'tradition, progress, old, new, change', media_url: null, media_type: 'video' },
    { title: 'Family', short_description: 'Family bonds and relationships', category: 'theme', keywords: 'family, bonds, relationship, parents, siblings', media_url: null, media_type: 'video' },
    { title: 'Friendship', short_description: 'The power of friends', category: 'theme', keywords: 'friendship, friends, bond, support, loyalty', media_url: null, media_type: 'video' },
    { title: 'Love', short_description: 'Romantic and platonic love', category: 'theme', keywords: 'love, romance, affection, care, relationship', media_url: null, media_type: 'video' },
    { title: 'War', short_description: 'Conflict and battle', category: 'theme', keywords: 'war, conflict, battle, fight, struggle', media_url: null, media_type: 'video' },
    { title: 'Peace', short_description: 'Harmony and calm', category: 'theme', keywords: 'peace, harmony, calm, resolution, nonviolence', media_url: null, media_type: 'video' },
    { title: 'Isolation', short_description: 'Being alone or cut off', category: 'theme', keywords: 'isolation, alone, solitude, separation', media_url: null, media_type: 'video' },
    { title: 'Discovery', short_description: 'Finding new things', category: 'theme', keywords: 'discovery, exploration, new, adventure, learn', media_url: '/media/tags/discovery.jpeg', media_type: 'image' },
    { title: 'Destiny', short_description: 'Fate and predetermined paths', category: 'theme', keywords: 'destiny, fate, future, prophecy, path', media_url: '/media/tags/destiny.jpeg', media_type: 'image' },
    { title: 'Hope', short_description: 'Optimism and looking forward', category: 'theme', keywords: 'hope, optimism, future, positive', media_url: null, media_type: 'video' },
    { title: 'Despair', short_description: 'Hopelessness and loss', category: 'theme', keywords: 'despair, hopeless, loss, sadness, tragedy', media_url: '/media/tags/despair.jpeg', media_type: 'image' },
];

const seedTags = async() => {
    try {
        console.log('🌱 Starting enhanced tag seeding with media support...');

        // Create tags one by one using upsert to handle both creation and updates
        const createdTags = [];
        const updatedTags = [];

        for (const tagDataItem of tagData) {
            try {
                // Prepare tag data with media fields
                const tagData = {
                    title: tagDataItem.title,
                    short_description: tagDataItem.short_description,
                    category: tagDataItem.category,
                    keywords: tagDataItem.keywords,
                    media_url: tagDataItem.media_url,
                    media_type: tagDataItem.media_type || 'image',
                    // Keep thumb_url for backward compatibility
                    thumb_url: tagDataItem.media_url
                };

                // Use upsert to create or update based on title
                const [tag, created] = await Tag.upsert(tagData, {
                    where: { title: tagDataItem.title },
                    returning: true
                });

                if (created) {
                    createdTags.push(tag);
                    const mediaInfo = tagDataItem.media_url ?
                        `(${tagDataItem.media_type})` :
                        '(no media)';
                    console.log(`  ✅ Created: ${tag.title} ${mediaInfo} (${tag.category})`);
                } else {
                    updatedTags.push(tag);
                    const mediaInfo = tagDataItem.media_url ?
                        `(${tagDataItem.media_type})` :
                        '(no media)';
                    console.log(`  🔄 Updated: ${tag.title} ${mediaInfo} (${tag.category})`);
                }
            } catch (error) {
                console.error(`  ❌ Error processing ${tagDataItem.title}:`, error.message);
            }
        }

        console.log(`\n✅ Successfully processed ${createdTags.length + updatedTags.length} tags`);
        console.log(`  📝 Created: ${createdTags.length} tags`);
        console.log(`  🔄 Updated: ${updatedTags.length} tags`);
        console.log('\n📊 Category Distribution:');

        // Show category distribution for all processed tags
        const allTags = [...createdTags, ...updatedTags];
        const categoryCount = {};
        allTags.forEach(tag => {
            categoryCount[tag.category] = (categoryCount[tag.category] || 0) + 1;
        });

        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} tags`);
        });

        return allTags;
    } catch (error) {
        console.error('❌ Error seeding tags:', error);
        throw error;
    }
};

module.exports = { seedTags, tagData };