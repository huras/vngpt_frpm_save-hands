const { seedTags } = require('./tagSeeder');

const runAllSeeders = async() => {
    try {
        console.log('🚀 Starting database seeding...\n');

        // Seed tags
        await seedTags();
        console.log('\n');

        console.log('✅ All seeders completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

const runSpecificSeeder = async(seederName) => {
    try {
        console.log(`🚀 Running ${seederName} seeder...\n`);

        switch (seederName) {
            case 'tags':
                await seedTags();
                break;
            default:
                console.error(`❌ Unknown seeder: ${seederName}`);
                console.log('Available seeders: tags');
                process.exit(1);
        }

        console.log(`\n✅ ${seederName} seeder completed successfully!`);
    } catch (error) {
        console.error(`❌ ${seederName} seeder failed:`, error);
        process.exit(1);
    }
};

// Only run if this file is executed directly
if (require.main === module) {
    // Handle command line arguments
    const args = process.argv.slice(2);
    if (args.length > 0) {
        runSpecificSeeder(args[0]);
    } else {
        runAllSeeders();
    }
}

module.exports = { runAllSeeders, runSpecificSeeder };