#!/usr/bin/env node

const { runAllSeeders, runSpecificSeeder } = require('./seeders');

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
    runSpecificSeeder(args[0]);
} else {
    runAllSeeders();
}