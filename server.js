const { connect } = require("puppeteer-real-browser")
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Use CORS middleware
app.use(cors());
app.use(express.json());

async function test(email, password) {
    const { browser, page } = await connect({
        headless: false,
        args: [],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
        plugins: [
            require('puppeteer-extra-plugin-click-and-wait')()
        ]
    });

    // Set viewport to full size
    const dimensions = {
        width: 1920, // Set width to 1920px or any desired width
        height: 1080 // Set height to 1080px or any desired height
    };
    await page.setViewport(dimensions);

    await page.goto('https://www.printful.com/auth/login');
    await page.waitForSelector('#login-email'); // Replace with the actual selector for email input
    await page.type('#login-email', email); // Use the email passed from the request
    
    await page.waitForSelector('#login-password'); // Replace with the actual selector for password input
    await page.type('#login-password', password); // Use the password passed from the request
    
    // Click the login button (update selector to match the login button)
    await page.click('button[type="submit"]'); // Update with actual selector for login button
    
    // Wait for navigation to complete
    await page.waitForNavigation();
    
    // Continue with further actions if needed...

    // Close the browser (if you want to close it at this point)
    // await browser.close();
}

// API endpoint to handle the scraping request
app.post('/getData', async (req, res) => {
    const { email, password } = req.body; // Expecting email and password in the request body

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        await test(email, password); // Pass email and password to the test function
        res.status(200).send("Browser opened and actions performed.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
