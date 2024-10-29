const { connect } = require("puppeteer-real-browser");
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const SELECTORS = {
    LOGIN: {
        EMAIL: '#login-email',
        PASSWORD: '#login-password',
        SUBMIT: 'input[type="submit"].pf-btn',
        COOKIE_ACCEPT: '[data-test="allow-all-cHLDkrEfrVoYQEQ"]'
    },
    NAVIGATION: {
        STORES: 'li.sidebar__item:has(a[aria-label="Stores"]) a',
        PRODUCT_TEMPLATES: 'li.sidebar__item:has(a[aria-label="Product templates"]) a'
    },
    STORE: {
        CONTAINER: '.pf-cards.my-stores',
        CARD: '.pf-cards__item',
        TITLE: '.store__title',
        VIEW_BUTTON: 'button[data-test="btn-view-JFC2uxByMQbYE3g"]'
    },
    PRODUCT: {
        LIST: '.sync-products-list-page-results',
        ROW: 'tr.sync-products-list-item',
        TITLE: '.product-name__actual-name',
        CHECKBOX: 'td.checkbox-wrapper input[type="checkbox"]',
        DROPDOWN: 'a[data-test="dPfKn2n8wXKSCJw"]',
        DELETE_OPTION: 'a[data-test="delete-btn-o3SzlMUEjy33a22"]',
        HEADER: '.sync-products__header.sync-products-list-header'
    },
    TEMPLATE: {
        GRID: '.product-template-items--grid',
        GRID_ITEM: '.product-template-items--grid .product-template-item',
        LINK: 'a.product-template-link',
        SIDEBAR_LINK:'li.sidebar__item:has(a[aria-label="Product templates"]) a',
        ADD_TO_STORE: 'button[data-test="product-templates-item-add-to-store"]',
        IMAGE: '.product-template-image.pf-rounded.pf-position-relative.pf-cursor-pointer',
        DELETE_BUTTON: 'a[data-test="product-template-item-delete"]'
    },
    MODAL: {
        CONTAINER: '#fullscreen-modal-vue',
        DELETE_DIALOG: '#product-templates-deleting-dialog',
        DELETE_CHECKBOX: '.modal-dialog.modal-md input[data-test="checkbox-Dxeytk3HMxjSJIo"]',
        CONFIRM_DELETE: '.modal-dialog.modal-md a.pf-btn.pf-btn-primary.pf-mr-12'
    }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function initializeBrowser() {
    const { browser, page } = await connect({
        headless: false,
        slowMo: 10,
        args: [],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
        plugins: [require('puppeteer-extra-plugin-click-and-wait')()]
    });

    await page.setViewport({ width: 1080, height: 690 });
    return { browser, page };
}

async function login(page, email, password) {
    await page.goto('https://www.printful.com/auth/login');
    await page.waitForSelector(SELECTORS.LOGIN.COOKIE_ACCEPT, { timeout: 10000 });
    await page.click(SELECTORS.LOGIN.COOKIE_ACCEPT);

    await page.waitForSelector(SELECTORS.LOGIN.EMAIL, { timeout: 10000 });
    await page.type(SELECTORS.LOGIN.EMAIL, email);
    await page.type(SELECTORS.LOGIN.PASSWORD, password);
    await page.click(SELECTORS.LOGIN.SUBMIT);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

async function navigateToStore(page, storeName) {
    await page.waitForSelector(SELECTORS.NAVIGATION.STORES);
    await page.click(SELECTORS.NAVIGATION.STORES);
    await wait(3000);
    
    await page.waitForSelector(SELECTORS.STORE.CONTAINER, { visible: true });
    await wait(1000);

    const storeCards = await page.$$(SELECTORS.STORE.CARD);
    for (const card of storeCards) {
        const titleHandle = await card.$(SELECTORS.STORE.TITLE);
        if (titleHandle) {
            const storeTitle = await page.evaluate(el => el.textContent.trim(), titleHandle);
            if (storeTitle === storeName) {
                const viewStoreButton = await card.$(SELECTORS.STORE.VIEW_BUTTON);
                if (viewStoreButton) {
                    await viewStoreButton.click();
                    return true;
                }
            }
        }
    }
    return false;
}
async function navigateToTemplate(page) {
    try {
        // Navigate to templates page
        await page.waitForSelector(SELECTORS.TEMPLATE.SIDEBAR_LINK, { visible: true });
        await page.click(SELECTORS.TEMPLATE.SIDEBAR_LINK);
        console.log('Clicked on Product templates menu item');
        await wait(3000);

        // Wait for template grid to be visible
        await page.waitForSelector(SELECTORS.TEMPLATE.GRID, { visible: true });
        await wait(1000);
        console.log('Template grid is visible');

        // Get all template items
        const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
        console.log(`Found ${templateItems.length} templates`);
        return true;;
    } catch (error) {
        console.error('Error in navigateToTemplate:', error);
        throw error;
    }
}
async function selectProduct(page, templateTitle) {
    try {
        // Wait for the product list to be visible
        await page.waitForSelector(SELECTORS.PRODUCT.LIST, { visible: true });
        await wait(2000);
        
        const productRows = await page.$$(SELECTORS.PRODUCT.ROW);
        console.log(`Found ${productRows.length} product rows`);
        const ProductTableHeader = await page.$(SELECTORS.PRODUCT.HEADER);

        await page.evaluate(el => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, ProductTableHeader);
        await wait(2000);

        for (const row of productRows) {
            try {
                const titleHandle = await row.$(SELECTORS.PRODUCT.TITLE);
                if (!titleHandle) {
                    console.log('Title handle not found for row');
                    continue;
                }

                const productTitle = await page.evaluate(el => el.textContent.trim(), titleHandle);
                console.log(productTitle,"product Title ")
                if (productTitle !== templateTitle) {
                    console.log(`Title mismatch: ${productTitle}`);
                    continue;
                }

                // Scroll the row into view and wait for any animations to complete
                await page.evaluate(el => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, row);
                await wait(1000); // Wait for scroll to complete

                // Ensure checkbox is visible and clickable
                const checkbox = await row.$(SELECTORS.PRODUCT.CHECKBOX);
                if (!checkbox) {
                    console.log('Checkbox not found for matching product');
                    continue;
                }

                // Check if checkbox is visible and enabled
                const isClickable = await page.evaluate(el => {
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    return style.display !== 'none' && 
                           style.visibility !== 'hidden' && 
                           style.opacity !== '0' &&
                           rect.width > 0 &&
                           rect.height > 0 &&
                           !el.disabled;
                }, checkbox);

                if (!isClickable) {
                    console.log('Checkbox is not clickable');
                    continue;
                }

                // Try multiple click methods
                try {
                    // Method 1: Direct click
                    await checkbox.click({ delay: 100 });
                } catch (clickError) {
                    console.log('Direct click failed, trying alternative methods');
                    try {
                        // Method 2: Click using page.evaluate
                        await page.evaluate(el => el.click(), checkbox);
                    } catch (evalClickError) {
                        // Method 3: JavaScript click with position
                        await page.evaluate(el => {
                            const rect = el.getBoundingClientRect();
                            const event = new MouseEvent('click', {
                                view: window,
                                bubbles: true,
                                cancelable: true,
                                clientX: rect.left + rect.width / 2,
                                clientY: rect.top + rect.height / 2
                            });
                            el.dispatchEvent(event);
                        }, checkbox);
                    }
                }

                // Verify if checkbox was actually selected
                const isChecked = await page.evaluate(el => el.checked, checkbox);
                if (!isChecked) {
                    console.log('Checkbox click did not register, retrying...');
                    await wait(500);
                    await checkbox.click({ delay: 100 });
                    
                    // Final check
                    const finalCheck = await page.evaluate(el => el.checked, checkbox);
                    if (!finalCheck) {
                        console.log('Failed to select checkbox after retry');
                        continue;
                    }
                }

                console.log(`Successfully selected product: ${templateTitle}`);
                try {
                    // Wait for the save button to be visible
                    await page.waitForSelector('#create-product-templates', { visible: true });
                    
                    // Scroll the button into view if needed
                    await page.evaluate(() => {
                        const button = document.querySelector('#create-product-templates');
                        if (button) {
                            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                    
                    await wait(1000); // Wait for any animations

                    // Try clicking the button
                    try {
                        // First attempt: direct click
                        await page.click('#create-product-templates');
                    } catch (buttonClickError) {
                        console.log('Direct button click failed, trying alternative method');
                        // Second attempt: evaluate click
                        await page.evaluate(() => {
                            const button = document.querySelector('#create-product-templates');
                            if (button) button.click();
                        });
                    }

                    console.log('Successfully clicked Save as templates button');
                    // return true;
                     // Wait for modal to appear and be visible
                await page.waitForSelector('#create-product-templates-disclaimer-modal', {
                    visible: true,
                    timeout: 5000
                });
                console.log('Modal is visible');

                // Wait a moment for modal animation to complete
                await wait(1000);

                // Click the "Save as template" button in the modal
                const modalSaveButtonSelector = '.modal-footer .pf-btn-primary';
                await page.waitForSelector(modalSaveButtonSelector, { visible: true });

                try {
                    // First attempt: direct click
                    await page.click(modalSaveButtonSelector);
                } catch (modalButtonClickError) {
                    console.log('Direct modal button click failed, trying alternative method');
                    // Second attempt: evaluate click
                    await page.evaluate(() => {
                        const button = document.querySelector('.modal-footer .pf-btn-primary');
                        if (button) button.click();
                    });
                }

                console.log('Successfully clicked Save as template button in modal');
                return true;
                } catch (buttonError) {
                    console.error('Error clicking Save as templates button:', buttonError);
                    throw buttonError;
                }
            } catch (rowError) {
                console.error('Error processing row:', rowError);
                continue;
            }
        }

        console.log(`Product "${templateTitle}" not found in list`);
        return false;
    } catch (error) {
        console.error('Error in selectProduct:', error);
        throw error;
    }
}

async function deleteProduct(page, row) {
    const dropdownButton = await row.$(SELECTORS.PRODUCT.DROPDOWN);
    if (dropdownButton) {
        await dropdownButton.click();
        await wait(1000);

        const deleteButton = await row.$(SELECTORS.PRODUCT.DELETE_OPTION);
        if (deleteButton) {
            await deleteButton.click();
            await wait(2000);

            await page.waitForSelector(SELECTORS.MODAL.DELETE_DIALOG, { visible: true });
            const checkbox = await page.$(SELECTORS.MODAL.DELETE_CHECKBOX);
            if (checkbox) {
                await checkbox.click();
                await wait(1000);
                
                const confirmButton = await page.$(SELECTORS.MODAL.CONFIRM_DELETE);
                if (confirmButton) {
                    await confirmButton.click();
                    return true;
                }
            }
        }
    }
    return false;
}

async function processModalButtons(page, buttonText) {
    try {
        console.log(`Looking for modal button with text: "${buttonText}"`);
        
        // Wait for modal to be fully visible
        await page.waitForSelector(SELECTORS.MODAL.CONTAINER, {
            visible: true,
            timeout: 5000
        });
        await wait(1000); // Wait for modal animation

        // Define button selectors specific to your modal structure
        const buttonSelectors = [
            // Dynamic sticky footer buttons
            '.dynamic-sticky-footer .pf-btn',
            '.dynamic-sticky-footer .footer-double-button .pf-btn-primary',
            '.dynamic-sticky-footer .pf-btn-secondary',
            // Designer footer buttons
            '.designer-footer-buttons .pf-btn',
            '.designer-footer-buttons button',
            // Back button
            '.footer-back-btn',
            // Proceed button
            'button[data-test*="proceed-btn"]',
            // Generic button selectors within the modal
            `${SELECTORS.MODAL.CONTAINER} button`,
            `${SELECTORS.MODAL.CONTAINER} .pf-btn`,
            // XPath for exact text match
            `//div[contains(@class, "dynamic-sticky-footer")]//button[contains(normalize-space(), "${buttonText}")]`,
            `//div[contains(@class, "designer-footer-buttons")]//button[contains(normalize-space(), "${buttonText}")]`
        ];

        for (const selector of buttonSelectors) {
            try {
                console.log(`Trying selector: ${selector}`);
                
                // Handle XPath selectors
                const elements = selector.startsWith('//') 
                    ? await page.$x(selector)
                    : await page.$$(selector);
                
                for (const element of elements) {
                    try {
                        // Get text content based on selector type
                        const elementText = selector.startsWith('//')
                            ? await page.evaluate(el => el.textContent.trim(), element)
                            : await element.evaluate(el => {
                                // Check for nested text content
                                const textContent = el.textContent.trim();
                                // Handle cases where text might be in nested elements
                                return textContent.replace(/\s+/g, ' ').trim();
                            });
                        
                        console.log(`Found button with text: "${elementText}"`);
                        
                        if (elementText.includes(buttonText)) {
                            console.log(`Found matching button: "${buttonText}"`);
                            
                            // Check if button is visible and clickable
                            const isVisible = await page.evaluate(el => {
                                const rect = el.getBoundingClientRect();
                                const style = window.getComputedStyle(el);
                                return rect.width > 0 && 
                                       rect.height > 0 && 
                                       style.visibility !== 'hidden' && 
                                       style.display !== 'none' &&
                                       !el.disabled;
                            }, element);

                            if (!isVisible) {
                                console.log('Button is not visible or clickable, continuing search...');
                                continue;
                            }

                            // Scroll into view if needed
                            await page.evaluate(el => {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, element);
                            await wait(500);

                            // Try multiple click methods
                            try {
                                // Method 1: Direct click with wait
                                await element.click({ delay: 100 });
                                console.log('Button clicked successfully (Method 1)');
                                return true;
                            } catch (clickError1) {
                                try {
                                    // Method 2: Click using page.evaluate
                                    await page.evaluate(el => {
                                        el.click();
                                    }, element);
                                    console.log('Button clicked successfully (Method 2)');
                                    return true;
                                } catch (clickError2) {
                                    try {
                                        // Method 3: Click using JavaScript event
                                        await page.evaluate(el => {
                                            const clickEvent = new MouseEvent('click', {
                                                view: window,
                                                bubbles: true,
                                                cancelable: true,
                                            });
                                            el.dispatchEvent(clickEvent);
                                        }, element);
                                        console.log('Button clicked successfully (Method 3)');
                                        return true;
                                    } catch (clickError3) {
                                        // Method 4: Try clicking by position
                                        const box = await element.boundingBox();
                                        if (box) {
                                            await page.mouse.click(
                                                box.x + box.width / 2,
                                                box.y + box.height / 2
                                            );
                                            console.log('Button clicked successfully (Method 4)');
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    } catch (elementError) {
                        console.log('Error processing element:', elementError);
                        continue;
                    }
                }
            } catch (selectorError) {
                console.log('Error with selector:', selectorError);
                continue;
            }
        }
        
        console.log(`Button with text "${buttonText}" not found in modal`);
        return false;
    } catch (error) {
        console.error('Error in processModalButtons:', error);
        throw error;
    }
}
async function handleModalButton(page, buttonType) {
    const buttonMap = {
        'proceed': 'Proceed to mockups',
        'back': 'Back',
        'done': 'Done',
        'save': 'Save as template',
        'continue': 'Continue'
    };

    const buttonText = buttonMap[buttonType.toLowerCase()];
    if (!buttonText) {
        throw new Error(`Unknown button type: ${buttonType}`);
    }

    return await processModalButtons(page, buttonText);
}
async function handleTemplateActions(page, templateTitle) {
    await page.waitForSelector(SELECTORS.TEMPLATE.GRID_ITEM, { timeout: 10000 });
    const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);

    for (const item of templateItems) {
        const linkHandle = await item.$(SELECTORS.TEMPLATE.LINK);
        if (linkHandle) {
            const linkText = await page.evaluate(el => el.textContent.trim(), linkHandle);
            if (linkText === templateTitle) {
                await linkHandle.click();
                await page.waitForNavigation();
                await wait(2000);
                const addToStoreButton = await page.waitForSelector(SELECTORS.TEMPLATE.ADD_TO_STORE, { visible: true });
                await page.waitForFunction(button => !button.disabled, {}, addToStoreButton);
                await addToStoreButton.click();
                await wait(2000);
                await handleModalButton(page, "proceed");
                await wait(2000);
                await handleModalButton(page, "continue");
                
                // Additional template processing steps...
                return true;
            }
        }
    }
    return false;
}

async function test(email, password, templateTitle, title) {
    const { browser, page } = await initializeBrowser();
    
    try {
        await login(page, email, password);
        await navigateToStore(page, "anxil's Store");
        await wait(2000);
        await selectProduct(page, templateTitle);
        await wait(2000);
        await navigateToTemplate(page);
        await wait(1000);
        await handleTemplateActions(page, templateTitle);
        // Additional workflow steps...
    } catch (error) {
        console.error("An error occurred during the process:", error);
        throw error;
    }
}

app.post('/getData', async (req, res) => {
    const { email, password } = req.body;
    const templateTitle = "Hooded long-sleeve tee copy";
    const title = 'Test Product Hooded long-sleeve tee';

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        await test(email, password, templateTitle, title);
        res.status(200).send("Browser opened and actions performed.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});