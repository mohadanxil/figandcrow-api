const { connect } = require("puppeteer-real-browser");
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Use CORS middleware
app.use(cors());
app.use(express.json());

async function test(email, password, templateTitle) {
    const { browser, page } = await connect({
        headless: false,
        slowMo:10,
        args: [],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
        plugins: [
            // require('puppeteer-extra-plugin-click-and-wait')()
        ]
    });

    // Set viewport to full size
    const dimensions = {
        width: 1080,
        height: 790
    };
    await page.setViewport(dimensions);

    // await page.goto('https://www.printful.com/auth/login');
    // // Allow all necessary permissions
    // await page.waitForSelector('[data-test="allow-all-cHLDkrEfrVoYQEQ"]');
    // await page.click('[data-test="allow-all-cHLDkrEfrVoYQEQ"]');
    
    // // Log in with credentials
    // await page.waitForSelector('#login-email');
    // await page.type('#login-email', email);
    
    // await page.waitForSelector('#login-password');
    // await page.type('#login-password', password);
    
    // await page.waitForSelector('input[type="submit"].pf-btn');
    // await page.click('input[type="submit"].pf-btn');    
    
    // await page.waitForNavigation();
   
    // await page.click('li.sidebar__item:has(a[aria-label="Stores"]) a');

    // // Click on the "Add product" button
    // await page.waitForSelector('#addProductButton');
    // await page.click('#addProductButton');
    // // function wait(ms) {
    // //     return new Promise(resolve => setTimeout(resolve, ms));
    // // }
    
    // // Then use it like this:
    // // await wait(600000); 
    // // Navigate to "My Product Templates" tab
    // await page.waitForSelector('.pf-tabs');
    // await page.waitForSelector('#tab-product-templates');
    // await page.evaluate(() => {
    //     const tab = document.querySelector('#tab-product-templates');
    //     if (tab) tab.scrollIntoView();
    // });
    // await page.click('[data-test="My product templates"]');

    // // Wait for the templates to load
    // await page.waitForFunction(() => {
    //     const templatesContainer = document.querySelector('.product-template-picker-item');
    //     return templatesContainer && templatesContainer.offsetParent !== null; // Check if the container is visible
    // });

    // // Get all template items and find the specified template
    // const templates = await page.$$('.product-template-picker-item');
    // let templateFound = false; // Flag to track if the template is found

    // for (const template of templates) {
    //     const titleElement = await template.$('h5.pf-h5');
    //     const title = await page.evaluate(el => el.textContent.trim(), titleElement);

    //     if (title === templateTitle) {
    //         await template.click(); // Click on the template
    //         console.log(`Selected template: ${title}`);
    //         templateFound = true; // Set the flag to true
    //         break; // Exit the loop once the template is clicked
    //     }
    // }

    // // If the template was not found, throw an error
    // if (!templateFound) {
    //     throw new Error(`Template with title "${templateTitle}" not found.`);
    // }

    // // Proceed to mockups
    // await page.waitForSelector('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', { visible: true });
    // await page.click('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]');

    // // Click on the "Choose mockups" button
    // await page.waitForSelector('a.pf-btn.pf-btn-secondary.pf-btn-block--mobile', { visible: true });
    // await page.click('a.pf-btn.pf-btn-secondary.pf-btn-block--mobile');

    // // Wait for the mockup slider to be visible
    // await page.waitForSelector('.slick-track', { visible: true });

    // // Get all mockup slides and select the one with "flat_back"
    // const mockups = await page.$$('.mockup-slide');

    // for (let i = 0; i < mockups.length; i++) {
    //     const bgImage = await mockups[i].evaluate(el => {
    //         const style = window.getComputedStyle(el);
    //         return style.backgroundImage.slice(5, -2);
    //     });

    //     // Check if the URL contains the keyword "flat_back"
    //     if (bgImage.includes('flat_back')) {
    //         await mockups[i].click(); // Click on this specific mockup
    //         console.log(`Clicked on mockup with URL: ${bgImage}`);
    //         break; // Exit loop after clicking the desired mockup
    //     }
    // }

    // // Click on the "Continue" button
    // await page.waitForSelector('#js--continue', { visible: true });
    // await page.click('#js--continue');

    // // Fill in the input with the same title and "Test" as a suffix
    // await page.waitForSelector('input[name="productTitle"]'); // Adjust this selector to the actual input field
    // await page.type('input[name="productTitle"]', `${templateTitle} Test`);

    // // Continue with further actions if needed...

    // // Close the browser if you want to close it at this point
    // await browser.close();
    try {
        await page.goto('https://www.printful.com/auth/login');
        await page.waitForSelector('[data-test="allow-all-cHLDkrEfrVoYQEQ"]', { timeout: 10000 });
        await page.click('[data-test="allow-all-cHLDkrEfrVoYQEQ"]');

        // Log in
        await page.waitForSelector('#login-email', { timeout: 10000 });
        await page.type('#login-email', email);
        await page.waitForSelector('#login-password', { timeout: 10000 });
        await page.type('#login-password', password);
        await page.waitForSelector('input[type="submit"].pf-btn');
        await page.click('input[type="submit"].pf-btn');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Navigate to "Add product"
        await page.waitForSelector('li.sidebar__item:has(a[aria-label="Stores"]) a', { timeout: 10000 });
        await page.click('li.sidebar__item:has(a[aria-label="Stores"]) a');

        // Click on the "Add product" button
        await page.waitForSelector('#addProductButton', { timeout: 10000 });
        await page.click('#addProductButton');

        // Wait for the modal to open
        const modal = await page.waitForSelector('#fullscreen-modal-vue', { visible: true });
        console.log(modal)
        if(modal){
            // Navigate to "My Product Templates" tab within the modal
            const tabSelector = '#tab-product-templates';
            await page.waitForSelector('#tab-product-templates', { timeout: 10000 });
            // await page.click('#tab-product-templates');

            // You might want to add a delay to ensure the tab switch is complete
            // await page.waitForTimeout(500); // Adjust the timeout as necessary

            // Wait for the templates to load
            // await page.waitForFunction(() => {
            //     const templatesContainer = document.querySelector('.product-template-picker-item');
            //     return templatesContainer && templatesContainer.offsetParent !== null;
            // });

            // // Get all template items and find the specified template
            // const templates = await page.$$('.product-template-picker-item');
            // let templateFound = false;

            // for (const template of templates) {
            //     const titleElement = await template.$('h5.pf-h5');
            //     const title = await page.evaluate(el => el.textContent.trim(), titleElement);

            //     if (title === templateTitle) {
            //         await template.click(); // Click on the template
            //         console.log(`Selected template: ${title}`);
            //         templateFound = true; // Set the flag to true
            //         break; // Exit the loop once the template is clicked
            //     }
            // }
            // if (!templateFound) {
            //     throw new Error(`Template with title "${templateTitle}" not found.`);
            // }

            // Proceed to mockups
            // await page.waitForSelector('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', { visible: true });
            // await page.click('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]');

            // // Click on the "Choose mockups" button
            // await page.waitForSelector('a.pf-btn.pf-btn-secondary.pf-btn-block--mobile', { visible: true });
            // await page.click('a.pf-btn.pf-btn-secondary.pf-btn-block--mobile');

            // // Wait for the mockup slider to be visible
            // await page.waitForSelector('.slick-track', { visible: true });

            // // Get all mockup slides and select the one with "flat_back"
            // const mockups = await page.$$('.mockup-slide');

            // for (let mockup of mockups) {
            //     const bgImage = await mockup.evaluate(el => {
            //         const style = window.getComputedStyle(el);
            //         return style.backgroundImage.slice(5, -2);
            //     });

            //     if (bgImage.includes('flat_back')) {
            //         await mockup.click();
            //         console.log(`Clicked on mockup with URL: ${bgImage}`);
            //         break; // Exit loop after clicking the desired mockup
            //     }
            // }

            // // Click on the "Continue" button
            // await page.waitForSelector('#js--continue', { visible: true });
            // await page.click('#js--continue');

            // // Fill in the input with the same title and "Test" as a suffix
            // await page.waitForSelector('input[name="productTitle"]', { visible: true });
            // await page.type('input[name="productTitle"]', `${templateTitle} Test`);

            // Continue with further actions if needed...
            // await browser.close();
        }

    } catch (error) {
        console.error("An error occurred during the process:", error);
    } finally {
        // await browser.close(); // Ensure the browser closes in case of an error
    }
}

// API endpoint to handle the scraping request
app.post('/getData', async (req, res) => {
    const { email, password } = req.body; // Expecting email and password in the request body
    const title = "Hooded long-sleeve tee"; // This is the title you are looking for

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        await test(email, password, title); // Pass email and password to the test function
        res.status(200).send("Browser opened and actions performed.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
