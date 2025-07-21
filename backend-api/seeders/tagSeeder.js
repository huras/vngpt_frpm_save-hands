const { Tag } = require('../models');

const tagData = [
    // --- General Genres (with images for existing tags) ---
    {
        title: 'Fiction',
        short_description: 'Imaginative or invented stories',
        broader_description: 'Fiction encompasses all forms of storytelling that are created from imagination rather than based on real events. This broad category includes novels, short stories, fairy tales, and any narrative that explores hypothetical scenarios, invented characters, and fictional worlds. Fiction allows writers to explore themes, emotions, and ideas through creative expression, offering readers an escape into different realities and perspectives.',
        category: 'general',
        keywords: 'fiction, story, narrative, invented, imaginative',
        media_url: '/media/tags/fiction.mp4',
        media_type: 'video'
    },
    {
        title: 'Non-Fiction',
        short_description: 'Based on real events or facts',
        broader_description: 'Non-fiction represents stories and narratives that are based on real events, facts, and actual people. This category includes biographies, autobiographies, historical accounts, documentaries, and educational content. Non-fiction works aim to inform, educate, or provide accurate accounts of real-world events, making them valuable for learning and understanding the world around us.',
        category: 'general',
        keywords: 'non-fiction, real, factual, documentary, biography',
        media_url: null,
        media_type: 'image'
    },
    {
        title: 'Drama',
        short_description: 'Emotional conflicts and tension',
        broader_description: 'Drama focuses on character development through emotional conflicts, interpersonal relationships, and psychological depth. These stories often explore complex human emotions, moral dilemmas, and the consequences of choices. Drama can range from intimate character studies to epic family sagas, always emphasizing the emotional journey and growth of characters through challenging circumstances.',
        category: 'drama_emotional',
        keywords: 'drama, emotional, conflict, tension, serious, deep, meaningful',
        media_url: '/media/tags/drama.webp',
        media_type: 'image'
    },
    {
        title: 'Comedy',
        short_description: 'Humor and light-hearted fun',
        broader_description: 'Comedy is designed to entertain through humor, wit, and amusing situations. This genre includes various forms of humor from slapstick and physical comedy to sophisticated wordplay and satire. Comedy can be used to lighten serious topics, provide social commentary, or simply offer pure entertainment. It often features quirky characters, misunderstandings, and happy resolutions.',
        category: 'comedy_light',
        keywords: 'comedy, humor, funny, light-hearted, amusing, entertaining, joke',
        media_url: '/media/tags/comedy.webp',
        media_type: 'image'
    },
    {
        title: 'Action',
        short_description: 'Fast-paced battles and excitement',
        broader_description: 'Action stories are characterized by high-energy sequences, physical confrontations, and adrenaline-pumping scenarios. These narratives often feature heroes facing dangerous situations, engaging in combat, or overcoming physical obstacles. Action can be combined with other genres like adventure, thriller, or sci-fi, creating dynamic stories that keep readers on the edge of their seats.',
        category: 'action_adventure',
        keywords: 'action, battle, fight, combat, exciting, fast-paced, adrenaline, intense',
        media_url: '/media/tags/action.png',
        media_type: 'image'
    },
    {
        title: 'Romance',
        short_description: 'Love and relationships',
        broader_description: 'Romance centers on the development of romantic relationships between characters, exploring themes of love, attraction, and emotional connection. These stories can range from sweet and innocent to passionate and complex, often featuring obstacles that characters must overcome to find happiness together. Romance can be a primary focus or a subplot that enhances other story elements.',
        category: 'romance_relationships',
        keywords: 'romance, love, relationship, romantic, couple, dating, affection',
        media_url: '/media/tags/romance.webp',
        media_type: 'image'
    },
    {
        title: 'Fantasy',
        short_description: 'Magic and mythical worlds',
        broader_description: 'Fantasy creates worlds where magic, supernatural elements, and mythical creatures exist alongside or instead of the natural laws of our world. These stories often feature magical systems, enchanted objects, and extraordinary beings. Fantasy can explore themes of good versus evil, heroism, destiny, and the power of imagination, offering readers escape into realms of wonder and possibility.',
        category: 'fantasy_magic',
        keywords: 'fantasy, magic, mythical, magical, enchanted, mystical, supernatural',
        media_url: '/media/tags/fantasy.webp',
        media_type: 'image'
    },
    {
        title: "Sci-Fi",
        short_description: "Futuristic tech and space",
        broader_description: "Science fiction imagines future worlds shaped by advanced technology, space exploration, artificial intelligence, and scientific breakthroughs. These stories often examine how humanity interacts with innovation and the unknown, exploring philosophical, ethical, and societal questions. Sci-fi offers a lens to speculate on the future and reflect on the present through imaginative, high-concept storytelling.",
        category: "scifi_future",
        keywords: "sci-fi, science fiction, futuristic, technology, space, advanced, tech",
        media_url: "/media/tags/sci-fi.jpeg",
        media_type: "image"
    },
    {
        title: "Horror",
        short_description: "Fearful and eerie tales",
        broader_description: "Horror delves into the unsettling and terrifying, drawing on fears both real and imagined. These stories often feature monsters, the supernatural, psychological dread, or the unknown, aiming to evoke fear, suspense, and unease. Horror can explore the darkest parts of human nature and the consequences of tampering with forces beyond understanding.",
        category: "horror_dark",
        keywords: "horror, scary, frightening, eerie, dark, terrifying, spooky",
        media_url: "/media/tags/horror.webp",
        media_type: "image"
    },
    {
        title: "Mystery",
        short_description: "Puzzles and secrets to unravel",
        broader_description: "Mystery stories center on solving a puzzle—often a crime, disappearance, or hidden truth. These narratives follow detectives, investigators, or curious individuals as they gather clues, uncover secrets, and piece together the truth. Mystery offers suspense and intellectual challenge, drawing readers into webs of intrigue and deduction.",
        category: "drama_emotional",
        keywords: "mystery, puzzle, secret, detective, investigation, clue, suspense",
        media_url: "/media/tags/mystery.jpeg",
        media_type: "image"
    },
    {
        title: "Adventure",
        short_description: "Exploration and thrilling quests",
        broader_description: "Adventure tales are driven by action, danger, and exploration, often featuring heroes on quests or missions. These stories span exotic lands, uncharted territories, or perilous situations where courage and endurance are tested. Adventure fiction captures the thrill of discovery, the excitement of the unknown, and the determination to overcome great odds.",
        category: "action_adventure",
        keywords: "adventure, exploration, quest, journey, discovery, travel, expedition",
        media_url: "/media/tags/adventure.webp",
        media_type: "image"
    },
    {
        title: "Slice of Life",
        short_description: "Everyday life and moments",
        broader_description: "Slice of Life focuses on ordinary, realistic experiences drawn from daily routines and personal interactions. These stories highlight the beauty, humor, and struggles found in everyday existence, often emphasizing character development and emotional nuance. They provide grounded perspectives on life’s simplicity and complexity.",
        category: "comedy_light",
        keywords: "slice of life, everyday, daily, normal, routine, realistic, mundane",
        media_url: "/media/tags/slice-of-life.jpeg",
        media_type: "image"
    },
    {
        title: "Historical",
        short_description: "Stories set in the past",
        broader_description: "Historical fiction immerses readers in past eras, portraying life, culture, and events from different time periods with rich detail and authenticity. These stories may focus on fictional characters or real historical figures, exploring how individuals navigate the social, political, and cultural landscapes of their times.",
        category: "historical_period",
        keywords: "historical, past, old, traditional, classical, heritage",
        media_url: "/media/tags/historical.jpeg",
        media_type: "image"
    },
    {
        title: "Thriller",
        short_description: "Suspense and intense moments",
        broader_description: "Thrillers are fast-paced stories that build tension and excitement, often involving danger, conspiracies, or high-stakes conflicts. These narratives keep readers on edge with plot twists, psychological drama, and adrenaline-fueled action, exploring the limits of human endurance and the drive to survive.",
        category: "action_adventure",
        keywords: "thriller, suspense, tension, intense, gripping, edge-of-seat, dramatic",
        media_url: "/media/tags/thriller.webp",
        media_type: "image"
    },
    {
        title: "Supernatural",
        short_description: "Ghosts and otherworldly beings",
        broader_description: "Supernatural fiction explores forces beyond the natural world, including ghosts, spirits, and unexplainable phenomena. These stories blur the line between reality and the otherworldly, often delving into spiritual or mystical themes. Supernatural tales can be eerie, mysterious, or awe-inspiring, tapping into deep-rooted human beliefs and fears.",
        category: "fantasy_magic",
        keywords: "supernatural, ghost, paranormal, otherworldly, spirit, mystical",
        media_url: "/media/tags/supernatural.jpeg",
        media_type: "image"
    },
    {
        title: "Sports",
        short_description: "Competitions and teamwork",
        broader_description: "Sports stories focus on athletic competition, teamwork, discipline, and personal growth through physical challenges. These narratives often highlight rivalries, camaraderie, and the pursuit of excellence, whether in school settings or professional arenas. They capture the emotional highs and lows of victory and defeat, emphasizing perseverance and spirit.",
        category: "school_youth",
        keywords: "sports, competition, teamwork, athletic, game, tournament, victory",
        media_url: "/media/tags/sports.jpeg",
        media_type: "image"
    },
    {
        title: "Military",
        short_description: "War and strategy",
        broader_description: "Military fiction centers on war, tactics, and the experiences of soldiers and commanders in battle. These stories often explore themes of duty, sacrifice, loyalty, and the moral complexities of warfare. They may depict large-scale conflicts or personal struggles within the ranks, emphasizing strategic thinking and the harsh realities of combat.",
        category: "military_strategy",
        keywords: "military, war, strategy, army, soldier, battle, tactical, combat",
        media_url: "/media/tags/military.jpeg",
        media_type: "image"
    },
    {
        title: "School Life",
        short_description: "High school and friendships",
        broader_description: "School Life stories revolve around the daily experiences of students, focusing on friendships, romance, academic pressure, and personal growth. Set in educational environments like high schools or colleges, these narratives often explore the joys and challenges of youth, identity, and coming-of-age.",
        category: "school_youth",
        keywords: "school, high school, student, education, friendship, youth, teenage",
        media_url: "/media/tags/school-life.jpeg",
        media_type: "image"
    },
    {
        title: "Modern",
        short_description: "Contemporary settings",
        broader_description: "Modern fiction is set in the present day and reflects current societal norms, technology, and lifestyles. These stories focus on relatable experiences in realistic environments, often exploring issues such as relationships, careers, urban life, and the complexities of modern living.",
        category: "modern_contemporary",
        keywords: "modern, contemporary, current, present-day, today, realistic",
        media_url: "/media/tags/modern.jpeg",
        media_type: "image"
    },
    {
        title: "Ancient",
        short_description: "Stories set in the past",
        broader_description: "Ancient-themed stories transport readers to early civilizations and historical eras, often drawing from mythology, cultural traditions, and legendary figures. These narratives depict life in distant times, exploring heritage, ritual, and the foundations of human society through epic storytelling.",
        category: "historical_period",
        keywords: "ancient, historical, past, old, traditional, classical, heritage",
        media_url: "/media/tags/ancient.jpeg",
        media_type: "image"
    },
    {
        title: "Medieval",
        short_description: "Kings, Kingdoms, Knights and Castles",
        broader_description: "Medieval fiction immerses readers in the Middle Ages, featuring castles, knights, kingdoms, and chivalry. These stories often include battles for power, royal intrigue, and codes of honor, blending history with legend and fantasy. The setting evokes a time of both brutal warfare and noble ideals.",
        category: "historical_period",
        keywords: "medieval, kingdom, knight, castle, royal, chivalry, middle ages",
        media_url: "/media/tags/medieval.jpeg",
        media_type: "image"
    },
    {
        title: "Future",
        short_description: "Advanced societies and tech",
        broader_description: "Future fiction envisions advanced civilizations shaped by innovation, progress, and emerging technologies. These stories speculate on where humanity might be headed, exploring themes like utopias, dystopias, artificial intelligence, and societal evolution in worlds yet to come.",
        category: "scifi_future",
        keywords: "future, advanced, technology, modern, progressive, innovative",
        media_url: "/media/tags/future.jpeg",
        media_type: "image"
    },
    {
        title: "Isekai",
        short_description: "Transported to another world",
        broader_description: "Isekai stories involve characters who are transported or reincarnated into another world, often one filled with fantasy, magic, or game-like elements. These narratives explore adaptation, growth, and adventure as the protagonist navigates unfamiliar realms, often discovering hidden potential and shaping their new world.",
        category: "isekai_fantasy_worlds",
        keywords: "isekai, another world, transported, reincarnation, fantasy world, parallel",
        media_url: "/media/tags/isekai-2.jpeg",
        media_type: "image"
    },
    {
        title: "Mecha",
        short_description: "Giant robots and battles",
        broader_description: "Mecha fiction centers around giant robots, piloted machines, and futuristic warfare. These stories explore the fusion of humanity and technology, often highlighting themes of war, identity, and the ethical implications of advanced weaponry. Mecha tales are known for high-stakes combat, strategic conflict, and the drama between pilot and machine.",
        category: "scifi_future",
        keywords: "mecha, robot, giant, machine, mechanical, technology, battle",
        media_url: "/media/tags/mecha.jpeg",
        media_type: "image"
    },
    {
        title: "Light Hearted",
        short_description: "Cheerful and uplifting stories",
        broader_description: "Light Hearted stories offer cheerful, humorous, and uplifting narratives that focus on positivity and fun. These tales often provide emotional relief and are perfect for feel-good entertainment, emphasizing laughter, friendship, and heartwarming moments.",
        category: "mood",
        keywords: "light-hearted, cheerful, uplifting, positive, fun, feel-good",
        media_url: "/media/tags/light-hearted.png",
        media_type: "image"
    },
    {
        title: "Psychological",
        short_description: "Mind games and deep thoughts",
        broader_description: "Psychological stories delve into the complexities of the human mind, exploring inner conflicts, mental struggles, manipulation, and cognitive depth. These narratives often present intense character development and thought-provoking scenarios that challenge perception and morality.",
        category: "drama_emotional",
        keywords: "psychological, mind, mental, thought-provoking, deep, complex, cerebral",
        media_url: "/media/tags/psychological.jpeg",
        media_type: "image"
    },
    {
        title: "Harem",
        short_description: "Multiple romantic interests",
        broader_description: "Harem stories feature a main character surrounded by multiple romantic interests, often leading to comedic, dramatic, or romantic tension. These narratives explore themes of affection, jealousy, and the challenges of managing multiple relationships, commonly with a light-hearted or fantasy tone.",
        category: "romance_relationships",
        keywords: "harem, multiple, romantic, love triangle, polyamory, relationship",
        media_url: "/media/tags/harem.jpeg",
        media_type: "image"
    },
    {
        title: "Multiple Heroines",
        short_description: "Multiple female protagonists",
        broader_description: "Stories with Multiple Heroines highlight several central female characters, often showcasing their individual arcs, perspectives, and contributions to the plot. These narratives celebrate diversity and ensemble storytelling, offering rich, character-driven experiences.",
        category: "character_focus",
        keywords: "multiple heroines, female characters, ensemble, diverse, group",
        media_url: "/media/tags/multiple-heroines.png",
        media_type: "image"
    },
    {
        title: "Ecchi",
        short_description: "Lighthearted sexual humor",
        broader_description: "Ecchi stories incorporate playful, suggestive, and risqué humor, often with comedic misunderstandings and fanservice. These narratives avoid explicit content but explore flirtation and sexual tension in a lighthearted and humorous manner.",
        category: "adult_content",
        keywords: "ecchi, fanservice, provocative, suggestive, adult humor, mature",
        media_url: "/media/tags/ecchi.png",
        media_type: "image"
    },
    {
        title: "Hentai",
        short_description: "Erotic content",
        broader_description: "Hentai is a genre of adult fiction featuring explicit sexual content and themes. These stories focus on eroticism and mature relationships, often intended solely for adult audiences and frequently animated or illustrated in style.",
        category: "adult_content",
        keywords: "hentai, adult, erotic, explicit, mature, sexual, pornographic",
        media_url: "/media/tags/hentai.png",
        media_type: "image"
    },
    {
        title: "Male Main Protagonist",
        short_description: "The main character is male",
        broader_description: "This category features stories where the primary protagonist is male. These narratives follow his journey, growth, and challenges, and are often central to the plot’s perspective and emotional arc.",
        category: "character_focus",
        keywords: "male protagonist, main character, hero, lead, central character",
        media_url: "/media/tags/male-main-protagonist.png",
        media_type: "image"
    },

    // --- Mood & Tone ---
    {
        title: "Dark",
        short_description: "Serious, grim, or tragic tone",
        broader_description: "Dark stories feature a somber, grim, or tragic atmosphere, often exploring serious or unsettling themes such as death, suffering, or moral ambiguity. These narratives aim to evoke deep emotion, challenge comfort zones, and confront the darker aspects of life and human nature.",
        category: "mood",
        keywords: "dark, grim, tragic, serious, somber, bleak",
        media_url: "/media/tags/dark.jpeg",
        media_type: "image"
    },
    {
        title: "Uplifting",
        short_description: "Inspiring and positive stories",
        broader_description: "Uplifting stories are designed to inspire and encourage, often focusing on personal growth, resilience, kindness, and overcoming adversity. These narratives highlight the good in people and situations, leaving the audience with a sense of hope and positivity.",
        category: "mood",
        keywords: "uplifting, inspiring, positive, motivational, heartwarming",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Tragic",
        short_description: "Sad or heartbreaking stories",
        broader_description: "Tragic stories focus on loss, heartbreak, and sorrow, often leading to emotional catharsis. These narratives explore human vulnerability, fate, and the impact of devastating events, aiming to evoke empathy and reflection through emotional depth.",
        category: "mood",
        keywords: "tragic, sad, heartbreaking, loss, sorrow, emotional",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Suspenseful",
        short_description: "Stories full of suspense",
        broader_description: "Suspenseful stories are built around tension and anticipation, keeping audiences on edge through twists, mysteries, and high-stakes situations. These narratives often involve danger, secrets, or uncertain outcomes, making the experience thrilling and unpredictable.",
        category: "mood",
        keywords: "suspenseful, tension, thrilling, edge-of-seat, dramatic",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Wholesome",
        short_description: "Feel-good, pure, and kind stories",
        broader_description: "Wholesome stories are heartwarming and emotionally comforting, emphasizing kindness, innocence, and the simple joys of life. These narratives offer a safe and gentle viewing experience, often focusing on positive relationships, community, and moral goodness.",
        category: "mood",
        keywords: "wholesome, pure, kind, heartwarming, gentle, positive",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Satirical",
        short_description: "Satire and parody",
        broader_description: "Satirical stories use humor, irony, and exaggeration to critique or mock societal norms, politics, or popular culture. These narratives aim to provoke thought and entertain through clever commentary and parody, often with a sharp or humorous edge.",
        category: "mood",
        keywords: "satirical, parody, humor, mockery, irony, sarcasm",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Philosophical",
        short_description: "Explores deep ideas and meaning",
        broader_description: "Philosophical stories delve into existential questions, abstract concepts, and the search for meaning in life. These narratives encourage introspection and discussion, often exploring the nature of reality, morality, consciousness, and human existence.",
        category: "mood",
        keywords: "philosophical, deep, meaning, existential, thought-provoking",
        media_url: null,
        media_type: "video"
    },

    // --- Audience ---
    {
        title: "Kids",
        short_description: "Suitable for children",
        broader_description: "Kids content is designed to be safe, entertaining, and age-appropriate for young audiences. These stories often feature simple narratives, vibrant visuals, and positive messages that foster learning, imagination, and kindness.",
        category: "audience",
        keywords: "kids, children, young, family, safe",
        media_url: "/media/tags/kids.jpeg",
        media_type: "image"
    },
    {
        title: "Teens",
        short_description: "Suitable for teenagers",
        broader_description: "Teens content caters to adolescent viewers, often exploring themes like identity, friendship, growth, and self-discovery. These stories resonate with the challenges and experiences of coming of age, striking a balance between fun and emotional depth.",
        category: "audience",
        keywords: "teens, teenagers, young adult, coming of age",
        media_url: "/media/tags/teens.jpeg",
        media_type: "image"
    },
    {
        title: "Adults",
        short_description: "Suitable for adults ONLY!",
        broader_description: "Adult content is intended for mature audiences and may include themes, language, or visuals unsuitable for younger viewers. These stories often address complex, explicit, or provocative subject matter, offering a deeper or more intense narrative experience.",
        category: "audience",
        keywords: "adults, mature, grown-up, explicit",
        media_url: "/media/tags/adults.jpeg",
        media_type: "image"
    },
    {
        title: "Family",
        short_description: "Enjoyable for all ages",
        broader_description: "Family content is crafted to be enjoyed by viewers of all ages, blending universal themes, humor, and values. These stories promote togetherness and entertainment that children, teens, and adults can watch and appreciate together.",
        category: "audience",
        keywords: "family, all ages, everyone, together",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Mature",
        short_description: "For mature audiences",
        broader_description: "Mature content targets adult viewers with stories that often include explicit material, strong language, violence, or complex themes. These narratives are intended for those seeking more intense or realistic portrayals of life and human nature.",
        category: "audience",
        keywords: "mature, explicit, adult, 18+",
        media_url: null,
        media_type: "video"
    },
    {
        title: "All Ages",
        short_description: "Appropriate for everyone",
        broader_description: "All Ages content is designed to be inclusive and appropriate for viewers of any age. These stories avoid explicit material and aim to provide entertainment that is wholesome, accessible, and enjoyable for a broad audience.",
        category: "audience",
        keywords: "all ages, everyone, universal, family",
        media_url: null,
        media_type: "video"
    },

    // --- Subgenres & Specific Genres ---
    {
        title: "Cyberpunk",
        short_description: "High-tech, low-life dystopian future",
        broader_description: "Cyberpunk stories are set in dystopian futures where advanced technology and cybernetics coexist with societal collapse and gritty urban life. These narratives explore themes of identity, rebellion, surveillance, and the consequences of unchecked technological growth, often featuring hackers, corporations, and neon-soaked cityscapes.",
        category: "scifi_future",
        keywords: "cyberpunk, dystopian, future, technology, neon, hacker",
        media_url: "/media/tags/cyberpunk.png",
        media_type: "image"
    },
    {
        title: "Steampunk",
        short_description: "Steam-powered alternate history",
        broader_description: "Steampunk reimagines history through the lens of steam-powered technology and Victorian aesthetics. These stories often blend retrofuturism, adventure, and alternative inventions in a world driven by gears, brass, and steam, creating a unique and stylish blend of fantasy and historical fiction.",
        category: "historical_period",
        keywords: "steampunk, steam, alternate history, gears, Victorian, retrofuturism",
        media_url: "/media/tags/steampunk.png",
        media_type: "image"
    },
    {
        title: "Space Opera",
        short_description: "Epic adventures in space",
        broader_description: "Space Opera is a subgenre of science fiction known for its grand scale, interstellar adventures, and dramatic conflicts. These stories feature heroes, empires, alien civilizations, and space battles, often centered on personal and political drama played out across the galaxy.",
        category: "scifi_future",
        keywords: "space opera, epic, space, adventure, galaxy, starship",
        media_url: "/media/tags/space-opera.png",
        media_type: "image"
    },
    {
        title: "Urban Fantasy",
        short_description: "Magic in a modern city",
        broader_description: "Urban Fantasy blends magical or supernatural elements with modern-day settings, often taking place in cities where hidden worlds exist alongside everyday life. These stories explore themes like secrecy, duality, and the coexistence of magic and technology in contemporary society.",
        category: "fantasy_magic",
        keywords: "urban fantasy, magic, city, modern, supernatural",
        media_url: "/media/tags/urban-fantasy.png",
        media_type: "image"
    },
    {
        title: "High Fantasy",
        short_description: "Epic fantasy in a unique world",
        broader_description: "High Fantasy features expansive, original worlds filled with magic, mythical creatures, and grand quests. These stories often include chosen heroes, powerful wizards, ancient prophecies, and epic battles between good and evil in richly developed settings.",
        category: "fantasy_magic",
        keywords: "high fantasy, epic, world, magic, mythical, adventure",
        media_url: "/media/tags/high-fantasy.png",
        media_type: "image"
    },
    {
        title: "Magical Girl",
        short_description: "Girls with magical powers",
        broader_description: "Magical Girl stories focus on young female protagonists who gain magical powers and transform to fight evil. These narratives often emphasize friendship, hope, and emotional resilience, combining action with charm, vibrant visuals, and transformation sequences.",
        category: "fantasy_magic",
        keywords: "magical girl, magic, transformation, heroine, cute",
        media_url: "/media/tags/magical-girl.jpeg",
        media_type: "image"
    },
    {
        title: "Psychological Thriller",
        short_description: "Mind games and suspense",
        broader_description: "Psychological Thriller stories weave intense suspense with mental manipulation, inner conflict, and unpredictable twists. These narratives explore the darker aspects of the mind, often blurring the line between reality and delusion, and keeping audiences guessing until the very end.",
        category: "drama_emotional",
        keywords: "psychological, thriller, suspense, mind games, tension",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Romantic Comedy",
        short_description: "Love and laughs",
        broader_description: "Romantic Comedy combines humor with romance, telling light-hearted and charming stories about love, misunderstandings, and the joy of relationships. These narratives often follow quirky characters and comical situations that ultimately lead to heartfelt connections.",
        category: "romance_relationships",
        keywords: "romantic comedy, romance, humor, love, funny",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Reverse Harem",
        short_description: "One girl, many boys",
        broader_description: "Reverse Harem stories center around a female protagonist who is surrounded by multiple male characters with romantic interest in her. These narratives often explore themes of romance, emotional bonds, and comedic or dramatic dynamics among a varied group of suitors.",
        category: "romance_relationships",
        keywords: "reverse harem, romance, multiple boys, love triangle",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Yuri",
        short_description: "Girls love girls",
        broader_description: "Yuri focuses on romantic and emotional relationships between female characters. These stories range from light-hearted and sweet to dramatic and intense, exploring themes of identity, acceptance, and love within a sapphic or LGBTQ+ context.",
        category: "romance_relationships",
        keywords: "yuri, girls love, romance, lgbt, sapphic",
        media_url: "/media/tags/yuri.png",
        media_type: "image"
    },
    {
        title: "Yaoi",
        short_description: "Boys love boys",
        broader_description: "Yaoi centers on romantic and emotional relationships between male characters. These stories often delve into themes of love, vulnerability, and acceptance, and are popular within LGBTQ+ storytelling for their exploration of male same-sex romance.",
        category: "romance_relationships",
        keywords: "yaoi, boys love, romance, lgbt, bl",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Redemption",
        short_description: "Seeking forgiveness and change",
        broader_description: "Redemption stories follow characters on a journey to atone for past mistakes or wrongdoings. These narratives often focus on personal growth, self-reflection, and the pursuit of forgiveness, offering powerful arcs of transformation and healing.",
        category: "tropes",
        keywords: "redemption, forgiveness, change, growth, atonement",
        media_url: "/media/tags/redemption.png",
        media_type: "image"
    },
    {
        title: "Coming of Age",
        short_description: "Growing up and maturing",
        broader_description: "Coming of Age stories chronicle the emotional and psychological growth of characters as they transition from youth to adulthood. These narratives often deal with self-discovery, life lessons, and the challenges of growing up.",
        category: "tropes",
        keywords: "coming of age, growth, maturity, youth, life lessons",
        media_url: "/media/tags/coming-of-age.jpeg",
        media_type: "image"
    },
    {
        title: "Found Family",
        short_description: "Friends become family",
        broader_description: "Found Family stories highlight the formation of deep, familial bonds among individuals who are not related by blood. These narratives emphasize belonging, support, and the emotional strength of chosen connections.",
        category: "tropes",
        keywords: "found family, friendship, support, belonging, home",
        media_url: "/media/tags/found-family.png",
        media_type: "image"
    },
    {
        title: "Betrayal",
        short_description: "Trust is broken",
        broader_description: "Betrayal stories center on the emotional fallout from broken trust, whether in friendships, romances, or alliances. These narratives explore themes of deception, revenge, heartbreak, and the complexity of human relationships.",
        category: "tropes",
        keywords: "betrayal, trust, deception, drama, conflict",
        media_url: "/media/tags/betrayal.jpeg",
        media_type: "image"
    },
    {
        title: "Secret Identity",
        short_description: "Hidden true self",
        broader_description: "Secret Identity stories feature characters who conceal their true identity, often to protect themselves or others. These narratives explore dual lives, hidden truths, and the tension between who we are and what the world sees.",
        category: "tropes",
        keywords: "secret identity, disguise, hidden, alter ego",
        media_url: "/media/tags/secret-identity.png",
        media_type: "image"
    },
    {
        title: "Amnesia",
        short_description: "Lost memories",
        broader_description: "Amnesia stories revolve around characters who have lost their memories, often leading to journeys of rediscovery and self-realization. These narratives explore identity, past traumas, and the reconstruction of one's life and relationships.",
        category: "tropes",
        keywords: "amnesia, memory loss, forgotten, rediscovery",
        media_url: "/media/tags/amnesia.jpeg",
        media_type: "image"
    },
    {
        title: "Tournament Arc",
        short_description: "Competition storyline",
        broader_description: "Tournament Arc stories feature structured competitions that test characters' skills, strength, or growth. These narratives often serve as exciting set pieces filled with battles, rivalries, and personal development through challenge and conflict.",
        category: "tropes",
        keywords: "tournament, competition, arc, battle, challenge",
        media_url: "/media/tags/tournament-arc.png",
        media_type: "image"
    },
    {
        title: "Power of Friendship",
        short_description: "Friendship saves the day",
        broader_description: "Power of Friendship stories emphasize the strength and importance of bonds between friends. These narratives show how support, trust, and teamwork can overcome even the greatest obstacles, highlighting emotional resilience and unity.",
        category: "tropes",
        keywords: "friendship, power, support, teamwork, bond",
        media_url: "/media/tags/power-of-friendship.png",
        media_type: "image"
    },
    {
        title: "Prophecy",
        short_description: "Foretold destiny",
        broader_description: "Prophecy stories revolve around characters whose destinies have been foretold, often by ancient predictions or omens. These narratives explore themes of fate, free will, and the burden or guidance of a grand, often mystical, destiny.",
        category: "tropes",
        keywords: "prophecy, destiny, fate, prediction, legend",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Secret Society",
        short_description: "Hidden organizations",
        broader_description: "Secret Society stories delve into the intrigue of mysterious groups operating behind the scenes. These narratives often involve conspiracies, hidden knowledge, and shadowy influences that shape events from the background.",
        category: "tropes",
        keywords: "secret society, organization, hidden, conspiracy",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Hidden Power",
        short_description: "Undiscovered abilities",
        broader_description: "Hidden Power stories focus on characters who possess untapped or unknown abilities. These narratives often explore personal growth, self-discovery, and the awakening of inner strength in the face of adversity.",
        category: "tropes",
        keywords: "hidden power, ability, secret, potential",
        media_url: null,
        media_type: "video"
    },
    {
        title: "Forbidden Love",
        short_description: "Love against the odds",
        broader_description: "Forbidden Love stories explore romantic relationships that face societal, cultural, or personal obstacles. These narratives often involve secrecy, emotional tension, and the conflict between desire and duty.",
        category: "tropes",
        keywords: "forbidden love, romance, taboo, conflict",
        media_url: "/media/tags/forbidden-love-2.png",
        media_type: "image"
    },
    {
        title: "Lost Civilization",
        short_description: "Ancient, forgotten societies",
        broader_description: "Lost Civilization stories uncover the remnants of ancient, forgotten societies. These narratives often involve exploration, archaeological discovery, and the mysteries of a once-great culture lost to time.",
        category: "tropes",
        keywords: "lost civilization, ancient, forgotten, ruins, history",
        media_url: "/media/tags/lost-civilization.png",
        media_type: "image"
    },
    {
        title: "Ancient Artifact",
        short_description: "Powerful old object",
        broader_description: "Ancient Artifact stories center around mysterious and powerful objects from the past. These artifacts often hold immense power, magical properties, or deep historical significance, driving adventure, conflict, or revelation.",
        category: "tropes",
        keywords: "ancient artifact, object, power, history, legend",
        media_url: "/media/tags/ancient-artifact.jpeg",
        media_type: "image"
    },
    {
        title: "Body Swap",
        short_description: "Characters switch bodies",
        broader_description: "Body Swap stories involve characters exchanging bodies, leading to humorous, dramatic, or eye-opening situations. These narratives often explore identity, empathy, and the challenges of living in someone else's shoes.",
        category: "tropes",
        keywords: "body swap, switch, identity, comedy, drama",
        media_url: "/media/tags/body-swap.png",
        media_type: "image"
    },
    {
        title: "Parallel Timelines",
        short_description: "Multiple realities",
        broader_description: "Parallel Timelines stories explore alternate versions of reality, where different choices or events have led to diverging outcomes. These narratives often deal with multiverse theory, fate, and the consequences of changing time.",
        category: "tropes",
        keywords: "parallel timelines, alternate reality, multiverse, time",
        media_url: "/media/tags/parallel-timelines.jpeg",
        media_type: "image"
    },
    {
        title: "Alternate Endings",
        short_description: "Different possible outcomes",
        broader_description: "Alternate Endings stories present multiple conclusions to a narrative, exploring how different decisions or circumstances could have changed the outcome. These narratives offer varied perspectives and emphasize the impact of choice.",
        category: "tropes",
        keywords: "alternate endings, outcomes, possibilities, story",
        media_url: "/media/tags/alternate-endings.jpeg",
        media_type: "image"
    },

    // --- Character Archetypes ---
    {
        "title": "Antihero",
        "short_description": "A flawed or morally gray protagonist",
        "broader_description": "An Antihero is a central character who lacks traditional heroic qualities such as idealism, morality, or courage. Often conflicted and morally ambiguous, antiheroes add depth and complexity to stories, challenging conventional ideas of right and wrong.",
        "category": "character_archetype",
        "keywords": "antihero, flawed, gray, protagonist, complex",
        "media_url": "/media/tags/antihero.jpeg",
        "media_type": "image"
    },
    {
        "title": "Villain Protagonist",
        "short_description": "The main character is a villain",
        "broader_description": "A Villain Protagonist leads the story while embodying traits commonly associated with antagonists—cruelty, ambition, deceit, or malice. These stories invite viewers to explore the darker side of human nature through the lens of a central character who defies heroism.",
        "category": "character_archetype",
        "keywords": "villain protagonist, villain, main character, antihero",
        "media_url": "/media/tags/villain-protagonist.png",
        "media_type": "image"
    },
    {
        "title": "Strong Female Lead",
        "short_description": "A powerful and independent woman",
        "broader_description": "A Strong Female Lead is a central character who is confident, capable, and independent. These characters often challenge gender norms and inspire audiences through resilience, leadership, and strength of character.",
        "category": "character_archetype",
        "keywords": "strong female lead, woman, heroine, independent, powerful",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Mentor",
        "short_description": "A wise guide or teacher",
        "broader_description": "The Mentor archetype provides wisdom, guidance, and support to the protagonist. Often older and experienced, mentors help shape the hero’s journey by offering crucial advice or training at pivotal moments.",
        "category": "character_archetype",
        "keywords": "mentor, guide, teacher, wisdom, support",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Sidekick",
        "short_description": "A loyal companion",
        "broader_description": "Sidekicks are loyal companions who support the main character throughout their journey. Often providing encouragement, humor, or a grounded perspective, they help highlight the protagonist’s growth and human side.",
        "category": "character_archetype",
        "keywords": "sidekick, companion, friend, support, helper",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Comic Relief",
        "short_description": "Provides humor in the story",
        "broader_description": "Comic Relief characters bring levity and laughter to a story, often diffusing tension or adding charm to dramatic situations. Their humor helps balance the tone and makes the narrative more engaging.",
        "category": "character_archetype",
        "keywords": "comic relief, humor, funny, comedy, light-hearted",
        "media_url": "/media/tags/comic-relief.jpeg",
        "media_type": "image"
    },
    {
        "title": "Animal Companion",
        "short_description": "A pet or animal friend",
        "broader_description": "Animal Companions are non-human allies who provide emotional support, loyalty, or even magical assistance. These characters often form deep bonds with their human counterparts and can symbolize purity, intuition, or protection.",
        "category": "character_archetype",
        "keywords": "animal companion, pet, animal, friend, support",
        "media_url": "/media/tags/animal-companion.jpeg",
        "media_type": "image"
    },
    {
        "title": "Child Prodigy",
        "short_description": "A gifted young character",
        "broader_description": "The Child Prodigy archetype features a young character with extraordinary talent or intelligence. These individuals often surprise others with their insight, capability, or invention, bringing a fresh perspective to the story.",
        "category": "character_archetype",
        "keywords": "child prodigy, gifted, young, talented, genius",
        "media_url": "/media/tags/child-prodigy.jpeg",
        "media_type": "image"
    },
    {
        "title": "Chosen One",
        "short_description": "Destined for greatness",
        "broader_description": "The Chosen One is a character singled out by destiny, prophecy, or circumstance to fulfill an important role or mission. These characters often rise from humble beginnings to confront great challenges, symbolizing hope, fate, and transformation.",
        "category": "character_archetype",
        "keywords": "chosen one, destiny, hero, prophecy, special",
        "media_url": "/media/tags/chosen-one-2.png",
        "media_type": "image"
    },

    // --- Settings ---
    {
        "title": "Post-Apocalyptic",
        "short_description": "After a world-ending event",
        "broader_description": "Post-Apocalyptic settings explore worlds devastated by catastrophic events like nuclear war, pandemics, or natural disasters. These stories focus on survival, rebuilding society, and the struggles faced by humanity amid ruins and desolation.",
        "category": "setting",
        "keywords": "post-apocalyptic, apocalypse, survival, ruins, future",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Dystopian",
        "short_description": "Oppressive, controlled society",
        "broader_description": "Dystopian settings depict futures or societies where oppressive governments or regimes exert extreme control over individuals, often stripping away freedoms and enforcing conformity. These narratives critique social, political, or technological issues through bleak, controlled worlds.",
        "category": "setting",
        "keywords": "dystopian, society, control, oppression, future",
        "media_url": "/media/tags/dystopian.jpeg",
        "media_type": "image"
    },
    {
        "title": "Utopian",
        "short_description": "Ideal, perfect society",
        "broader_description": "Utopian settings present idealized societies characterized by harmony, peace, and perfection. These stories explore concepts of perfect social, political, or technological systems, often as a contrast or critique to dystopian themes.",
        "category": "setting",
        "keywords": "utopian, perfect, ideal, society, harmony",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Virtual Reality",
        "short_description": "Stories set in digital worlds",
        "broader_description": "Virtual Reality settings involve characters interacting within simulated digital environments, such as online games or alternate digital realities. These stories explore themes of identity, escapism, and the blending of real and virtual experiences.",
        "category": "setting",
        "keywords": "virtual reality, digital, online, game, simulation",
        "media_url": "/media/tags/virtual-reality.png",
        "media_type": "image"
    },
    {
        "title": "Parallel World",
        "short_description": "Alternate universes",
        "broader_description": "Parallel World settings involve alternate or multiple universes that coexist alongside the known reality. Characters may travel between these worlds, encountering different versions of themselves or altered histories, often highlighting themes of choice and consequence.",
        "category": "setting",
        "keywords": "parallel world, alternate universe, multiverse, reality",
        "media_url": "/media/tags/parallel-world.jpeg",
        "media_type": "image"
    },
    {
        "title": "Alternate History",
        "short_description": "History with a twist",
        "broader_description": "Alternate History settings reimagine historical events with significant changes or 'what if' scenarios. These stories explore the impact of altered events on society, politics, and culture, offering fresh perspectives on familiar timelines.",
        "category": "setting",
        "keywords": "alternate history, what if, historical, different",
        "media_url": "/media/tags/alternate-history.jpeg",
        "media_type": "image"
    },
    {
        "title": "Space Colony",
        "short_description": "Life on other planets",
        "broader_description": "Space Colony settings focus on human settlements beyond Earth, exploring challenges of survival, adaptation, and society-building on other planets or in space habitats. These stories highlight futuristic technology and the human spirit of exploration.",
        "category": "setting",
        "keywords": "space colony, planet, space, future, sci-fi",
        "media_url": "/media/tags/space-colony.png",
        "media_type": "image"
    },
    {
        "title": "Small Town",
        "short_description": "Stories in a small community",
        "broader_description": "Small Town settings take place in close-knit rural or local communities where interpersonal relationships, traditions, and daily life are central. These stories often explore themes of belonging, change, and community dynamics.",
        "category": "setting",
        "keywords": "small town, community, rural, local, village",
        "media_url": "/media/tags/small-town.png",
        "media_type": "image"
    },
    {
        "title": "Big City",
        "short_description": "Urban, bustling environments",
        "broader_description": "Big City settings capture the fast-paced life and vibrant atmosphere of large urban centers. These stories often explore themes of anonymity, ambition, diversity, and the challenges of modern metropolitan life.",
        "category": "setting",
        "keywords": "big city, urban, metropolis, modern, busy",
        "media_url": "/media/tags/big-city.jpeg",
        "media_type": "image"
    },
    {
        "title": "Boarding School",
        "short_description": "School as a main setting",
        "broader_description": "Boarding School settings focus on stories taking place in residential schools where students live and study together. Themes often include youth, friendship, rivalry, coming-of-age, and the unique social dynamics of dormitory life.",
        "category": "setting",
        "keywords": "boarding school, school, dormitory, students, youth",
        "media_url": "/media/tags/boarding-school.jpeg",
        "media_type": "image"
    },
    {
        "title": "Haunted House",
        "short_description": "Ghosts and supernatural events",
        "broader_description": "Haunted House settings revolve around eerie, often abandoned houses filled with ghosts or supernatural phenomena. These stories explore fear, mystery, and the paranormal, often blending horror with suspense.",
        "category": "setting",
        "keywords": "haunted house, ghost, supernatural, scary, horror",
        "media_url": "/media/tags/haunted-house.png",
        "media_type": "image"
    },
    {
        "title": "Island",
        "short_description": "Stories set on an island",
        "broader_description": "Island settings place characters in isolated or remote island locations. These stories often explore themes of survival, adventure, escape, and the unique ecosystem and cultures of island life.",
        "category": "setting",
        "keywords": "island, sea, ocean, isolated, adventure",
        "media_url": "/media/tags/island.png",
        "media_type": "image"
    },
    {
        "title": "Desert",
        "short_description": "Arid, sandy environments",
        "broader_description": "Desert settings focus on harsh, dry landscapes characterized by sand and extreme conditions. Stories here explore survival, solitude, endurance, and sometimes mysticism or ancient secrets buried in the sands.",
        "category": "setting",
        "keywords": "desert, sand, arid, hot, survival",
        "media_url": "/media/tags/desert.jpeg",
        "media_type": "image"
    },
    {
        "title": "Forest",
        "short_description": "Woods and wilderness",
        "broader_description": "Forest settings immerse characters in natural, wooded environments, often emphasizing mystery, adventure, and the wild. These stories may explore themes of nature, isolation, survival, or magical elements tied to the wilderness.",
        "category": "setting",
        "keywords": "forest, woods, wilderness, nature, trees",
        "media_url": "/media/tags/forest.png",
        "media_type": "image"
    },
    {
        "title": "Underwater",
        "short_description": "Beneath the sea",
        "broader_description": "Underwater settings take place beneath the ocean's surface, exploring aquatic life, submerged civilizations, or marine adventures. These stories highlight the mystery and beauty of the underwater world, as well as its dangers.",
        "category": "setting",
        "keywords": "underwater, sea, ocean, aquatic, marine",
        "media_url": "/media/tags/underwater.png",
        "media_type": "image"
    },
    {
        "title": "Outer Space",
        "short_description": "Beyond Earth",
        "broader_description": "Outer Space settings explore locations beyond our planet, including spaceships, space stations, and alien worlds. These stories often focus on exploration, survival, interstellar conflict, and the vast unknown of the cosmos.",
        "category": "setting",
        "keywords": "outer space, space, stars, planets, sci-fi",
        "media_url": "/media/tags/outer-space.png",
        "media_type": "image"
    },

    // --- Themes ---
    {
        "title": "Identity",
        "short_description": "Exploring self and belonging",
        "broader_description": "Stories centered on Identity explore the journey of self-discovery, understanding one's place in the world, and the quest for belonging. These themes often delve into personal growth and acceptance.",
        "category": "theme",
        "keywords": "identity, self, belonging, discovery, personal",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Justice",
        "short_description": "Righting wrongs",
        "broader_description": "Justice-themed stories focus on the pursuit of fairness, law, and moral righteousness. They often depict struggles against injustice, corruption, or societal wrongs, highlighting ethical dilemmas and retribution.",
        "category": "theme",
        "keywords": "justice, right, wrong, law, fairness",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Revenge",
        "short_description": "Seeking payback",
        "broader_description": "Revenge stories revolve around characters seeking to right personal wrongs through retaliation. These narratives explore themes of vengeance, justice, and the consequences of retaliation.",
        "category": "theme",
        "keywords": "revenge, payback, justice, conflict",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Sacrifice",
        "short_description": "Giving up for others",
        "broader_description": "Sacrifice-themed stories focus on selflessness where characters give up something valuable—often their own wellbeing—for the benefit of others, emphasizing nobility, loss, and emotional depth.",
        "category": "theme",
        "keywords": "sacrifice, selfless, giving, loss, noble",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Survival",
        "short_description": "Staying alive against the odds",
        "broader_description": "Survival stories depict characters struggling to stay alive through adversity, danger, or extreme conditions. Themes include endurance, resilience, and the human instinct to overcome challenges.",
        "category": "theme",
        "keywords": "survival, life, danger, challenge, endurance",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Freedom",
        "short_description": "Breaking free",
        "broader_description": "Freedom-themed narratives explore liberation from oppression, constraints, or control. They highlight the struggle for independence, autonomy, and self-determination.",
        "category": "theme",
        "keywords": "freedom, liberation, escape, independence",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Corruption",
        "short_description": "Moral decay and downfall",
        "broader_description": "Corruption stories focus on moral decline, abuse of power, and the resulting downfall of individuals or societies. They often depict the consequences of greed, evil, and unethical behavior.",
        "category": "theme",
        "keywords": "corruption, decay, downfall, evil, power",
        "media_url": "/media/tags/corruption.jpeg",
        "media_type": "image"
    },
    {
        "title": "Technology vs Nature",
        "short_description": "Clash of progress and environment",
        "broader_description": "Stories about Technology vs Nature explore conflicts between human innovation and the natural world, examining themes of environmental impact, balance, and the consequences of technological advancement.",
        "category": "theme",
        "keywords": "technology, nature, progress, environment, clash",
        "media_url": "/media/tags/technology-vs-nature.png",
        "media_type": "image"
    },
    {
        "title": "Tradition vs Progress",
        "short_description": "Old ways vs new ideas",
        "broader_description": "Tradition vs Progress themes explore tensions between established customs and emerging ideas, highlighting conflicts over change, modernization, and cultural identity.",
        "category": "theme",
        "keywords": "tradition, progress, old, new, change",
        "media_url": "/media/tags/tradition-vs-progress.png",
        "media_type": "image"
    },
    {
        "title": "Family",
        "short_description": "Family bonds and relationships",
        "broader_description": "Family-themed stories focus on the bonds, conflicts, and dynamics within families, exploring themes of love, loyalty, responsibility, and interpersonal relationships.",
        "category": "theme",
        "keywords": "family, bonds, relationship, parents, siblings",
        "media_url": "/media/tags/family.png",
        "media_type": "image"
    },
    {
        "title": "Friendship",
        "short_description": "The power of friends",
        "broader_description": "Friendship-themed stories focus on the strength of bonds between friends, highlighting loyalty, support, and companionship that help characters overcome challenges together.",
        "category": "theme",
        "keywords": "friendship, friends, bond, support, loyalty",
        "media_url": "/media/tags/friendship.png",
        "media_type": "image"
    },
    {
        "title": "Love",
        "short_description": "Romantic and platonic love",
        "broader_description": "Love themes explore both romantic and platonic relationships, emphasizing affection, care, and the emotional connections that define human relationships.",
        "category": "theme",
        "keywords": "love, romance, affection, care, relationship",
        "media_url": "/media/tags/love.png",
        "media_type": "image"
    },
    {
        "title": "War",
        "short_description": "Conflict and battle",
        "broader_description": "War-themed narratives revolve around conflicts, battles, and struggles often set against a backdrop of larger social or political turmoil, exploring the cost and consequences of fighting.",
        "category": "theme",
        "keywords": "war, conflict, battle, fight, struggle",
        "media_url": "/media/tags/war.png",
        "media_type": "image"
    },
    {
        "title": "Peace",
        "short_description": "Harmony and calm",
        "broader_description": "Peace stories focus on the pursuit or restoration of harmony, calm, and resolution, often highlighting nonviolent solutions and reconciliation.",
        "category": "theme",
        "keywords": "peace, harmony, calm, resolution, nonviolence",
        "media_url": "/media/tags/peace.png",
        "media_type": "image"
    },
    {
        "title": "Isolation",
        "short_description": "Being alone or cut off",
        "broader_description": "Isolation themes explore experiences of solitude, loneliness, or separation, often delving into emotional struggles or self-discovery in solitude.",
        "category": "theme",
        "keywords": "isolation, alone, solitude, separation",
        "media_url": "/media/tags/isolation.png",
        "media_type": "image"
    },
    {
        "title": "Discovery",
        "short_description": "Finding new things",
        "broader_description": "Discovery stories center on exploration and uncovering the unknown, whether it's new places, ideas, or truths, fueling adventure and learning.",
        "category": "theme",
        "keywords": "discovery, exploration, new, adventure, learn",
        "media_url": "/media/tags/discovery.jpeg",
        "media_type": "image"
    },
    {
        "title": "Destiny",
        "short_description": "Fate and predetermined paths",
        "broader_description": "Destiny-themed narratives explore the idea of fate and preordained paths, often involving prophecy, choices, and the tension between free will and destiny.",
        "category": "theme",
        "keywords": "destiny, fate, future, prophecy, path",
        "media_url": "/media/tags/destiny.jpeg",
        "media_type": "image"
    },
    {
        "title": "Hope",
        "short_description": "Optimism and looking forward",
        "broader_description": "Hope stories emphasize optimism and positive outlooks, showing characters looking forward to better futures despite challenges or adversity.",
        "category": "theme",
        "keywords": "hope, optimism, future, positive",
        "media_url": null,
        "media_type": "video"
    },
    {
        "title": "Despair",
        "short_description": "Hopelessness and loss",
        "broader_description": "Despair-themed stories depict feelings of hopelessness, grief, and sadness, exploring emotional depths and tragic circumstances.",
        "category": "theme",
        "keywords": "despair, hopeless, loss, sadness, tragedy",
        "media_url": "/media/tags/despair.jpeg",
        "media_type": "image"
    }
];

const seedTags = async () => {
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
                    broader_description: tagDataItem.broader_description,
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