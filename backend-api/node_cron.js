const cron = require('node-cron');
const axios = require('axios');

// Define the scheduled job but don't start it immediately
const auto_scrapper = cron.schedule(
    '* * * * *',
    async() => {

        const MAX = 1;
        const ENABLED = false;
        const BOT_INTERVAL = 2; // in minutes

        console.log('---------------------------------------------');
        console.log('Scheduled job triggered');

        try {
            // Fetch URLs to scrape
            const response = await axios.get('http://localhost:3056/get-auto-scrape-list', {
                params: {
                    page: 1,
                    perPage: 30000,
                },
            });

            var ids = response.data?.data.map((item) => item?.id).filter(Boolean);



            if (!ids.length) {
                console.log('No URLs found to scrape');
                return;
            } else {
                console.log("Found in total", ids.length, "URLs to scrape");
            }

            const current_time_minute = new Date().getMinutes();
            if (current_time_minute % BOT_INTERVAL !== 0) {
                return;
            }

            if (ENABLED) {
                const scraper = new Scraper();
                // Scrape each URL sequentially

                var counter = 0;
                for (const id of ids) {
                    console.log('Scraping URL:', id);
                    await scraper.scrapeByID(id);
                    await axios.post('http://localhost:3056/scrape-related-gals', {
                        id: id,
                    });
                    counter++;
                    if (counter >= MAX) {
                        break
                    }
                }
            }


            console.log('Scraping job completed');
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }, { scheduled: false } // Disable automatic start
);

// Now you can start the job manually by calling auto_scrapper.start()
module.exports = auto_scrapper;