const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const port = 3001;

// Use CORS middleware
app.use(cors());
app.use(express.json());

async function scrapeData(urls) {
    const browser = await chromium.launch({ headless: true });
    const results = [];
    const nameSheet = 'Data.csv';

    async function scrapePageData(pageUrl) {
        const newPage = await browser.newPage();
        try {
            await newPage.goto(pageUrl);
            await newPage.waitForSelector('[jstcache="3"]', { timeout: 10000 });
            const name = await newPage.$eval('h1', el => el.textContent.trim()).catch(() => '');
            const rating = await newPage.$eval('[aria-label*="stars"]', el => el.textContent.trim()).catch(() => '');
            const reviews = await newPage.$eval('[aria-label*=" reviews"]', el => el.textContent.replace(/\(|\)/g, '').trim()).catch(() => '');
            const category = await newPage.$eval('[aria-label="Category"]', el => el.textContent.trim()).catch(() => '');
            const address = await newPage.$eval('[data-item-id="address"]', el => el.textContent.trim()).catch(() => '');
            const website = await newPage.$eval('[data-item-id="authority"]', el => el.href.trim()).catch(() => '');
            const phone = await newPage.$eval('[data-tooltip="Copy phone number"]', el => el.textContent.trim()).catch(() => '');
            const price = await newPage.$eval('button[aria-haspopup="dialog"]', el => el.getAttribute('aria-label')).catch(() => '');
            const starRating = await newPage.$eval('.F7nice span[aria-hidden="true"]', el => el.textContent.trim()).catch(() => '');
            const totalReviews = await newPage.$eval('.F7nice span[aria-label*=" reviews"]', el => el.textContent.trim()).catch(() => '');

            // Click on the "View more amenities" button if it exists
            const viewMoreAmenitiesButton = await newPage.$('button[aria-label="View more amenities"]');
            if (viewMoreAmenitiesButton) {
                await viewMoreAmenitiesButton.click();
                await newPage.waitForTimeout(2000); // wait for amenities to load
            }

            // Extract amenities
            let amenities = await newPage.$$eval('.QoXOEc .CK16pd', items => {
                return items.map(item => {
                    const label = item.getAttribute('aria-label');
                    const isAvailable = !item.classList.contains('fyvs7e');
                    if (isAvailable) {
                        return label;
                    }
                });
            }).catch(() => []);
            amenities = amenities?.filter((item) => item !== undefined);

            return {
                name: `"${name}"`,
                rating: `"${rating}"`,
                reviews: `"${reviews}"`,
                category: `"${category}"`,
                address: `"${address}"`,
                website: `"${website}"`,
                phone: `"${phone}"`,
                price: `"${price}"`,
                starRating: `"${starRating}"`,
                totalReviews: `"${totalReviews}"`,
                amenities: `"${amenities.join(",")}"`,
                url: `"${pageUrl}"`
            };
        } catch (error) {
            console.error(`Error scraping URL ${pageUrl}:`, error);
            return null;
        } finally {
            await newPage.close();
        }
    }

    async function GetData(Links) {
        const {url:googleUrls,type,city} = Links
        console.time("Execution Time");
        const page = await browser.newPage();
        console.log('Navigating to Google Maps search page...', googleUrls);
        await page.goto(googleUrls);
        console.log(`[aria-label='Results for ${type} in ${city}']`)
        await page.waitForSelector(`[aria-label="Results for ${type} in ${city}"]`, { timeout: 10000 });
        const scrollableSelector = `[aria-label="Results for ${type} in ${city}"]`;
        let previousHeight = await page.evaluate(`document.querySelector('${scrollableSelector}').scrollHeight`);
        console.log('Scrolling through the list to load all results...');
        while (true) {
            await page.evaluate(`document.querySelector('${scrollableSelector}').scrollBy(0, document.querySelector('${scrollableSelector}').scrollHeight)`);
            await page.waitForTimeout(3000);
    
            const newHeight = await page.evaluate(`document.querySelector('${scrollableSelector}').scrollHeight`);
            console.log('Scrolled to new height:', newHeight);
    
            if (newHeight === previousHeight) {
                break;
            }
            previousHeight = newHeight;
        }
    
        const urls = await page.$$eval('a', links => links.map(link => link.href).filter(href => href.startsWith('https://www.google.com/maps/place/')));
    
        const batchSize = 5;
        for (let i = 0; i < urls.length; i += batchSize) {
            const batchUrls = urls.slice(i, i + batchSize);
            const batchResults = await Promise.all(batchUrls.map(url => scrapePageData(url)));
            results.push(...batchResults.filter(result => result !== null));
            console.log(`Batch ${i / batchSize + 1} completed.`);
        }

        // Ensure writeCsv completes before closing the browser
        if (results.length > 0) {
            await writeCsv(results, `Data-${type}-${city}.csv`);
        }
        await browser.close();
        console.timeEnd("Execution Time");
    }

    async function writeCsv(results, nameSheet) {
        const csvHeader = 'Name,Rating,Reviews,Category,Address,Website,Phone,Price,StarRating,TotalReviews,Amenities,Url\n';
        const csvRows = results.map(r => `${r.name},${r.rating},${r.reviews},${r.category},${r.address},${r.website},${r.phone},${r.price},${r.starRating},${r.totalReviews},${r.amenities},${r.url}`).join('\n');
        
        // Return a Promise that resolves when the file is written
        return new Promise((resolve, reject) => {
            fs.writeFile(nameSheet, csvHeader + csvRows, (err) => {
                if (err) {
                    console.error('Error writing CSV file:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Start processing the URLs
    if (urls) {
        // for (const url of urls) {
            await GetData(urls);
        // }
    }
}
async function createZip(zipFilePath, fileNames) {
    console.log(fileNames)
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level
    });

    return new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);
        fileNames.forEach(fileName => {
            archive.file(fileName, { name: path.basename(fileName) });
        });
        archive.finalize();
    });
}
app.post('/getData', async (req, res) => {
    const { fileName, urls } = req.body;
    const generatedFiles = [];
    try {
        console.log(urls, "url");

        // Call scrapeData and wait for it to complete
         for (const url of urls) {
            await scrapeData(url);
        }
        for (const data of urls) {
            const { type, city } = data;
            const filePath = path.join(__dirname, `Data-${type}-${city}.csv`);
            generatedFiles.push(filePath);
        }

        // for (const data of urls) {
        //     const {url,type,city} = data
        //     const filePath = path.join(__dirname, `Data-${type}-${city}.csv`);
    
        //     // Check if the file exists before trying to download it
        //     if (fs.existsSync(filePath)) {
        //         res.download(filePath, fileName, (err) => {
        //             if (err) {
        //                 console.error('Error sending file:', err);
        //                 res.status(500).send('Error sending file');
        //             }
        //         });
        //     } else {
        //         res.status(404).send('Data file not found.');
        //     }
        // }
        const zipFilePath = path.join(__dirname, `${fileName}.zip`);

        // Create a zip file containing all the CSV files
        await createZip(zipFilePath, generatedFiles);

        // Send the zip file for download
        res.download(zipFilePath, fileName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error sending file');
            }
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
