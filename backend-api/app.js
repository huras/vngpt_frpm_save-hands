// app.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const { Op } = require('sequelize');

const app = express();
const port = 3056; // You can change this port as needed

const routes = require('./routes');

const db = require("./models");

// Middleware to parse JSON requests
app.use(express.json());

(async() => {
    const database = db.sequelize;

    try {
        const resultado = await database.sync({
            // force: true, // Set to true to drop and recreate tables
            // alter: true, // Set to true to update the schema without dropping tables
        });
        console.log(resultado);
    } catch (error) {
        console.log(error);
    }
})();

// Use cors middleware to allow requests from all origins (you can configure it more securely)
app.use(cors());

// Serve static files from the public directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Use the routes from the routes folder
// Import routes


// Use routes
app.use('/', routes);

//------------------------ End Models Routes


// Start the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    const workers = 1;
    for (let i = 0; i < workers; i++) {
        // setTimeout(() => {
        // startBackgroundWorker(); // Start the background worker
        // }, i * 3000);
    }
});

// const auto_scrapper = require('./node_cron'); // Import the job
// auto_scrapper.start(); // Start the cron job

const MyTest = require('./test');
MyTest.doTest();