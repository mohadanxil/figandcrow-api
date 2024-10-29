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
        slowMo: 10,
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

        // Navigate to the product templates section
        await page.waitForSelector('li.sidebar__item:has(a[aria-label="Stores"]) a', { timeout: 10000 });
        await page.click('li.sidebar__item:has(a[aria-label="Product templates"]) a');
        await page.waitForSelector('.product-template-items--grid .product-template-item', { timeout: 10000 });

        const templateItems = await page.$$('.product-template-item');
        function wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        for (const item of templateItems) {
            const linkHandle = await item.$('a.product-template-link');
            if (linkHandle) {
                const linkText = await page.evaluate(el => el.textContent.trim(), linkHandle);
                if (linkText === templateTitle) {
                    console.log(`Found matching template: ${linkText}`);
                    await linkHandle.click();
                    console.log(`Navigating to the page for ${linkText}`);
                    await page.waitForNavigation();

                    const addToStoreButton = await page.waitForSelector('button[data-test="product-templates-item-add-to-store"]', { visible: true });
                    await page.waitForFunction(button => !button.disabled, {}, addToStoreButton);

                    if (addToStoreButton) {
                        await addToStoreButton.evaluate(el => el.scrollIntoView());
                        await page.evaluate(button => button.click(), addToStoreButton);
                        console.log('Clicked on "Add to store" button');
                        await wait(4000);
                        try {
                            const buttons = await page.$$(`#fullscreen-modal-vue button`);
                            console.log(buttons,"buttons length");
                            
                            buttons.forEach(async(element) => {
                                const buttonText = await element.evaluate(el => el.textContent.trim());
                                if(buttonText==="Proceed to mockups"){
                                    console.log(buttonText,"buttonText 2");
                                    await element.click();
                                    console.log(element,"element");
                                    
                                }
                            });
                            try {

                                // Wait for the modal or section that contains the button to be visible
                                await page.waitForSelector('a.pf-btn.pf-btn-secondary.pf-btn-block--mobile', { visible: true });
                                // Select the button by its class
                                const chooseMockupsButton = await page.$('a.pf-btn.pf-btn-secondary.pf-btn-block--mobile');
                                
                                if (chooseMockupsButton) {
                                    // Click the button
                                    await chooseMockupsButton.click();
                                    console.log("Choose mockups button clicked.");
                                } else {
                                    console.error("Choose mockups button not found.");
                                }
                            } catch (err) {
                                console.error("Error finding or clicking the Choose mockups button: ", err);
                            }
                            try {
                                // Wait for the .slick-track container to load
                                await page.waitForSelector('.pf-d-block .slick-track', { visible: true });
                                
                                // await wait(4000);
                                // Select only .generator-mockup-preview elements inside the .slick-track container
                                const mockupDivs = await page.$$eval('.pf-d-block .slick-track .generator-mockup-preview', (divs) =>
                                    divs.map(outerDiv => {
                                        // Get the inner div with the background-image style
                                        const innerDiv = outerDiv.querySelector('div[style*="background-image"]');
                                        return {
                                            element: outerDiv,  // Keep reference to outer div if needed for clicking
                                            backgroundImage: innerDiv ? window.getComputedStyle(innerDiv).backgroundImage : null
                                        };
                                    })
                                );
                            
                                // Filter the div whose background-image contains 'back_base'
                                const targetDiv = mockupDivs.find(div => {
                                    console.log(div.backgroundImage,"btImage");
                                    return div.backgroundImage && div.backgroundImage.includes('flat_back_base')
                                    
                                });
                            
                                if (targetDiv) {
                                    // Click the outer div if the background image matches
                                    await targetDiv.element.click();
                                    console.log("Div with 'back_base' background image clicked.");
                                } else {
                                    console.error("Div with 'back_base' background image not found.");
                                }
                            } catch (err) {
                                console.error("Error selecting or clicking the div: ", err);
                            }
                            
                            
                            

                            // const targetButton = buttons.find(async (button) => {
                            //     const buttonText = await button.evaluate(el => el.textContent.trim());
                            //     console.log(buttonText,"buttonText");
                                
                            //     return buttonText === "Proceed to mockups";  // Replace "Proceed" with the actual button text
                            // });
                        
                            // if (targetButton) {
                            //     await page.screenshot({ path: 'modal-debug.png' });
                            //     console.log("Screenshot taken for debugging.");
                            //     await targetButton.click();
                            //     console.log("Proceed button clicked.");
                            // } else {
                            //     console.error("Proceed button not found.");
                            // }
                        } catch (err) {
                            console.error("Error finding or clicking the button: ", err);
                        }
                        

                        // await page.waitForNavigation();
                        // await page.waitForTimeout(1000)
                        // const proceedButton = await page.waitForSelector('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', { visible: true });

                        // async function waitForButtonAndClick(selector, maxRetries = 10, delay = 1000) {
                        //     let retries = 0;
                        //     let buttonEnabled = false;

                        //     while (retries < maxRetries && !buttonEnabled) {
                        //         try {
                        //             const button = await page.waitForSelector(selector, { visible: true });
                        //             const isDisabled = await page.evaluate(button => button.disabled, button);

                        //             if (!isDisabled) {
                        //                 await button.click();
                        //                 buttonEnabled = true;
                        //                 console.log('Successfully clicked the "Proceed to mockups" button.');
                        //             } else {
                        //                 console.log(`Button is disabled, retrying... (Attempt ${retries + 1})`);
                        //                 // await page.waitForTimeout(delay);
                        //                 retries++;
                        //             }
                        //         } catch (error) {
                        //             console.log('Error while checking button status:', error);
                        //         }
                        //     }

                        //     if (!buttonEnabled) {
                        //         console.log('Max retries reached. Button did not become enabled.');
                        //     }
                        // }

                        // await waitForButtonAndClick('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]', 20, 500);
                         // After clicking the "Proceed to mockups" button, add the following code
                        //  const modalSelector = await page.waitForSelector('#fullscreen-modal-vue', { visible: true });
                        // console.log(modalSelector,"modalSelector");
                        // const btn = modalSelector.$eval('button[data-test="proceed-btn-TMy5EYwDLbVl8Pq"]');
                        // console.log(btn,"btn");
                        // try {
                        //     // Wait for the modal to appear
                        //     await page.waitForSelector('#fullscreen-modal-vue', { visible: true });
                        
                        //     // Wait for any buttons within the modal to appear
                        //     await page.waitForSelector('#fullscreen-modal-vue button', { visible: true, timeout: 5000 });
                        
                        //     // Select all buttons inside the modal
                        //     const buttons = await page.$$(`#fullscreen-modal-vue button`);
                        //     console.log(buttons.length, "buttons found inside modal");
                        
                        //     if (buttons.length > 0) {
                        //         // Click the first button
                        //         await buttons[0].click();
                        //         console.log("First button clicked.");
                        //     } else {
                        //         console.error("No buttons found inside the modal.");
                        //     }
                        // } catch (err) {
                        //     console.error("Error finding or clicking the button: ", err);
                        // }     
                        try {
                            const buttons = await page.$$(`#fullscreen-modal-vue button`);
                            const targetButton = buttons.find(async (button) => {
                                const buttonText = await button.evaluate(el => el.textContent.trim());
                                return buttonText === "Proceed to mockups";  // Replace "Proceed" with the actual button text
                            });
                        
                            if (targetButton) {
                                await page.screenshot({ path: 'modal-debug.png' });
                                console.log("Screenshot taken for debugging.");

                                await targetButton.click();
                                console.log("Proceed button clicked.");
                            } else {
                                console.error("Proceed button not found.");
                            }
                        } catch (err) {
                            console.error("Error finding or clicking the button: ", err);
                        }
                                           
                        
                                           
                        
                        
                        // try {
                        //     // Wait for the "Choose mockups" button to appear
                        //     const chooseMockupsButton = await page.waitForSelector('a.pf-btn.pf-btn-secondary.pf-btn-block--mobile', { visible: true });
                            
                        //     // Scroll to the button and click it
                        //     await chooseMockupsButton.evaluate(el => el.scrollIntoView());
                        //     await page.evaluate(button => button.click(), chooseMockupsButton);
                        
                        //     console.log('Clicked on the "Choose mockups" button');
                        // } catch (error) {
                        //     console.error('Error while trying to click the "Choose mockups" button:', error);
                        // }
                        
                    } else {
                        console.log('"Add to store" button not found');
                    }
                    break;
                }
            }
        }
    } catch (error) {
        console.error("An error occurred during the process:", error);
    } finally {
        // You can close the browser if needed
        // await browser.close();
    }
}

// API endpoint to handle the scraping request
app.post('/getData', async (req, res) => {
    const { email, password } = req.body;
    const templateTitle = "Hooded long-sleeve tee";

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        await test(email, password, templateTitle);
        res.status(200).send("Browser opened and actions performed.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


