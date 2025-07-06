const axios = require('axios');

export function startBackgroundWorker() {
  const scrapeInterval = 30 * 1000; // 30 seconds in milliseconds

  setInterval(async () => {
    try {
      const somenumber = '123'; // Replace with the actual number you want to use
      const response = await axios.post(`http://localhost:3056/scrape/${somenumber}`);
      console.log('Background worker response:', response.data);
    } catch (error) {
      console.error('Background worker error:', error);
    }
  }, scrapeInterval);
}
