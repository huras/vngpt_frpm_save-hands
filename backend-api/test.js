const GalleryService = require("./controllers/GalleryService");
const db = require("./models");
const Scraper = require("./scraper");
const {sequelize, Gallery, GalleryCategory, Model,  Picture} = db;

class MyTest {
    constructor() {
        
    }

    static async doTest() {
        return;
        const target_url = 'https://www.babepedia.com/babe/Emily_Deyt-Aysage';

        //create a new gallery with url target_url
        const gallery = await GalleryService.maybeCreateGallery(target_url);

        const scraper = new Scraper();
        await scraper.scrapeByID(gallery.id);
    }
}


module.exports = MyTest;