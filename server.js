const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
const port = 3001;

// Use CORS middleware
app.use(cors());
app.use(express.json());

async function scrapeData() {
    const browser = await chromium.launch({ headless: false, slowMo: 10 });
    
    // Create a new browser context with a specific user agent
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    const newPage = await context.newPage();

    // Navigate to the login page
    await newPage.goto('https://www.printful.com/auth/login');
    console.log("Navigated to login page");

    // Fill in the email and password fields
    await newPage.fill('#login-email', 'your-email@example.com');  // Replace with your email
    console.log("Filled email");

    await newPage.fill('#login-password', 'your-password');  // Replace with your password
    console.log("Filled password");

    // Prompt user to solve the CAPTCHA
    console.log("Please solve the CAPTCHA, then press Enter to continue...");
    await new Promise(resolve => process.stdin.once('data', resolve)); // Wait for user input

    // Click the login button
    await newPage.click('input[type="submit"]');
    console.log("Clicked submit button");

    // Wait for a successful login (change this selector to match the success element)
    try {
        await newPage.waitForSelector('selector-for-success-message', { timeout: 30000 }); // Adjust the selector
        console.log("Login successful!");
    } catch (error) {
        console.log("Login failed or CAPTCHA not solved in time.");
    }

    // Take a screenshot after logging in
    await newPage.screenshot({ path: 'screenshot.png' });
    console.log("Screenshot taken");

    // Continue with further scraping actions as needed...

    await browser.close();
}

app.post('/getData', async (req, res) => {
    try {
        await scrapeData();
        res.status(200).send("Data scraped and screenshot taken.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
