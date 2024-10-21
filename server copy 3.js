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
            require('puppeteer-extra-plugin-click-and-wait')()
        ]
    });

    // Set viewport to full size
    const dimensions = {
        width: 1080,
        height: 690
    };
    await page.setViewport(dimensions);
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
        await page.waitForSelector('li.sidebar__item:has(a[aria-label="Stores"]) a', { timeout: 10000 });
        await page.click('li.sidebar__item:has(a[aria-label="Product templates"]) a');
        await page.waitForSelector('.product-template-items--grid .product-template-item', { timeout: 10000 });

        // // Get all product template titles
        // const templateItem = await page.waitForSelector('.product-template-items--grid .product-template-item', { timeout: 10000 });
        // // const templateItems = await page.waitForSelector('.product-template-item', { timeout: 10000 });
        // const templateItems = await page.$$eval('.product-template-item', items => 
        //     items.map(item => item) // or any other property you need like item.textContent, etc.
        // );
        // Select all the product template items
        // Select all the product template items
       // Select all the product template items
       const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Select all the product template items
const templateItems = await page.$$('.product-template-item');

for (const item of templateItems) {
  // Find the <a> tag inside each template item
  const linkHandle = await item.$('a.product-template-link');
  
  // Check if the <a> tag exists
  if (linkHandle) {
    // Get the text content of the <a> tag
    const linkText = await page.evaluate(el => el.textContent.trim(), linkHandle);
    
    // Compare it with the templateTitle
    if (linkText === templateTitle) {
      console.log(`Found matching template: ${linkText}`);
      
      // Click the <a> tag to navigate to the new page
      await linkHandle.click();
      console.log(`Navigating to the page for ${linkText}`);
      
      // Wait for the navigation to complete
      await page.waitForNavigation();

      // Check for overlays and hide if necessary
      const overlay = await page.$('.overlay-selector'); // Replace with actual overlay selector
      if (overlay) {
        console.log('Overlay found, hiding it before clicking.');
        await overlay.evaluate(el => el.style.display = 'none');
      }

     // Wait for the "Add to store" button and click it
const addToStoreButton = await page.waitForSelector('button[data-test="product-templates-item-add-to-store"]', { visible: true });
await page.waitForFunction(button => !button.disabled, {}, addToStoreButton);

if (addToStoreButton) {
    await addToStoreButton.evaluate(el => el.scrollIntoView());

    try {
        await page.evaluate(button => button.click(), addToStoreButton);
        console.log('Clicked on "Add to store" button');
    } catch (error) {
        console.log('Error clicking on "Add to store" button:', error);
    }
    // await page.waitForSelector('.loading-overlay', { state: 'hidden' });
    // const loading = await page.waitForSelector('.loading-overlay', { state: 'hidden' });
    // const loadingEval = await page.$('.loading-overlay');
    // console.log(loading,"loading",loadingEval);
    const overlay = await page.$('.loading-overlay'); // Replace with actual overlay selector
      if (overlay) {
        console.log('Overlay found, hiding it before clicking.');
        await overlay.evaluate(el => el.style.display = 'none');
      }
    // Now, wait for the "Proceed to mockups" button to appear
    const proceedButton = await page.waitForSelector('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', { visible: true });
    // await page.waitForFunction(button => !button.disabled, {}, proceedButton);
    // Ensure proceedButton is defined
    async function waitForButtonAndClick(selector, maxRetries = 10, delay = 1000) {
        let retries = 0;
        let buttonEnabled = false;
    
        while (retries < maxRetries && !buttonEnabled) {
            try {
                // Wait for the button to be visible in the DOM
                const button = await page.waitForSelector(selector, { visible: true });
    
                // Check if the button is disabled
                const isDisabled = await page.evaluate(button => button.disabled, button);
    
                if (!isDisabled) {
                    // If button is enabled, click it
                    await button.click();
                    buttonEnabled = true;
                    console.log('Successfully clicked the "Proceed to mockups" button.');
                } else {
                    // If button is still disabled, retry after delay
                    console.log(`Button is disabled, retrying... (Attempt ${retries + 1})`);
                    await page.waitForTimeout(delay);
                    retries++;
                }
            } catch (error) {
                console.log('Error while checking button status:', error);
            }
        }
    
        if (!buttonEnabled) {
            console.log('Max retries reached. Button did not become enabled.');
        }
    }
    
    // Call the function with your selector for the button
    await waitForButtonAndClick('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', 20, 500);
    // if (proceedButton) {
    //     await proceedButton.evaluate(el => el.scrollIntoView());
    //     // try {
    //     //     await proceedButton.click();
    //     //     console.log('Clicked on "Proceed to Mockups" button');
    //     // } catch (error) {
    //     //     console.log('Error clicking on "Proceed to Mockups" button:', error);
    //     // }
    //         try {
    //             console.log("checking page with button");
    //             await page.evaluate(button => button.click(), proceedButton);
    //             console.log('Button Clicked');
    //             // await browser.close()
    //             // const proceedButtonBoundingBox = await proceedButton.boundingBox();
    //             // if (proceedButtonBoundingBox) {
    //                 // await proceedButton.click();
    //                 // Move mouse and click
    //                 // await page.mouse.move(proceedButtonBoundingBox.x + proceedButtonBoundingBox.width / 2, proceedButtonBoundingBox.y + proceedButtonBoundingBox.height / 2);
    //                 // await page.mouse.click(proceedButtonBoundingBox.x + proceedButtonBoundingBox.width / 2, proceedButtonBoundingBox.y + proceedButtonBoundingBox.height / 2);
    //                 // console.log('Clicked on "Proceed to mockups" button using mouse',proceedButtonBoundingBox);
    //             // } else {
    //             //     await proceedButton.click();
    //             //     console.log('Could not get bounding box for "Proceed to mockups" button.');
    //             // }
    //         } catch (error) {
    //             console.log('Error clicking on "Proceed to mockups" button:', error);
    //         }
    //     } else {
    //         console.log('"Proceed to mockups" button is disabled, cannot click.');
    //     }
    } else {
        console.log('"Proceed to mockups" button not found');
    }
} else {
    console.log('"Add to store" button not found');
}

    //   // Wait for the "Proceed to mockups" button to appear
    //   const proceedButton = await page.waitForSelector('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', { visible: true });
      
    //   if (proceedButton) {
    //     // Scroll the button into view
    //     await proceedButton.evaluate(el => el.scrollIntoView());

    //     // Attempt to click the button
    //     try {
    //       await page.evaluate(button => button.click(), proceedButton); // Simulate click using JavaScript
    //       console.log('Clicked on "Proceed to mockups" button');
    //     } catch (error) {
    //       console.log('Error clicking on "Proceed to mockups" button:', error);
    //     }
    //     // Wait for the "Proceed to mockups" button to appear
    //     const proceedButton = await page.waitForSelector('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', { visible: true });

    //     if (proceedButton) {
    //         // Check if the button is disabled
    //         const isDisabled = await page.evaluate(button => button.disabled, proceedButton);
    //         if (isDisabled) {
    //             console.log('"Proceed to mockups" button is disabled, cannot click.');
    //         } else {
    //             // Scroll the button into view
    //             await proceedButton.evaluate(el => el.scrollIntoView());

    //             // Attempt to click the button
    //             try {
    //                 await page.evaluate(button => button.click(), proceedButton); // Simulate click using JavaScript
    //                 console.log('Clicked on "Proceed to mockups" button');
    //             } catch (error) {
    //                 console.log('Error clicking on "Proceed to mockups" button:', error);
    //             }
    //         }
    //     } else {
    //         console.log('"Proceed to mockups" button not found');
    //     }
    //   } else {
    //     console.log('"Proceed to mockups" button not found');
    //   }
      
    //   break; // Exit the loop if match found (optional)
    // }
  }
  break;
}

        // console.log(templateItems)
        // Loop through template items to find the matching title
        // for (const item of templateItems) {
        //     if (item.title === templateTitle) {
        //         // Use page.$ to get a handle to the item
        //         const itemHandle = await page.$(`.product-template-item:nth-of-type(${Array.from(templateItems).indexOf(item) + 1})`);
        //         if (itemHandle) {
        //             // Hover over the product image
        //             const imageElement = await itemHandle.$('.product-template-image__overlay'); // Adjust this selector as needed
        //             if (imageElement) {
        //                 await imageElement.hover();
        //                 // Click the "Add to Store" button
        //                 const addToStoreButton = await itemHandle.$('[data-test="product-templates-item-add-to-store"]');
        //                 if (addToStoreButton) {
        //                     await addToStoreButton.click();
        //                     console.log(`Clicked "Add to Store" for template: ${templateTitle}`);
        //                 } else {
        //                     console.error('Add to Store button not found.');
        //                 }
        //             } else {
        //                 console.error('Image overlay not found.');
        //             }
        //         }
        //         break; // Exit the loop after the action
        //     }
        // }

        // console.log("Product Template Titles:", templateTitles);
        // // Navigate to Product Templates
        // await page.waitForSelector('.product-template-item', { timeout: 10000 });

        // // Select the template by title
        // const templateSelector = `.product-template-title a:contains("${templateTitle}")`;
        // await page.waitForSelector(templateSelector, { timeout: 10000 });

        // // Hover over the template item
        // const templateItem = await page.$(templateSelector);
        // await templateItem.hover();

        // // Click on the "Add to store" button
        // const addToStoreButtonSelector = 'button[data-test="product-templates-item-add-to-store"]';
        // await page.waitForSelector(addToStoreButtonSelector, { timeout: 5000 });
        // await page.click(addToStoreButtonSelector);

    } catch (error) {
        console.error("An error occurred during the process:", error);
    } finally {
        // await browser.close(); // Ensure the browser closes in case of an error
    }
}

// API endpoint to handle the scraping request
app.post('/getData', async (req, res) => {
    const { email, password } = req.body; // Expecting email and password in the request body
    const templateTitle = "Hooded long-sleeve tee"; // This is the title you are looking for

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        await test(email, password, templateTitle); // Pass email and password to the test function
        res.status(200).send("Browser opened and actions performed.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
