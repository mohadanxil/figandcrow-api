const express = require('express');
const { chromium } = require('playwright');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3001;

const cookiesPath = './cookies.json';

app.use(cors());

// Scraping function with CAPTCHA solving and cookie saving
async function scrapeData() {
    const browser = await chromium.launch({
        headless: true, // Manual CAPTCHA solving
        args: [
            '--disable-blink-features=AutomationControlled', // Disable automation flags
            '--start-maximized', // Open maximized
            '--disable-web-security', // Optional for CORS issues
            '--disable-site-isolation-trials',
        ],
        slowMo: 100,
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1280, height: 1024 },
    });

    // Disable navigator.webdriver to avoid detection
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
    });

    await context.addCookies([
        {
            "name": "your_cookie_name",
            "value": "your_cookie_value",
            "domain": "www.printful.com",
            "path": "/",
        },
    ]);

    const page = await context.newPage();

    await page.goto('https://www.printful.com');
    console.log("Please solve the CAPTCHA manually in the browser...");

    // Wait for the user to solve CAPTCHA
    await page.waitForTimeout(180000); // Wait up to 3 minutes

    // Save cookies after CAPTCHA solving
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log("Cookies saved successfully!");

    // Scrape example data
    const data = await page.evaluate(() => {
        return document.querySelector('h1').innerText; // Example of scraping
    });
    
    await browser.close();
    return data;
}

// Scraping using saved cookies
async function scrapeWithCookies() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 50,
    });

    const context = await browser.newContext();

    // Load cookies if they exist
    if (fs.existsSync(cookiesPath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesPath));
        await context.addCookies(cookies);
        console.log("Cookies loaded successfully!");
    }

    const page = await context.newPage();
    await page.goto('https://www.printful.com');

    // Scrape example data
    const data = await page.evaluate(() => {
        return document.querySelector('h1').innerText;
    });

    await browser.close();
    return data;
}

// API endpoint for manual CAPTCHA solving and cookie saving
app.get('/scrape-with-captcha', async (req, res) => {
    try {
        const data = await scrapeData(); // Scrape after solving CAPTCHA
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Scraping failed' });
    }
});

// API endpoint for using saved cookies to scrape data
app.get('/scrape-with-cookies', async (req, res) => {
    try {
        const data = await scrapeWithCookies(); // Scrape with cookies
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Scraping failed' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
