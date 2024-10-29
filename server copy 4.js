const { connect } = require("puppeteer-real-browser");
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Use CORS middleware
app.use(cors());
app.use(express.json());

async function test(email, password, templateTitle,title) {
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

        await wait(1000)
        await page.waitForSelector('li.sidebar__item:has(a[aria-label="Stores"]) a');
        await page.click('li.sidebar__item:has(a[aria-label="Stores"]) a');
        // await page.waitForSelector('div.pf-cards.my-stores', { visible: true });
        // await page.waitForNavigation({ waitUntil: 'networkidle0' });
        // Select all store items within the container
        // Wait for the stores section to become visible
        await wait(3000)
        await page.waitForSelector('.pf-cards.my-stores', { visible: true });
        await wait(1000)
        // Get all the store cards
        const storeCards = await page.$$('.pf-cards__item');

        // Loop through each store card
        for (const card of storeCards) {

            // Get the title of the store
            const titleHandle = await card.$('.store__title');
            if (titleHandle) {
                const storeTitle = await page.evaluate(el => el.textContent.trim(), titleHandle);
                
                // Check if the title matches the desired title
                if (storeTitle === "anxil's Store") {
                    // Now find and click the "View store" button in this card
                    const viewStoreButton = await card.$('button[data-test="btn-view-JFC2uxByMQbYE3g"]');
                    if (viewStoreButton) {
                        await viewStoreButton.click();
                        console.log(`Clicked "View store" for: ${storeTitle}`);
                        break; // Exit loop after clicking
                    } else {
                        console.log('View store button not found.');
                    }
                }
                else{
                    console.log("not title found");
                    
                }
            }
        }
        await page.waitForNavigation(); 
        await wait(3000)
        // Wait for the product table to load
        await page.waitForSelector('.sync-products-list-page-results', { visible: true });
        await wait(2000)
        // Get all the product rows
        const productRows = await page.$$('tbody.sync-products-list-page-results tr.sync-products-list-item');

        // Loop through each product row
        for (const row of productRows) {
            // Check for the product title if you need to target a specific product
            const productTitleHandle = await row.$('.product-name__actual-name');
            if (productTitleHandle) {
                const productTitle = await page.evaluate(el => el.textContent.trim(), productTitleHandle);
                console.log(productTitle,"product title",templateTitle);
                
                if(productTitle===templateTitle){
                    await page.evaluate(el => el.scrollIntoView(), productTitleHandle);
                    // await wait(1000);
                    // Log or check the title as needed (optional)
                    console.log(`Found product: ${productTitle}`);
    
                    // // Find the dropdown icon in this row and click it
                    // const dropdownIcon = await row.$('a[data-toggle="dropdown"]');
                    // if (dropdownIcon) {
                    //     await dropdownIcon.click();
                    //     console.log(`Clicked dropdown for product: ${productTitle}`);
                        
                    //     // Optional: Wait for the dropdown options to be visible if needed
                    //     await wait(500); // Adjust time as necessary
    
                    //     // Optionally, you can interact with dropdown options here
                    //     // For example, if you want to click the "Edit" option after clicking the dropdown
                    //     // const editOption = await row.$('a[data-test="edit-btn-6871IAAJRLkg89f"]');
                    //     // if (editOption) {
                    //     //     await editOption.click();
                    //     //     console.log(`Clicked Edit for product: ${productTitle}`);
                    //     // }
    
                    //     break; // Remove this if you want to interact with all products
                    // } 
                    await wait(1000);
                    // const dropdownButtonHandle = await row.$('a[data-test="dPfKn2n8wXKSCJw"]');
                    // if (dropdownButtonHandle) {
                    //     await dropdownButtonHandle.click();
                    //     console.log('Dropdown icon clicked');
                    //     // const saveTemplateButton = await row.$('.dropdown-menu a[data-test="save-as-template-btn-w5Z32Jp7FOgQW8Q"]');
                    //     // if (saveTemplateButton) {
                    //     //     await saveTemplateButton.click();
                    //     //     console.log('Template Save option clicked');
                    //     // }
                    //     // else{
                    //     //     console.log("Template button not found");
                    //     // }
                    //     await wait(2000);
    
                    // }
                    // else {
                    //     console.log('Dropdown icon not found for this product.');
                    // }
                    const checkbox = await row.$('td.checkbox-wrapper input[type="checkbox"]');
                    console.log(checkbox,"checkbox item");
                    
                    if (checkbox) {
                        // Click the checkbox (if needed)
                        await checkbox.click();
                        
                        console.log('Checkbox clicked.');
                    } else {
                        console.log('Checkbox not found in this row.');
                    }
                    let inputs = await row.$$(`input[type="checkbox"]`);
                    console.log(inputs,"inputs");
                    
                    inputs.forEach(async(element) => {
                        console.log(element,"elements ");
                        
                                // const buttonText = await element.evaluate(el => el.textContent.trim());
                                // if(buttonText==="Continue"){
                                //     console.log(buttonText,"buttonText 3");
                                //     try {
                                //         await element.click();
                                //         console.log(element,"element");
                                //     } catch (error) {
                                //         console.error("Error finding or clicking the button: ", error);
                                //     }
                                    
                                // }
                            });
                    // // Wait for the dropdown menu to appear
                    // await wait(1000);
                    // // Wait for the modal to be visible
                    // await page.waitForSelector('#create-product-templates-disclaimer-modal', { visible: true });
                    // await wait(1000)
                    // // Select the "Save as template" button
                    // const saveAsTemplateButton = await page.$('.modal-dialog.modal-md a.pf-btn.pf-btn-primary.pf-mr-12');
    
                    // // Click the "Save as template" button if it is found
                    // if (saveAsTemplateButton) {
                    //     await saveAsTemplateButton.click();
                    //     console.log('Clicked "Save as template" button.');
                    //     break;
                    // } else {
                    //     console.log('"Save as template" button not found.');
                    // }
                    break;
                }
                else{
                    console.log("not found");
                    
                }
            }
        }


        await wait(10000);
        // Navigate to the product templates section
        await page.waitForSelector('li.sidebar__item:has(a[aria-label="Product templates"]) a', { timeout: 10000 });
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
                            let buttons = await page.$$(`#fullscreen-modal-vue button`);
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
                                
                                // // await wait(4000);
                                // // Select only .generator-mockup-preview elements inside the .slick-track container
                                // const mockupDivs = await page.$$eval('.pf-d-block .slick-track .generator-mockup-preview', (divs) =>
                                //     divs.map(outerDiv => {
                                //         console.log(outerDiv,'divs');
                                        
                                //         // Get the inner div with the background-image style
                                //         const innerDiv = outerDiv.querySelector('div[style*="background-image"]');
                                //         return {
                                //             element: outerDiv,  // Keep reference to outer div if needed for clicking
                                //             backgroundImage: innerDiv ? window.getComputedStyle(innerDiv).backgroundImage : null
                                //         };
                                //     })
                                // );
                            
                                // Filter the div whose background-image contains 'back_base'
                                // const targetDiv = mockupDivs.find(div => {
                                //     console.log(div.backgroundImage,"btImage");
                                //     return div.backgroundImage && div.backgroundImage.includes('flat_back')
                                    
                                // });
                            
                                // if (targetDiv) {
                                //     // Click the outer div if the background image matches
                                //     await targetDiv.element.click();
                                //     console.log("Div with 'back_base' background image clicked.");
                                // } else {
                                //     console.error("Div with 'back_base' background image not found.");
                                // }
                            } catch (err) {
                                console.error("Error selecting or clicking the div: ", err);
                            }

                            await page.$eval('#is-png', radio => {
                                if (!radio.checked) {
                                    radio.click();
                                }
                            });
                            buttons = await page.$$(`#fullscreen-modal-vue button`);
                            console.log(buttons,"buttons length");
                            
                            buttons.forEach(async(element) => {
                                const buttonText = await element.evaluate(el => el.textContent.trim());
                                if(buttonText==="Continue"){
                                    console.log(buttonText,"buttonText 2");
                                    await element.click();
                                    console.log(element,"element");
                                    
                                }
                            });
                            await page.waitForSelector('#product-push-title-input', { visible: true }); // Wait until the input is available
                            await page.$eval('#product-push-title-input', input => {
                                console.log(input.value,"input value")
                                input.value = 'New Product Title';  // Set the new value
                                input.dispatchEvent(new Event('input', { bubbles: true }));  // Trigger the input event if necessary
                            });
                            buttons = await page.$$(`#fullscreen-modal-vue button`);
                            buttons.forEach(async(element) => {
                                const buttonText = await element.evaluate(el => el.textContent.trim());
                                if(buttonText==="Continue"){
                                    console.log(buttonText,"buttonText 3");
                                    try {
                                        await element.click();
                                        console.log(element,"element");
                                    } catch (error) {
                                        console.error("Error finding or clicking the button: ", error);
                                    }
                                    
                                }
                            });
                            
                            await page.waitForSelector('.product-push-variant-prices-edit-wrapper', { visible: true }); // Wait until the input is available
                            buttons = await page.$$(`#fullscreen-modal-vue button`);
                            buttons.forEach(async(element) => {
                                const buttonText = await element.evaluate(el => el.textContent.trim());
                                if(buttonText==="Save product"){
                                    console.log(buttonText,"buttonText 4");
                                    try {
                                        await element.click();
                                        // console.log(element,"element");
                                    } catch (error) {
                                        console.error("Error finding or clicking the button: ", error);
                                    }
                                    
                                }
                            });

                            await page.evaluate(() => {
                                const dropdownButton = document.querySelector('a[data-test="dPfKn2n8wXKSCJw"]');
                                dropdownButton.scrollIntoView(); // Scroll into view
                            });
                            console.log('clicking dropdown');
                            
                            // Wait for the dropdown button to be visible and click it
                            await page.waitForSelector('a[data-test="dPfKn2n8wXKSCJw"]',{visible:true});
                            await page.click('a[data-test="dPfKn2n8wXKSCJw"]');
                            console.log('clicked dropdown');
                            
                            console.log('clicking item');
                            // Wait for the dropdown menu to appear and click the "Delete" option
                            // await page.waitForSelector('a[data-test="dPfKn2n8wXKSCJw"]', { visible: true });
                            // await page.click('a[data-test="product-template-item-delete"]');
                            // console.log('clicked item');
                            // await page.waitForSelector('.pf-ui-body.pf-breadcrumbs', { visible: true });

                            // Click on the sidebar link to navigate to the "Product Templates" page
                            await page.screenshot({ path: 'modal-debug1.png' });
                            await wait(3000)
                            await page.screenshot({ path: 'modal-debug2.png' });
                            await page.waitForSelector('li.sidebar__item:has(a[aria-label="Product templates"]) a');
                            await page.click('li.sidebar__item:has(a[aria-label="Product templates"]) a');
                            await page.screenshot({ path: 'modal-debug3.png' });
                            console.log('naviagetee');
                            
                            await wait(1500)
                            await page.waitForSelector('.product-template-items--grid .product-template-item', { timeout: 10000 });

                            const templateItems = await page.$$('.product-template-item');
                            for (const item of templateItems) {
                                const linkHandle = await item.$('a.product-template-link');
                                if (linkHandle) {
                                    const linkText = await page.evaluate(el => el.textContent.trim(), linkHandle);
                                    if (linkText === templateTitle) {
                                        // await item.$('a.product-template-link');
                                        // await page.hover('.product-template-image.pf-rounded.pf-position-relative.pf-cursor-pointer');
                                        
                                        console.log(`Found matching template: ${linkText}`);
                                        const templateImageHandle = await item.$('.product-template-image.pf-rounded.pf-position-relative.pf-cursor-pointer');
                                        if (templateImageHandle) {
                                            await templateImageHandle.hover();
                                            await wait(500);
                                            // Wait for the checkbox in the overlay to appear
                                            // await item.waitForSelector('input#QQ6rqO', { visible: true });

                                            // Click the checkbox to select the template
                                            // await item.click('input#QQ6rqO');
                                        }
                                        await wait(1000);
                                        const dropdownButtonHandle = await item.$('a[data-test="dPfKn2n8wXKSCJw"]');
                                        if (dropdownButtonHandle) {
                                            await dropdownButtonHandle.click();
                                            console.log('Dropdown icon clicked');
                                        }
                                        // Wait for the dropdown menu to appear
                                        await wait(1000);
                                        await item.waitForSelector('ul.dropdown-menu', { visible: true });

                                        // Click on the "Delete" option in the dropdown
                                        const deleteButtonHandle = await item.$('a[data-test="product-template-item-delete"]');
                                        if (deleteButtonHandle) {
                                            await deleteButtonHandle.click();
                                            console.log('Delete option clicked');
                                        }
                                        await wait(2000);
                                        // Wait for the delete confirmation popup to appear
                                        await page.waitForSelector('#product-templates-deleting-dialog', { visible: true });

                                        // Wait for the "Yes, delete" button to be visible within the popup
                                        await page.waitForSelector('button.pf-btn-primary.pf-btn-block--mobile', { visible: true });

                                        // Click the "Yes, delete" button
                                        await page.click('button.pf-btn-primary.pf-btn-block--mobile');

                                        console.log('Clicked on Yes, delete button');
                                        // Optionally, break out of the loop if you only want to act on the first match
                                        break;
                                    }
                                }
                            }

                            await wait(2000)
                            await page.waitForSelector('li.sidebar__item:has(a[aria-label="Stores"]) a');
                            await page.click('li.sidebar__item:has(a[aria-label="Stores"]) a');
                            // await page.waitForSelector('div.pf-cards.my-stores', { visible: true });
                            // await page.waitForNavigation({ waitUntil: 'networkidle0' });
                            // Select all store items within the container
                            // Wait for the stores section to become visible
                            await wait(3000)
                            await page.waitForSelector('.pf-cards.my-stores', { visible: true });
                            await wait(1000)
                            // Get all the store cards
                            const storeCards = await page.$$('.pf-cards__item');
                    
                            // Loop through each store card
                            for (const card of storeCards) {
                    
                                // Get the title of the store
                                const titleHandle = await card.$('.store__title');
                                if (titleHandle) {
                                    const storeTitle = await page.evaluate(el => el.textContent.trim(), titleHandle);
                                    
                                    // Check if the title matches the desired title
                                    if (storeTitle === "anxil's Store") {
                                        // Now find and click the "View store" button in this card
                                        const viewStoreButton = await card.$('button[data-test="btn-view-JFC2uxByMQbYE3g"]');
                                        if (viewStoreButton) {
                                            await viewStoreButton.click();
                                            console.log(`Clicked "View store" for: ${storeTitle}`);
                                            break; // Exit loop after clicking
                                        } else {
                                            console.log('View store button not found.');
                                        }
                                    }
                                    else{
                                        console.log("not title found");
                                        
                                    }
                                }
                            }
                            await page.waitForNavigation(); 
                            await wait(3000)
                            // Wait for the product table to load
                            await page.waitForSelector('.sync-products-list-page-results', { visible: true });
                            await wait(2000)
                            // Get all the product rows
                            const productRows = await page.$$('tbody.sync-products-list-page-results tr.sync-products-list-item');
                    
                            // Loop through each product row
                            for (const row of productRows) {
                                // Check for the product title if you need to target a specific product
                                const productTitleHandle = await row.$('.product-name__actual-name');
                                if (productTitleHandle) {
                                    const productTitle = await page.evaluate(el => el.textContent.trim(), productTitleHandle);
                                    if(productTitle===templateTitle){
                                        // Log or check the title as needed (optional)
                                        console.log(`Found product: ${productTitle}`);
                        
                                        // // Find the dropdown icon in this row and click it
                                        // const dropdownIcon = await row.$('a[data-toggle="dropdown"]');
                                        // if (dropdownIcon) {
                                        //     await dropdownIcon.click();
                                        //     console.log(`Clicked dropdown for product: ${productTitle}`);
                                            
                                        //     // Optional: Wait for the dropdown options to be visible if needed
                                        //     await wait(500); // Adjust time as necessary
                        
                                        //     // Optionally, you can interact with dropdown options here
                                        //     // For example, if you want to click the "Edit" option after clicking the dropdown
                                        //     // const editOption = await row.$('a[data-test="edit-btn-6871IAAJRLkg89f"]');
                                        //     // if (editOption) {
                                        //     //     await editOption.click();
                                        //     //     console.log(`Clicked Edit for product: ${productTitle}`);
                                        //     // }
                        
                                        //     break; // Remove this if you want to interact with all products
                                        // } 
                                        await wait(1000);
                                        const dropdownButtonHandle = await row.$('a[data-test="dPfKn2n8wXKSCJw"]');
                                        if (dropdownButtonHandle) {
                                            await dropdownButtonHandle.click();
                                            console.log('Dropdown icon clicked');
                                            const saveTemplateButton = await row.$('a[data-test="delete-btn-o3SzlMUEjy33a22"]');
                                            if (saveTemplateButton) {
                                                await saveTemplateButton.click();
                                                console.log('Template Save option clicked');
                                            }
                                            await wait(2000);
                        
                                        }
                                        else {
                                            console.log('Dropdown icon not found for this product.');
                                        }
                                        // Wait for the dropdown menu to appear
                                        await wait(1000);
                                        // Wait for the modal to be visible
                                        await page.waitForSelector('.modal-dialog.modal-md', { visible: true });
                                        await wait(1000)
                                        // Wait for the modal to be visible
                                        await page.waitForSelector('.modal-dialog.modal-md', { visible: true });

                                        // Select the checkbox using its data-test attribute
                                        const deleteCheckbox = await page.$('.modal-dialog.modal-md input[data-test="checkbox-Dxeytk3HMxjSJIo"]');

                                        // Click the checkbox if it is found
                                        if (deleteCheckbox) {
                                            await deleteCheckbox.click();
                                            console.log('Checkbox clicked.');
                                        } else {
                                            console.log('Checkbox not found.');
                                        }
                                        await wait(3000);
                                        // Wait for the "Delete" button to be visible
                                        await page.waitForSelector('.modal-dialog.modal-md a.pf-btn.pf-btn-primary.pf-mr-12', { visible: true });

                                        // Select the "Delete" button using its class
                                        const deleteButton = await page.$('.modal-dialog.modal-md a.pf-btn.pf-btn-primary.pf-mr-12');

                                        // Click the "Delete" button if it is found
                                        if (deleteButton) {
                                            await deleteButton.click();
                                            console.log('Delete button clicked.');
                                        } else {
                                            console.log('Delete button not found.');
                                        }

                                        // Select the "Save as template" button
                                        // const saveAsTemplateButton = await page.$('a.pf-btn.pf-btn-primary.pf-mr-12');
                        
                                        // // Click the "Save as template" button if it is found
                                        // if (saveAsTemplateButton) {
                                        //     await saveAsTemplateButton.click();
                                        //     console.log('Clicked "Save as template" button.');
                                        //     break;
                                        // } else {
                                        //     console.log('"Save as template" button not found.');
                                        // }
                                    }
                                }
                            }
                    
                            // await page.waitForSelector('a[href="/dashboard/product-templates"]', { visible: true });
                            // await page.click('a[href="/dashboard/product-templates"]');

                            // // Wait for navigation to complete and the new page to load
                            // await page.waitForNavigation({ waitUntil: 'networkidle0' });

                            // // Once on the new page, hover over the product template image div to reveal the overlay
                            // await page.hover('.product-template-image.pf-rounded.pf-position-relative.pf-cursor-pointer');

                            // // Wait for the checkbox within the overlay to become visible
                            // await page.waitForSelector('input#QQ6rqO', { visible: true });

                            // // Click the checkbox to select the template
                            // await page.click('input#QQ6rqO');

                            // await page.waitForSelector('li.sidebar__item:has(a[aria-label="Stores"]) a', { timeout: 10000 });
                            // await page.click('li.sidebar__item:has(a[aria-label="Product templates"]) a');
                            // await page.waitForSelector('.product-template-items--grid .product-template-item', { timeout: 10000 });
                            // await page.waitForSelector('.product-template-image.pf-rounded.pf-position-relative.pf-cursor-pointer', { visible: true })
                            // // Hover over the product template image div to reveal the overlay
                            // await page.hover('.product-template-image.pf-rounded.pf-position-relative.pf-cursor-pointer');

                            // // Wait for the checkbox within the overlay to become visible
                            // await page.waitForSelector('input#QQ6rqO', { visible: true });

                            // // Click the checkbox to select the template
                            // await page.click('input#QQ6rqO');



                            // await page.evaluate(() => {
                            //     const dropdownButton = document.querySelector('.pf-ui-body.pf-breadcrumbs');
                            //     dropdownButton.scrollIntoView(); // Scroll into view
                            // });
                            // await page.waitForSelector('a[data-test="dPfKn2n8wXKSCJw"]', { visible: true });
                            // await page.click('a[data-test="dPfKn2n8wXKSCJw"]');
                            // await page.waitForSelector('a[data-test="product-template-item-delete"]', { visible: true });
                            // await page.click('a[data-test="product-template-item-delete"]');
                            // await page.click('.pf-ui-body.pf-breadcrumbs');
                            // console.log('clicked item');
                            
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
                        // try {
                        //     const buttons = await page.$$(`#fullscreen-modal-vue button`);
                        //     const targetButton = buttons.find(async (button) => {
                        //         const buttonText = await button.evaluate(el => el.textContent.trim());
                        //         return buttonText === "Proceed to mockups";  // Replace "Proceed" with the actual button text
                        //     });
                        
                        //     if (targetButton) {
                        //         await page.screenshot({ path: 'modal-debug.png' });
                        //         console.log("Screenshot taken for debugging.");

                        //         await targetButton.click();
                        //         console.log("Proceed button clicked.");
                        //     } else {
                        //         console.error("Proceed button not found.");
                        //     }
                        // } catch (err) {
                        //     console.error("Error finding or clicking the button: ", err);
                        // }
                                           
                        
                                           
                        
                        
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
    const templateTitle = "Hooded long-sleeve tee copy";
    const title = 'Test Product Hooded long-sleeve tee'
    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        await test(email, password, templateTitle,title);
        res.status(200).send("Browser opened and actions performed.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
