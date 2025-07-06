const puppeteer = require('puppeteer');

const db = require("./models");
const {sequelize, Gallery, GalleryCategory, Model,  Picture} = db;

class Scraper {
    async scrape(url) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const finalURL = response.url();

        console.log("goto successful");
        
        let gallery = await this.findOrCreateGallery(finalURL);
        const domain = this.getDomainFromURL(finalURL);

        let pictures = [];
        let galleryInfo = null;

        switch (domain) {
            case 'silkengirl.com':
                pictures = await this.scrapeSilkenFruit(page);
                break;
            case 'hotstunners.com':
                pictures = await this.scrapeHotMotors(page);
                break;
            case 'bustybloom.com':
                pictures = await this.scrapeGreenyBloom(page);
                break;
            case 'pornpics.com':
                ({ pictures, galleryInfo } = await this.scrapePornPics(page));
                break;
            default:
                console.log("Domain not recognized");
        }

        if (pictures.length > 0 && !gallery.thumbUrl) {
            gallery.thumbUrl = pictures[0].url;
            await gallery.save();
        }

        await this.savePicturesAndModels(pictures, gallery, galleryInfo);
        
        const scrapedData = {
            pictures,
            galleryInfo,
            gallery,
        };

        return scrapedData;
    }

    async scrapeByID(gal_id) {
        const gallery = await Gallery.findOne({ where: { id: gal_id } });

        await gallery.update({ sub_scraped: true, sub_scraped_at: new Date() });

        const url = gallery.url;
        console.log('Scraping url:', url);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const finalURL = response.url();

        const bodyContent = await page.evaluate(() => document.body.innerHTML);
        console.log('Body content:', bodyContent);

        console.log("goto successful");
        
        const domain = this.getDomainFromURL(finalURL);

        let pictures = [];
        let galleryInfo = null;

        switch (domain) {
            case 'silkengirl.com':
                pictures = await this.scrapeSilkenFruit(page);
                break;
            case 'hotstunners.com':
                pictures = await this.scrapeHotMotors(page);
                break;
            case 'bustybloom.com':
                pictures = await this.scrapeGreenyBloom(page);
                break;
            case 'babepedia.com':
                ({ pictures, galleryInfo } = await this.scrapeBabePedia(page));
                break;
            case 'pornpics.com':
                ({ pictures, galleryInfo } = await this.scrapePornPics(page));
                break;
            default:
                console.log("Domain not recognized");
        }

        if (pictures.length > 0 && !gallery.thumbUrl) {
            gallery.thumbUrl = pictures[0].url;
            await gallery.save();
        }

        await this.savePicturesAndModels(pictures, gallery, galleryInfo);
        
        const scrapedData = {
            pictures,
            galleryInfo,
            gallery,
        };

        return scrapedData;
    }

    async findOrCreateGallery(url) {
        let gallery = await Gallery.findOne({ where: { url } });
        if (!gallery) {
            gallery = await Gallery.create({ url });
        } else {
            gallery.url = url;
            await gallery.save();
        }
        return gallery;
    }

    getDomainFromURL(url) {
        return new URL(url)?.hostname?.replace('www.', '');
    }

    async scrapeSilkenFruit(page) {
        console.log("silkenfruit.com");
        await page.waitForSelector('.content_main');
        await this.wait(1000);
        return await this.collectImages(page, '.content_main .thumb_box .wrap_image img');
    }

    async scrapeHotMotors(page) {
        console.log("hotmotors.com");
        await page.waitForSelector('.gallery_janna2');
        await this.wait(1000);
        return await this.collectImages(page, '.gallery_janna2 a img');
    }

    async scrapeGreenyBloom(page) {
        console.log("greenybloom.com");
        return await this.collectImages(page, '#gallery_table .gallery_thumb img');
    }

    async scrapeBabePedia(page) {
        console.log("babepedia.com");

        await page.waitForSelector('#biolist');
        await page.evaluate(() => window.scrollBy(0, 2000));
        await this.wait(1000);
        const galleryInfo = await this.collectGalleryInfoBabepedia(page, '#biolist li');

        
        await page.waitForSelector('.gallery.useruploads');
        await page.evaluate(() => window.scrollBy(0, 5000));
        await this.wait(1000);
        const pictures = await this.collectImagesBabePedia(page, '.gallery.useruploads .img img, #profselect img, #profimg img');

        return { pictures, galleryInfo };
    }

    async scrapePornPics(page) {
        console.log("pornpics.com");
        await page.waitForSelector('.gallery-info.to-gall-info');
        await page.evaluate(() => window.scrollBy(0, 2000));
        await this.wait(1000);

        const galleryInfo = await this.collectGalleryInfo(page, '.gallery-info__item');
        await page.waitForSelector('.gallery-ps4');
        await page.evaluate(() => window.scrollBy(0, 5000));
        await this.wait(1000);

        const pictures = await this.collectImages(page, '.gallery-ps4 li img', true);

        return { pictures, galleryInfo };
    }

    async collectImagesBabePedia(page, selector) {
        const currentUrl = page.url();
        
        return await page.$$eval(selector, (elements) => {
            return elements.map((element) => {
                
                const validateAndFormatURL = (url) => {
                    if (!url.startsWith("http://") && !url.startsWith("https://")) {
                        url = "http://" + url;
                    }
                    url = url.replace(/(https?:\/\/)(?:[\/]{2,})?/, "$1");
                    return url.replace("http://", "https://");
                };

                const thumb = validateAndFormatURL(element.getAttribute('src').replace(/tn_/, ""));

                //Complete all partial links smartly
                
                const base_url = element.closest('a').href;
                var url = base_url;
                if (url.startsWith('/')) {
                    url = new URL(url, currentUrl).href;
                }
                url = validateAndFormatURL(url);

                return { thumb, url };
            });
        });
    }

    async collectImages(page, selector, isPornPics = false) {
        return await page.$$eval(selector, (elements, isPornPicsFlag) => {
            return elements.map((element) => {
                const validateAndFormatURL = (url) => {
                    if (!url.startsWith("http://") && !url.startsWith("https://")) {
                        url = "http://" + url;
                    }
                    url = url.replace(/(https?:\/\/)(?:[\/]{2,})?/, "$1");
                    return url.replace("http://", "https://");
                };

                const thumb = validateAndFormatURL(element.getAttribute('src').replace(/tn_/, ""));
                const url = isPornPicsFlag ? element.closest('a').href : thumb;
                return { thumb, url };
            });
        }, isPornPics);
    }

    async collectGalleryInfo(page, selector) {
        return await page.$$eval(selector, (infoItems) => {
            return infoItems.map((item) => {
                const title = item.querySelector('.gallery-info__title')?.textContent.trim().replace(':&nbsp;', '');
                const links = Array.from(item.querySelectorAll('a')).map(a => ({
                    title: a.textContent.trim(),
                    url: a.href
                }));
                return { title, links };
            });
        });
    }

    async collectGalleryInfoBabepedia(page, selector) {
        const currentUrl = page.url();
        return await page.$$eval(selector, (infoItems) => {
            return infoItems.map((item) => {
                const title = item.querySelector('label')?.textContent.trim().replace(':&nbsp;', '');
                const links = Array.from(item.querySelectorAll('a')).map(a => ({
                    title: a.textContent.trim(),
                    url: a.href
                }));

                //Complete all partial links smartly
                links.map((link) => {
                    if (link.url.startsWith('/')) {
                        link.url = new URL(link.url, currentUrl).href;
                    }
                });

                return { title, links };
            });
        });
    }

    async savePicturesAndModels(pictures, gallery, galleryInfo) {
        for (const [index, picture] of pictures.entries()) {
            let db_picture = await Picture.findOne({ where: { url: picture.url } });

            if (!db_picture) {
                db_picture = await Picture.create({ url: picture.url, stars: picture.stars });
                var associationExists = await gallery.hasPicture(db_picture);
                if (!associationExists) {
                    await gallery.addPicture(db_picture);
                }
            }
            if (galleryInfo) {
                await this.saveModelsFromGalleryInfo(galleryInfo, db_picture, gallery);
            }
            pictures[index] = { ...picture, saved: !!db_picture };
        }

        //Store new models in gallery
        //Add gallery info "Models" to gallery
        const galModels = [];
        if (galleryInfo) {
            galleryInfo.map(async (info) => {
                if (info.title == 'Models:') {
                    info.links.map(async (link) => {
                        galModels.push(link);

                        if (link) {
                            var model = await Model.findOne({
                                where: {
                                    url: link.url
                                }
                            })

                            link.model = model;

                            if (!model && link.stars > 0) {
                                model = await Model.create({
                                    name: link.title,
                                    url: link.url,
                                    thumbUrl: link.thumbUrl ?? '',
                                    stars: link.stars,
                                    // female: true
                                })
                            }

                            if (model) {
                                const galleryAssociationExists = await gallery.hasModel(model);
                                if (!galleryAssociationExists) {
                                    await gallery.addModel(model);
                                }

                                //update model stars
                                if (link.stars != model.stars) {
                                    model.stars = link.stars;
                                    await model.save();
                                }
                            }
                        }
                    })
                } else if (info.title == 'Categories:') {
                    info.links.map(async (link) => {
                        var category = await GalleryCategory.findOne({
                            where: {
                                name: link.title
                            }
                        })


                        if (!category) {
                            category = await GalleryCategory.create({
                                name: link.title,
                                url: link.url
                            })
                        } 
                        
                        var associationExists = await gallery.hasCategory(category);
                        if (!associationExists) {
                            
                            try {
                                await gallery.addCategory(category);
                            } catch (error) {
                                
                                console.log("Error adding category to gallery", error);
                            }
                        }
                    })
                }
            })
        }

        await Gallery.update({ sub_scraped: true, sub_scraped_at: new Date() }, { where: { id: gallery.id } });
    }

    async saveModelsFromGalleryInfo(galleryInfo, db_picture, gallery) {
        for (const infoItem of galleryInfo) {
            if (infoItem.title === 'Models:') {
                for (const link of infoItem.links) {
                    // Check if the model already exists
                    let model = await Model.findOne({ where: { url: link.url } });
                    if (!model) {
                        // Create the model if it doesn't exist
                        model = await Model.create({
                            name: link.title,
                            url: link.url,
                            thumbUrl: link.thumbUrl ?? '',
                            stars: link.stars,
                        });
                    }
    
                    // Ensure the model is associated with db_picture
                    const pictureAssociationExists = await db_picture.hasModel(model);
                    if (!pictureAssociationExists) {
                        await db_picture.addModel(model);
                    }
    
                    // Ensure the model is associated with the gallery
                    const galleryAssociationExists = await gallery.hasModel(model);
                    if (!galleryAssociationExists) {
                        await gallery.addModel(model);
                    }
    
                    // Save the model changes
                    await model.save();
                }
            }
        }
    }
    

    async wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

module.exports = Scraper;
