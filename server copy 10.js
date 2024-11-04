const { connect } = require("puppeteer-real-browser");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const SELECTORS = {
  LOGIN: {
    EMAIL: "#login-email",
    PASSWORD: "#login-password",
    SUBMIT: 'input[type="submit"].pf-btn',
    COOKIE_ACCEPT: '[data-test="allow-all-cHLDkrEfrVoYQEQ"]',
  },
  NAVIGATION: {
    STORES: 'li.sidebar__item:has(a[aria-label="Stores"]) a',
    CATALOG: 'li.sidebar__item:has(a[aria-label="Product catalog"]) a',
    PRODUCT_TEMPLATES:
      'li.sidebar__item:has(a[aria-label="Product templates"]) a',
  },
  STORE: {
    CONTAINER: ".pf-cards.my-stores",
    CARD: ".pf-cards__item",
    TITLE: ".store__title",
    VIEW_BUTTON: 'button[data-test="btn-view-JFC2uxByMQbYE3g"]',
  },
  PRODUCT: {
    LIST: ".sync-products-list-page-results",
    ROW: "tr.sync-products-list-item",
    TITLE: ".product-name__actual-name",
    CHECKBOX: 'td.checkbox-wrapper input[type="checkbox"]',
    DELETE_CHECKBOX: '#modal-4 a[data-test="checkbox-Dxeytk3HMxjSJIo"]',
    DROPDOWN: 'a[data-test="dPfKn2n8wXKSCJw"]',
    DELETE_OPTION: 'a[data-test="delete-btn-o3SzlMUEjy33a22"]',
    HEADER: ".sync-products__header.sync-products-list-header",
  },
  TEMPLATE: {
    GRID: ".product-template-items--grid",
    GRID_ITEM: ".product-template-items--grid .product-template-item",
    LINK: "a.product-template-link",
    SIDEBAR_LINK: 'li.sidebar__item:has(a[aria-label="Product templates"]) a',
    ADD_TO_STORE: 'button[data-test="product-templates-item-add-to-store"]',
    IMAGE:
      ".product-template-image.pf-rounded.pf-position-relative.pf-cursor-pointer",
    DELETE_BUTTON: 'a[data-test="product-template-item-delete"]',
  },
  MODAL: {
    CONTAINER: "#fullscreen-modal-vue",
    DELETE_DIALOG: "#product-templates-deleting-dialog",
    DELETE_CHECKBOX:
      '.modal-dialog.modal-md input[data-test="checkbox-Dxeytk3HMxjSJIo"]',
    CONFIRM_DELETE: ".modal-dialog.modal-md a.pf-btn.pf-btn-primary.pf-mr-12",
    STICKY_FOOTER: ".dynamic-sticky-footer",
    FOOTER_BUTTONS: ".designer-footer-buttons",
    PROCEED_BUTTON: 'button[data-test*="proceed-btn"]',
    BACK_BUTTON: ".footer-back-btn",
    DONE_BUTTON: ".pf-btn-secondary",
  },
  MOCKUP: {
    CHOOSE_MOCKUPS: 'button:contains("Choose mockups")',
    MOCKUP_GRID: ".mockup-generator__variants-grid",
    MOCKUP_ITEM: ".mockup-variant-item",
    MOCKUP_CHECKBOX: 'input[type="checkbox"]',
    MOCKUP_CONTINUE: 'button[data-test="proceed-btn-mockups"]',
    LOADING_INDICATOR: ".loading-indicator",
    VARIANT_TITLE: ".variant-title",
    PREVIEW_CONTAINER: ".generator-mockup-preview.pf-mx-auto",
    SLIDE_CONTAINER: ".slide-container",
    MOCKUP_STYLE: ".mockup-style.mockup-slide",
    BACKGROUND_DIV: 'div[style*="background-image"]',
    ACTIVE_STYLE: "active-style",
  },
  TEMPLATE_VIEW: {
    MODAL: ".modal-dialog",
    MODAL_FOOTER: ".modal-footer ",
    CONTAINER: ".product-template-view.pf-mt-24.pf-mb-40",
    DROPDOWN_TOGGLE: 'a[data-test="dPfKn2n8wXKSCJw"]',
    DELETE_BUTTON: 'a[data-test="product-template-item-delete"]',
  },
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function browserSet(page) {
  // Get the CDP session
  const client = await page.target().createCDPSession();
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    mobile: true,
  });

  // Toggle mobile emulation using Chrome DevTools keyboard shortcut
  await page.evaluate(() => {
    // Simulate pressing Ctrl+Shift+M (Cmd+Shift+M on Mac)
    const event = new KeyboardEvent("keydown", {
      key: "M",
      code: "KeyM",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  });

  console.log("DevTools opened in responsive mode");

  // Keep the script running
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // Disable device emulation
  await client.send("Emulation.clearDeviceMetricsOverride");

  // Toggle device toolbar off
  await page.evaluate(() => {
    const event = new KeyboardEvent("keydown", {
      key: "M",
      code: "KeyM",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  });

  console.log("Responsive mode disabled");

  // Keep the browser open for a moment to see the result
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
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
    defaultViewport: null,
    plugins: [require("puppeteer-extra-plugin-click-and-wait")()],
    launchOptions: {
      headless: false,
      args: ["--auto-open-devtools-for-tabs", "--window-size=1400,900"],
    },
  });

  // await page.setViewport({ width: 1080, height: 690 });
  await browserSet(page);
  return {
    browser,
    page,
  };
}

async function ensureClickable(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, {
    visible: true,
    timeout,
  });

  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element ${selector} not found`);
  }

  // Check if element is visible and clickable
  const isClickable = await page.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      window.getComputedStyle(el).display !== "none" &&
      window.getComputedStyle(el).visibility !== "hidden" &&
      !el.disabled
    );
  }, element);

  if (!isClickable) {
    throw new Error(`Element ${selector} is not clickable`);
  }

  return element;
}
async function verifyLoginSuccess(page) {
  // Wait a bit to ensure any redirects are complete
  await wait(2000);

  // Get the current URL
  const currentUrl = await page.url();

  // Check if we're still on the login page
  if (currentUrl.includes("/auth/login")) {
    // Check for specific error messages or invalid login indicators
    const hasLoginErrors = await page.evaluate(() => {
      const errorSelectors = [
        ".error-message",
        ".alert-error",
        '[data-testid="login-error"]',
        // Add any other error selectors specific to the site
      ];
      return errorSelectors.some(
        (selector) => document.querySelector(selector) !== null
      );
    });

    if (hasLoginErrors) {
      throw new Error("Login failed - Error message detected");
    } else {
      throw new Error("Login failed - Still on login page");
    }
  }

  // Verify we're on a logged-in page (add more success indicators as needed)
  const isLoggedIn = await page.evaluate(() => {
    // Add selectors that indicate successful login
    const successIndicators = [
      // Examples (update these based on the actual page structure):
      "dashboard",
      "account",
      "orders",
      // Check if logout button exists
      document.querySelector('a[href*="logout"]') !== null,
      // Check if user menu exists
      document.querySelector(".user-menu") !== null,
      // Check if username is displayed
      document.querySelector(".user-name") !== null,
    ];
    return successIndicators.some((indicator) =>
      typeof indicator === "boolean"
        ? indicator
        : window.location.href.includes(indicator)
    );
  });

  if (!isLoggedIn) {
    throw new Error("Login might have failed - No success indicators found");
  }

  return true;
}
async function retry(fn, verifyFn, maxAttempts = 5) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let response = await fn();
      // If verification function is provided, check if action was successful
      if (verifyFn) {
        const isSuccess = await verifyFn(response??null);
        if (!isSuccess) {
          throw new Error("Action verification failed");
        }
        console.log('verifcation Sucess');
        
      }
      return response ?? null;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
      if (attempt === maxAttempts) break;
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
      );
    }
  }
  throw new Error(
    `Failed after ${maxAttempts} attempts. Last error: ${lastError.message}`
  );
}

async function handleCookiePopup(page) {
  try {
    // Wait for a shorter time to check if cookie popup exists
    const cookieButton = await page.waitForSelector(
      SELECTORS.LOGIN.COOKIE_ACCEPT,
      {
        timeout: 5000,
        visible: true,
      }
    );

    if (cookieButton) {
      await cookieButton.click();

      // Wait for popup to disappear
      await page.waitForFunction((selector) => !document.querySelector(selector),{ timeout: 5000 },SELECTORS.LOGIN.COOKIE_ACCEPT);
    }
  } catch (error) {
    // If popup doesn't appear or is already closed, continue without error
    console.log("Cookie popup not found or already accepted");
  }
}

async function login(page, email, password) {
  try {
    // Navigate to login page
    await retry(
      async () => {
        await page.goto("https://www.printful.com/auth/login");
      },
      async () => {
        return await page.evaluate(() => {
          return window.location.href.includes("/auth/login");
        });
      }
    );

    // Handle cookie popup without retrying
    await handleCookiePopup(page);

    // Fill email - with clickable verification
    await retry(
      async () => {
        const emailField = await ensureClickable(page, SELECTORS.LOGIN.EMAIL);
        await emailField.type(email);
      },
      async () => {
        const emailValue = await page.$eval(
          SELECTORS.LOGIN.EMAIL,
          (el) => el.value
        );
        return emailValue === email;
      }
    );

    // Fill password - with clickable verification
    await retry(
      async () => {
        const passwordField = await ensureClickable(
          page,
          SELECTORS.LOGIN.PASSWORD
        );
        await passwordField.type(password);
      },
      async () => {
        const passwordValue = await page.$eval(
          SELECTORS.LOGIN.PASSWORD,
          (el) => el.value.length > 0
        );
        return passwordValue;
      }
    );

    // Submit form and wait for navigation - with enhanced click verification
    // await retry(
    //     async () => {
    //         const submitButton = await ensureClickable(page, SELECTORS.LOGIN.SUBMIT);
    //         await Promise.all([
    //             submitButton.click(),
    //             page.waitForNavigation({ waitUntil: 'networkidle0' })
    //         ]);
    //     },
    //     async () => {
    //         // Verify we're no longer on the login page
    //         const currentUrl = await page.evaluate(() => window.location.href);
    //         const isLoginPage = currentUrl.includes('/auth/login');

    //         // Check for common login error indicators
    //         const hasErrors = await page.evaluate(() => {
    //             const errorElements = document.querySelectorAll('.error-message, .alert-error');
    //             return errorElements.length === 0;
    //         });

    //         return !isLoginPage && hasErrors;
    //     }
    // );
    await retry(
      async () => {
        const submitButton = await ensureClickable(
          page,
          SELECTORS.LOGIN.SUBMIT
        );
        await Promise.all([
          submitButton.click(),
          page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
        // Add the verification step
        await verifyLoginSuccess(page);
      },
      async () => {
        // Double-check login status after retry
        return await verifyLoginSuccess(page);
      }
    );
  } catch (error) {
    console.error("Login failed:", error.message);
    throw error;
  }
}

// Navigation Store
async function navigateToStore(page, storeName) {
    try {
      // Click on stores navigation with retry
      await retry(
        async () => {
          const storesNavButton = await ensureClickable(page, SELECTORS.NAVIGATION.STORES);
          await storesNavButton.click();
          await wait(3000); // Wait for navigation/animation
        },
        async () => {
          // Verify that the stores page has loaded
          const storeCards = await page.$$(SELECTORS.STORE.CARD);
          return storeCards.length > 0;
        }
      );
  
      // Find and click the correct store card
      await retry(
        async () => {
          const targetStore = await findStoreCard(page, storeName);
          if (!targetStore) {
              const storesNavButton = await ensureClickable(page, SELECTORS.NAVIGATION.STORES);
              await storesNavButton.click();
              await wait(3000); 
              throw new Error(`Store "${storeName}" not found in the list`);
          }
  
          const viewStoreButton = await targetStore.$(SELECTORS.STORE.VIEW_BUTTON);
          if (!viewStoreButton) {
            throw new Error(`View button not found for store "${storeName}"`);
          }
  
          await viewStoreButton.click();
          await page.waitForNavigation({ waitUntil: "networkidle0" });
          await verifyStoreNavigation(page,storeName);
        },
        async () => {
            const verficationStatus = await verifyStoreNavigation(page,storeName);
            return verficationStatus;
        }
      );
  
    //   return true;
    } catch (error) {
      console.error("Store navigation failed:", error.message);
      throw error;
    }
}
// async function clickUploadButton(page, selector = '.product-push__droparea__pulse') {
//     await wait(2000);
//     // const methods = [
//     //     // Method 1: Direct button click with wait for modal
//     //     async () => {
//     //         await page.waitForSelector(selector, { visible: true, timeout: 5000 });
//     //         await page.click(selector);
//     //         // Wait for modal to appear
//     //         await page.waitForSelector('.modal-dialog.modal-lg', { visible: true, timeout: 5000 });
//     //     },

//     //     // Method 2: Click button content
//     //     async () => {
//     //         await page.evaluate(() => {
//     //             const buttonContent = document.querySelector('.product-push__droparea__pulse');
//     //             if (buttonContent) {
//     //                 buttonContent.click();
//     //             }
//     //         });
//     //         // Wait for file library
//     //         await page.waitForSelector('.file-library.dropzone', { visible: true, timeout: 5000 });
//     //     },

//     //     // Method 3: JavaScript click with overlay removal
//     //     async () => {
//     //         await page.evaluate(() => {
//     //             const pulse = document.querySelector('.product-push__droparea__pulse');
//     //             if (pulse) pulse.remove();
//     //             document.querySelector('.product-push__droparea button').click();
//     //         });
//     //         // Wait for modal content
//     //         await page.waitForSelector('.modal-content.modal-rounded', { visible: true, timeout: 5000 });
//     //     },

//     //     // Method 4: Click with visibility ensure
//     //     async () => {
//     //         await page.evaluate((selector) => {
//     //             const element = document.querySelector(selector);
//     //             if (element) {
//     //                 element.style.opacity = '1';
//     //                 element.style.visibility = 'visible';
//     //                 element.style.display = 'block';
//     //                 element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     //                 element.click();
//     //             }
//     //         }, selector);
//     //         // Wait for search row
//     //         await page.waitForSelector('.file-library__search.row', { visible: true, timeout: 5000 });
//     //     }
//     // ];

//     // let lastError = null;
    
//     // Try each method until one succeeds
//     // for (let i = 0; i < methods.length; i++) {
//     //     try {
//     //         await methods[i]();
//     //         console.log(`Successfully clicked using method ${i + 1}`);
            
//     //         // Verify modal is open by checking multiple selectors
//     //         const modalVisible = await page.evaluate(() => {
//     //             return !!(
//     //                 document.querySelector('.modal-dialog.modal-lg') &&
//     //                 document.querySelector('.modal-content.modal-rounded') &&
//     //                 document.querySelector('.file-library.dropzone')
//     //             );
//     //         });

//     //         if (modalVisible) {
//     //             console.log('Successfully opened Printful file library modal');
//     //             return true;
//     //         }
            
//     //         console.log('Method did not trigger modal, trying next method...');
            
//     //     } catch (error) {
//     //         console.log(`Method ${i + 1} failed: ${error.message}`);
//     //         lastError = error;
//     //         await wait(500);
//     //     }
//     // }

//     // throw new Error(`Failed to open file library modal after all attempts. Last error: ${lastError.message}`);
//     // async () => {
//                 await page.evaluate(() => {
//                     const buttonContent = document.querySelector('.product-push__droparea__pulse');
//                     if (buttonContent) {
//                         buttonContent.click();
//                     }
//                 });
//                 // Wait for file library
//         //         await page.waitForSelector('.file-library.dropzone', { visible: true, timeout: 5000 });
//         //     },
// }

// async function navigateToCatalog(page, storeName) {
//     try {
//       // Click on stores navigation with retry
//     //   await retry(
//     //     async () => {
//           const storesNavButton = await ensureClickable(page, SELECTORS.NAVIGATION.CATALOG);
//           await storesNavButton.click();
//         //   await page.waitForNavigation()
//           await wait(5000); // Wait for navigation/animation
//     //     },
//     //     async () => {
//     //       // Verify that the stores page has loaded
//     //       const storeCards = await page.$$(SELECTORS.STORE.CARD);
//     //       return storeCards.length > 0;
//     //     }
//     //   );
  
//       // Find and click the correct store card
//     //   await retry(
//     //     async () => {
//     //       const targetStore = await findStoreCard(page, storeName);
//     //       if (!targetStore) {
//     //           const storesNavButton = await ensureClickable(page, SELECTORS.NAVIGATION.STORES);
//     //           await storesNavButton.click();
//     //           await wait(3000); 
//     //           throw new Error(`Store "${storeName}" not found in the list`);
//     //       }
  
//     //       const viewStoreButton = await targetStore.$(SELECTORS.STORE.VIEW_BUTTON);
//     //       if (!viewStoreButton) {
//     //         throw new Error(`View button not found for store "${storeName}"`);
//     //       }
  
//     //       await viewStoreButton.click();
//     //       await page.waitForNavigation({ waitUntil: "networkidle0" });
//     //       await verifyStoreNavigation(page,storeName);
//     //     },
//     //     async () => {
//     //         const verficationStatus = await verifyStoreNavigation(page,storeName);
//     //         return verficationStatus;
//     //     }
//     //   );
//     await page.type("#sitewide-search-input",storeName,{
//         delay:50
//     })
//     await wait(3000);
//     const searchedItems = await page.$$(".sitewide-search__item--product");
//     console.log(searchedItems,"searchItems")  
//     for (const item of searchedItems) {
//         // const linkHandle = await item.$(SELECTORS.TEMPLATE.LINK);
//         // if (linkHandle) {
//         // const linkText = await page.evaluate((el) => el.textContent.trim(), linkHandle);
//         // if (linkText === templateTitle) {
//         //     return item;
//         // }
//         // }
//         await item.click();
//         await page.waitForNavigation();
//         await wait(3000);
//         try {
            
//         } catch (error) {
            
//         }
//         await page.evaluate(() => {
//             const buttonGroup = document.querySelector(".product-action-buttons__wrapper");
//             if (buttonGroup) {
//                 buttonGroup.scrollIntoView({
//                 behavior: "smooth",
//                 block: "center",
//               });
//             }
//           });
//         const buttons = await page.$$(".product-action-buttons__wrapper button");
//         for(button of buttons){
//             try {
//                 const buttonText = await button.evaluate((el) => {
//                     // Check for nested text content
//                     const textContent = el.textContent.trim();
//                     // Handle cases where text might be in nested elements
//                     return textContent.replace(/\s+/g, " ").trim();
//                 });
//                 if(buttonText==="Create product template"){
//                     await button.click();
//                 }
//             } catch (error) {
                
//             }
//         }
//         await wait(4000);
//         // const ImageUpload = await page.$('.product-push__droparea button');
//         // // await ImageUpload.click();
//         // await page.click('.product-push__droparea button')
//         // await page.click(item)
//         // await clickUploadButton(page);  
//     //    await clickUploadButton(page);
//             // if (result instanceof FileChooser) {
//             //     // If a file chooser was returned, use it
//             //     await result.accept(['path/to/your/file.jpg']);
//             // }
//         // } catch (error) {
//         //     console.error('Failed to handle upload:', error);
//         //     // Handle failure appropriately
//         // }
//     }
//     //   return true;
//     } catch (error) {
//       console.error("Store navigation failed:", error.message);
//       throw error;
//     }
// }
async function clickUploadButton(page, selector = '.product-push__droparea button') {
    const methods = [
        // Method 1: Standard click with wait
        async () => {
            await page.waitForSelector(selector, { visible: true, timeout: 5000 });
            await page.click(selector);
        },

        // Method 2: Force click with delay
        async () => {
            await page.waitForSelector(selector, { visible: true, timeout: 5000 });
            await page.click(selector, { force: true, delay: 100 });
        },

        // Method 3: Click via mouse coordinates
        async () => {
            const button = await page.$(selector);
            const box = await button.boundingBox();
            await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
        },

        // Method 4: JavaScript click with overlay removal
        async () => {
            await page.evaluate(() => {
                const pulse = document.querySelector('.product-push__droparea__pulse');
                if (pulse) pulse.remove();
                document.querySelector('.product-push__droparea button').click();
            });
        },

        // Method 5: Click after ensuring visibility
        async () => {
            await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) {
                    // Ensure element is visible
                    element.style.opacity = '1';
                    element.style.visibility = 'visible';
                    element.style.display = 'block';
                    // Scroll into view if needed
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, selector);
            await wait(2000); // Wait for scroll
            await page.click(selector);
        }
    ];

    let lastError = null;
    
    // Try each method until one succeeds

    for (let i = 0; i < methods.length; i++) {
        try {
            await methods[i]();
            const client = await page.target().createCDPSession();
            await client.send("Emulation.setDeviceMetricsOverride", {
              width: 850,
              height: 667,
              deviceScaleFactor: 1,
              mobile: true,
            });
          
            // Toggle mobile emulation using Chrome DevTools keyboard shortcut
            await page.evaluate(() => {
              // Simulate pressing Ctrl+Shift+M (Cmd+Shift+M on Mac)
              const event = new KeyboardEvent("keydown", {
                key: "M",
                code: "KeyM",
                ctrlKey: true,
                shiftKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            });
          
            console.log("DevTools opened in responsive mode");
          
            // Keep the script running
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log(`Successfully clicked using method ${i + 1}`);
            const sideBarFileButton = 'button#file[data-test="designer-sidebar-navigation-uploads-button"]'; // Unique selector for the "Uploads" button
            try {
                await page.waitForSelector(sideBarFileButton, { timeout: 5000 });
            } catch (error) {
                throw new Error(`Selector not found: ${sideBarFileButton}`);
            }
            try {
                // Click the button
                await page.click(sideBarFileButton);
                console.log('Successfully clicked the Uploads button');
                
                // Wait a moment to check if the custom UI appears
                await wait(1000);
                await selectAndApplyMedia(page,"a51cf9_8e7b1ddc588a4b0b8bb7be4e157aa45c~mv2.png");
                await browserSet(page)
                // if(returnedImage){
                //     // await 
                // }
                // Check for the custom Printful UI
                // const customUIVisible = await page.evaluate(() => {
                //     return !!document.querySelector('.printful-image-picker') || 
                //            !!document.querySelector('.image-gallery') ||
                //            !!document.querySelector('[data-test="image-picker"]');
                // });
        
                // if (customUIVisible) {
                //     console.log('Successfully opened Printful image picker UI');
                //     return true;
                // } else {
                //     console.log('Uploads button clicked, but custom UI did not appear');
                // }
        
            } catch (error) {
                console.error(`Failed to click Uploads button: ${error.message}`);
            }
            return true; // Success
        } catch (error) {
            console.log(`Method ${i + 1} failed: ${error.message}`);
            lastError = error;
            // Wait briefly before trying next method
            await wait(1000);
        }
    }

    // If all methods fail, try one final time with file chooser
    // try {
    //     const [fileChooser] = await Promise.all([
    //         page.waitForFileChooser(),
    //         page.click(selector, { force: true })
    //     ]);
    //     console.log('Successfully activated file chooser');
    //     return fileChooser; // Return the file chooser for further handling
    // } catch (error) {
    //     console.error('All click methods failed, including file chooser');
    //     throw new Error(`Failed to click upload button after all attempts. Last error: ${lastError.message}`);
    // }
}
// async function navigateToCatalog(page, storeName) {
//     try {
//         const storesNavButton = await ensureClickable(page, SELECTORS.NAVIGATION.CATALOG);
//         await storesNavButton.click();
//         await wait(5000);

//         await page.type("#sitewide-search-input", storeName, {
//             delay: 50
//         });
//         await wait(3000);
        
//         const searchedItems = await page.$$(".sitewide-search__item--product");
//         console.log(searchedItems, "searchItems");

//         for (const item of searchedItems) {
//             await item.click();
//             await page.waitForNavigation();
//             await wait(3000);

//             await page.evaluate(() => {
//                 const buttonGroup = document.querySelector(".product-action-buttons__wrapper");
//                 if (buttonGroup) {
//                     buttonGroup.scrollIntoView({
//                         behavior: "smooth",
//                         block: "center",
//                     });
//                 }
//             });

//             // const buttons = await page.$$(".product-action-buttons__wrapper button");
//             // for (const button of buttons) {
//             //     try {
//             //         const buttonText = await button.evaluate((el) => {
//             //             return el.textContent.trim().replace(/\s+/g, " ");
//             //         });
//             //         if (buttonText === "Create product template") {
//             //             await button.click();
//             //             await wait(4000);
                        
//             //             // Prevent default file input behavior before clicking upload button
//             //             await page.evaluate(() => {
//             //                 // Remove any existing file input event listeners
//             //                 const originalAddEventListener = Element.prototype.addEventListener;
//             //                 Element.prototype.addEventListener = function (type, listener, options) {
//             //                     if (type === 'click' && this.classList.contains('product-push__droparea')) {
//             //                         return; // Don't add click listeners for this element
//             //                     }
//             //                     originalAddEventListener.call(this, type, listener, options);
//             //                 };
                            
//             //                 // Disable any file inputs
//             //                 const fileInputs = document.querySelectorAll('input[type="file"]');
//             //                 fileInputs.forEach(input => {
//             //                     input.disabled = true;
//             //                 });
//             //             });
                        
//             //             // Now try to click the upload button
//             //             await clickUploadButton(page);
//             //         }
//             //     } catch (error) {
//             //         console.error("Error processing button:", error);
//             //     }
//             // }
//             await page.setDefaultNavigationTimeout(0);
//             await page._client().send('Page.setInterceptFileChooser', {enabled: false});
//             // OR use this alternative method
//             await page.evaluate(() => {
//                 window.addEventListener('beforeunload', (e) => {
//                     e.preventDefault();
//                     e.returnValue = '';
//                 });
//             });
    
//             const buttons = await page.$$(".product-action-buttons__wrapper button");
//             for (const button of buttons) {
//                 try {
//                     const buttonText = await button.evaluate((el) => {
//                         return el.textContent.trim().replace(/\s+/g, " ");
//                     });
//                     if (buttonText === "Create product template") {
//                         await button.click();
//                         await wait(4000);
//                         await clickUploadButton(page);
//                     }
//                 } catch (error) {
//                     console.error("Error processing button:", error);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Store navigation failed:", error.message);
//         throw error;
//     }
// }

// async function clickUploadButton(page, selector = '.product-push__droparea button') {
//     const methods = [
//         // Method 1: Click with event prevention
//         async () => {
//             await page.evaluate(() => {
//                 const button = document.querySelector('.product-push__droparea button');
//                 // Remove any click event listeners
//                 const clone = button.cloneNode(true);
//                 button.parentNode.replaceChild(clone, button);
                
//                 // Trigger a custom event instead
//                 const event = new CustomEvent('customClick', {
//                     bubbles: true,
//                     cancelable: true
//                 });
//                 clone.dispatchEvent(event);
//             });
//         },

//         // Method 2: Direct DOM manipulation
//         async () => {
//             await page.evaluate(() => {
//                 const container = document.querySelector('.product-push__droparea');
//                 container.dispatchEvent(new MouseEvent('mousedown', {
//                     bubbles: true,
//                     cancelable: true,
//                     view: window
//                 }));
//             });
//         },

//         // Method 3: Trigger modal directly
//         async () => {
//             await page.evaluate(() => {
//                 // This depends on Printful's implementation
//                 // You might need to adjust this based on their actual code
//                 if (window.PrintfulImagePicker && typeof window.PrintfulImagePicker.open === 'function') {
//                     window.PrintfulImagePicker.open();
//                 }
//             });
//         }
//     ];

//     let lastError = null;
    
//     for (let i = 0; i < methods.length; i++) {
//         try {
//             await methods[i]();
//             await wait(1000);
            
//             // Check if modal opened
//             const modalVisible = await page.evaluate(() => {
//                 return !!(
//                     document.querySelector('.modal-dialog.modal-lg') &&
//                     document.querySelector('.modal-content.modal-rounded') &&
//                     document.querySelector('.file-library.dropzone')
//                 );
//             });

//             if (modalVisible) {
//                 console.log(`Successfully opened modal using method ${i + 1}`);
//                 return true;
//             }
//         } catch (error) {
//             console.log(`Method ${i + 1} failed: ${error.message}`);
//             lastError = error;
//             await wait(500);
//         }
//     }

//     throw new Error(`Failed to open modal after all attempts. Last error: ${lastError.message}`);
// }
async function navigateToCatalog(page, storeName) {
    try {
        const storesNavButton = await ensureClickable(page, SELECTORS.NAVIGATION.CATALOG);
        await storesNavButton.click();
        await wait(5000);

        await page.type("#sitewide-search-input", storeName, {
            delay: 50
        });
        await wait(3000);
        
        const searchedItems = await page.$$(".sitewide-search__item--product");
        console.log(searchedItems, "searchItems");

        for (const item of searchedItems) {
            await item.click();
            await page.waitForNavigation();
            await wait(3000);

            await page.evaluate(() => {
                const buttonGroup = document.querySelector(".product-action-buttons__wrapper");
                if (buttonGroup) {
                    buttonGroup.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            });

            const buttons = await page.$$(".product-action-buttons__wrapper button");
            for (const button of buttons) {
                try {
                    const buttonText = await button.evaluate((el) => {
                        return el.textContent.trim().replace(/\s+/g, " ");
                    });
                    if (buttonText === "Create product template") {
                        await button.click();
                        await wait(4000);
                        
                        // Prevent default file input behavior before clicking upload button
                        await page.evaluate(() => {
                            // Remove any existing file input event listeners
                            const originalAddEventListener = Element.prototype.addEventListener;
                            Element.prototype.addEventListener = function (type, listener, options) {
                                if (type === 'click' && this.classList.contains('product-push__droparea')) {
                                    return; // Don't add click listeners for this element
                                }
                                originalAddEventListener.call(this, type, listener, options);
                            };
                            
                            // Disable any file inputs
                            const fileInputs = document.querySelectorAll('input[type="file"]');
                            fileInputs.forEach(input => {
                                input.disabled = true;
                            });
                        });
                        
                        // Now try to click the upload button
                        await clickUploadButton(page);
                        await handleModalButton(page,"saveTemplate")
                    }
                } catch (error) {
                    console.error("Error processing button:", error);
                }
            }
        }
    } catch (error) {
        console.error("Store navigation failed:", error.message);
        throw error;
    }
}
// async function getImageFromGallery(page,fileName) {
//     // const item = page.$("#file-library-list");
//     // await page.evaluate((el) => {
//     //     el.scrollIntoView({ behavior: "smooth", block: "center" });
//     // }, item);
//     const templateItems = await page.$$('.file-library__file-listing-item');
//     console.log(templateItems,"templateItems");
    
//     for (const item of templateItems) {
//          await page.evaluate((el) => {
//             el.scrollIntoView({ behavior: "smooth", block: "center" });
//         }, item);
//         console.log(item)
//         const handle = await item.$('.pf-ui-caption');
//         const linkText = await page.evaluate((el) => el.textContent.trim(), handle);
//         console.log(linkText,"linkText");
//         if(linkText===fileName){
            
//         }
//          // Scroll into view if needed

//          await wait(1000);
//         //  await page.waitForFunction(
//         //    (button) => !button.disabled,
//         //    {},
//         //    item
//         //  );
//         // const linkHandle = await item.$(SELECTORS.TEMPLATE.LINK);
//         // if (linkHandle) {
//         // const linkText = await page.evaluate((el) => el.textContent.trim(), linkHandle);
//         // if (linkText === templateTitle) {
//         //     return item;
//         // }
//         // }
//         console.log(item);
        
//     }
//     return null;
// }
// async function searchMediaGrid(page, fileName) {
//     try {
//         // First, wait for the grid container to be present
//         await page.waitForSelector('#file-library-list');
        
//         // Ensure we're looking at the grid view, not the recent items
//         // Scroll to the grid section
//         await page.evaluate(() => {
//             const gridSection = document.querySelector('#file-library-list');
//             gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         });
        
//         // Wait a bit for the scroll to complete and items to load
//         await wait(1000);
        
//         // Get all media items in the grid view specifically
//         // Exclude items from the recently viewed section
//         const mediaItems = await page.$$('#file-library-list .file-library__file-listing-item:not([data-test="file-library-recently-viewed"] *)');
        
//         console.log(`Found ${mediaItems.length} items in the grid`);
        
//         // Iterate through each media item
//         for (const item of mediaItems) {
//             // Scroll each item into view for better visibility and interaction
//             await page.evaluate((el) => {
//                 el.scrollIntoView({ behavior: 'smooth', block: 'center' });
//             }, item);
            
//             // Wait for any lazy-loading to complete
//             await wait(2000);
            
//             // Get the caption/filename element
//             const captionHandle = await item.$('.pf-ui-caption');
//             if (!captionHandle) {
//                 console.log('Caption element not found for item');
//                 continue;
//             }
            
//             // Get the text content
//             const itemText = await page.evaluate(el => el.textContent.trim(), captionHandle);
//             console.log('Found item:', itemText);
            
//             // Check if this is the file we're looking for
//             if (itemText === fileName) {
//                 console.log('Found matching file:', fileName);
//                 const libraryItemWrapper = await item.$('.pf-library-item__wrapper');
//                 if (libraryItemWrapper) {
//                     // Hover over the item
//                     await libraryItemWrapper.hover();
                    
//                     // Wait for the overlay with the Apply button to appear
//                     await page.waitForSelector('.pf-library-item__overlay', { visible: true });
                    
//                     // Find and click the Apply button in the overlay
//                     // Looking for both desktop and mobile versions of the Apply button
//                     const applyButton = await item.$('.pf-library-item__overlay .pf-btn-secondary:not(.pf-btn-square):not(.dropdown-toggle)');
                    
//                     if (applyButton) {
//                         await applyButton.click();
//                         console.log('Successfully clicked Apply button');
//                         return true;
//                     } else {
//                         console.error('Apply button not found in overlay');
//                         return false;
//                     }
//                 } else {
//                     console.error('Could not find library item wrapper for hovering');
//                     return false;
//                 }
//             }
//         }
        
//         console.log('File not found:', fileName);
//         return null;
        
//     } catch (error) {
//         console.error('Error searching media grid:', error);
//         throw error;
//     }
// }
async function retryClick(page, selector, maxAttempts = 3, timeout = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempt ${attempt} to click ${selector}`);
            
            // Wait for element to be visible
            await page.waitForSelector(selector, { visible: true, timeout });
            
            // Try different click methods
            try {
                // Method 1: Direct click
                await page.click(selector);
            } catch (e) {
                // Method 2: JavaScript click
                await page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) element.click();
                }, selector);
            }
            
            // Verify if click was successful (you might need to adjust this based on your UI feedback)
            await wait(500);
            return true;
            
        } catch (error) {
            console.log(`Click attempt ${attempt} failed:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Failed to click ${selector} after ${maxAttempts} attempts`);
            }
            // Wait before retry
            await wait(1000);
        }
    }
    return false;
}

async function tryApplyButton(page, item, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempt ${attempt} to click Apply button`);
            
            // Make sure item is in view
            await page.evaluate((el) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, item);
            
            await wait(500);
            
            // Hover over the item
            const libraryItemWrapper = await item.$('.pf-library-item__wrapper');
            if (!libraryItemWrapper) {
                console.log('Library item wrapper not found, retrying...');
                continue;
            }
            
            // Multiple hover attempts
            for (let hoverAttempt = 1; hoverAttempt <= 3; hoverAttempt++) {
                await libraryItemWrapper.hover();
                await wait(500);
                
                // Check if overlay appeared
                const isOverlayVisible = await page.evaluate(() => {
                    const overlay = document.querySelector('.pf-library-item__overlay');
                    return overlay && window.getComputedStyle(overlay).display !== 'none';
                });
                
                if (isOverlayVisible) break;
                console.log(`Hover attempt ${hoverAttempt} didn't show overlay, retrying...`);
            }
            
            // Try clicking desktop version first
            const desktopApplyButton = await item.$('.pf-library-item__overlay .pf-btn-secondary:not(.pf-btn-square):not(.dropdown-toggle)');
            if (desktopApplyButton) {
                // Try multiple click methods
                try {
                    await desktopApplyButton.click();
                    console.log('Clicked desktop Apply button');
                    return true;
                } catch (e) {
                    console.log('Direct click failed, trying alternative methods...');
                    
                    // Try JavaScript click
                    await page.evaluate(button => {
                        button.click();
                    }, desktopApplyButton);
                    
                    // Try force click
                    await page.evaluate(button => {
                        const clickEvent = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });
                        button.dispatchEvent(clickEvent);
                    }, desktopApplyButton);
                }
            }
            
            // If desktop version failed, try mobile version
            const mobileApplyButton = await item.$('.pf-d-flex.pf-d-sm-none .pf-btn-secondary:not(.pf-btn-square)');
            if (mobileApplyButton) {
                try {
                    await mobileApplyButton.click();
                    console.log('Clicked mobile Apply button');
                    return true;
                } catch (e) {
                    console.log('Mobile button click failed, trying alternative methods...');
                    
                    // Try JavaScript click for mobile
                    await page.evaluate(button => {
                        button.click();
                    }, mobileApplyButton);
                }
            }
            
        } catch (error) {
            console.log(`Apply button attempt ${attempt} failed:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Failed to click Apply button after ${maxAttempts} attempts`);
            }
            await wait(1000);
        }
    }
    return false;
}

async function searchMediaGridAndApply(page, fileName, maxAttempts = 3) {
    try {
        await page.waitForSelector('#file-library-list');
        
        // Scroll to grid section
        await page.evaluate(() => {
            const gridSection = document.querySelector('#file-library-list');
            gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        await wait(1000);
        
        const mediaItems = await page.$$('#file-library-list .file-library__file-listing-item:not([data-test="file-library-recently-viewed"] *)');
        console.log(`Found ${mediaItems.length} items in the grid`);
        
        for (const item of mediaItems) {
            await page.evaluate((el) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, item);
            
            await wait(500);
            
            const captionHandle = await item.$('.pf-ui-caption');
            if (!captionHandle) continue;
            
            const itemText = await page.evaluate(el => el.textContent.trim(), captionHandle);
            console.log('Checking item:', itemText);
            
            if (itemText === fileName) {
                console.log('Found matching file:', fileName);
                
                // Try to click Apply button with retries
                const success = await tryApplyButton(page, item, maxAttempts);
                
                if (success) {
                    console.log('Successfully clicked Apply button');
                    // const client = await page.target().createCDPSession();
                    // await client.send("Emulation.clearDeviceMetricsOverride");
                    // // Toggle device toolbar off
                    // await page.evaluate(() => {
                    //     const event = new KeyboardEvent("keydown", {
                    //     key: "M",
                    //     code: "KeyM",
                    //     ctrlKey: true,
                    //     shiftKey: true,
                    //     bubbles: true,
                    //     });
                    //     document.dispatchEvent(event);
                    // });
                    return true;
                } else {
                    console.error('Failed to click Apply button after all attempts');
                    return false;
                }
            }
        }
        
        console.log('File not found:', fileName);
        return false;
        
    } catch (error) {
        console.error('Error in searchMediaGridAndApply:', error);
        throw error;
    }
}

// Usage example:
async function selectAndApplyMedia(page, fileName) {
    await wait(2000);
    
    let success = false;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} to find and apply media`);
            success = await searchMediaGridAndApply(page, fileName);
            if (success) break;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                throw error;
            }
            await wait(2000);
        }
    }
    
    if (success) {
        console.log('Successfully found and applied the media item');
    } else {
        console.log('Failed to find or apply the media item after all attempts');
    }
}
async function findStoreCard(page, storeName) {
const storeCards = await page.$$(SELECTORS.STORE.CARD);
for (const card of storeCards) {
    const titleHandle = await card.$(SELECTORS.STORE.TITLE);
    if (titleHandle) {
    const storeTitle = await page.evaluate(el => el.textContent.trim(), titleHandle);
    console.log(storeTitle,"storeTitle");
    if (storeTitle === storeName) {
        return card;
    }
    }
}
return null;
}

async function verifyStoreNavigation(page, storeName) {
    // await wait(4000)
    const titleHandle = await page.$('.product-push__store-name');
    const storeTitle = await page.evaluate(el => el.textContent.trim(), titleHandle);
    console.log(storeTitle,"storeTitle3");

    if (storeTitle) {
        // const storeTitle = await page.evaluate(el => el.textContent.trim(), titleHandle);
        console.log(storeTitle, "storeTitle4", storeTitle === storeName);
        return storeTitle === storeName;
    }
    return false;
}


// Select Product
async function selectProduct(page, templateTitle) {
    try {
      // Navigate to product list and verify it's loaded
      await retry(
        async () => {
          await page.waitForSelector(SELECTORS.PRODUCT.LIST, { visible: true });
          const ProductTableHeader = await page.$(SELECTORS.PRODUCT.HEADER);
          await page.evaluate((el) => {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, ProductTableHeader);
        },
        async () => {
          const productRows = await page.$$(SELECTORS.PRODUCT.ROW);
          return productRows.length > 0;
        }
      );
  
      // Find and verify the correct product row
      const targetRow = await retry(
        async () => {
          return await findProductRow(page, templateTitle);
        },
        async (row) => {
            // const row = await findProductRow(page, templateTitle);
            console.log(row,"from async retry");
            if (!row) return false;
            const titleHandle = await row.$(SELECTORS.PRODUCT.TITLE);
            const productTitle = await page.evaluate(
            (el) => el.textContent.trim(),
            titleHandle
            );
            return productTitle === templateTitle;
        }
      );
  
      if (!targetRow) {
        throw new Error(`Product "${templateTitle}" not found in list`);
      }
  
      // Select the checkbox with verification
      await retry(
        async () => {
          await selectProductCheckbox(page, targetRow);
        },
        async () => {
          const checkbox = await targetRow.$(SELECTORS.PRODUCT.CHECKBOX);
          return await page.evaluate((el) => el.checked, checkbox);
        }
      );
  
      // Click save button and handle modal
      await retry(
        async () => {
          await handleSaveTemplate(page);
        },
        async () => {
          // Verify the modal is no longer visible (indicating successful save);
          await wait(2000);
            await page.waitForSelector('.alternative__status-message--success', {
                visible: true,
                timeout: 5000,
            })
            const handleStatus = await page.$('.alternative__status-message--success');
            if(handleStatus){
                const statusMessage = await page.evaluate(el => el.textContent.trim(), handleStatus);            
                return statusMessage.includes("created");
            }
            // const modalVisible = await page.evaluate(() => {
            //     const modal = document.querySelector('.alternative__status-message--success');
            //     console.log(modal);
            // //     return modal && window.getComputedStyle(modal).display !== 'none';
            // });
            // <div data-test="success-UdXnr8tIYRLKWO5" class="alternative__status-message alternative__status-message--success">Product template created!</div>
        }
      );
  
      return true;
    } catch (error) {
      console.error("Error in selectProduct:", error);
      throw error;
    }
}

async function findProductRow(page, templateTitle) {
const productRows = await page.$$(SELECTORS.PRODUCT.ROW);

for (const row of productRows) {
    const titleHandle = await row.$(SELECTORS.PRODUCT.TITLE);
    if (!titleHandle) continue;

    const productTitle = await page.evaluate(
    (el) => el.textContent.trim(),
    titleHandle
    );

    if (productTitle === templateTitle) {
    await page.evaluate((el) => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, row);
    await wait(1000);
    
    return row;
    }
}
return null;
}

async function selectProductCheckbox(page, row) {
const checkbox = await row.$(SELECTORS.PRODUCT.CHECKBOX);
if (!checkbox) {
    throw new Error("Checkbox not found for matching product");
}

// Verify checkbox is clickable
const isClickable = await page.evaluate((el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    rect.width > 0 &&
    rect.height > 0 &&
    !el.disabled
    );
}, checkbox);

if (!isClickable) {
    throw new Error("Checkbox is not clickable");
}

// Try multiple click methods
try {
    await checkbox.click({ delay: 100 });
} catch (clickError) {
    try {
    await page.evaluate((el) => el.click(), checkbox);
    } catch (evalClickError) {
    await page.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        });
        el.dispatchEvent(event);
    }, checkbox);
    }
}
}

async function handleSaveTemplate(page) {
// Click the save button
const saveButton = await ensureClickable(page, "#create-product-templates");
await saveButton.click();

// Wait for and handle modal
await page.waitForSelector("#create-product-templates-disclaimer-modal", {
    visible: true,
    timeout: 5000,
});

await wait(1000);

const modalSaveButton = await ensureClickable(page, ".modal-footer .pf-btn-primary");
await modalSaveButton.click();
}


// Navigate to template
// async function navigateToTemplate(page) {
//     try {
//         await retry(
//             async(()=>{
//                 const TemplateNavButton = 
//             })
//         )
//         // Navigate to templates page
//         await page.waitForSelector(SELECTORS.TEMPLATE.SIDEBAR_LINK, {
//         visible: true,
//         });
//         await page.click(SELECTORS.TEMPLATE.SIDEBAR_LINK);
//         console.log("Clicked on Product templates menu item");
//         await wait(3000);
//         // Wait for template grid to be visible
//         await page.waitForSelector(SELECTORS.TEMPLATE.GRID, {
//         visible: true,
//         });
//         await wait(1000);
//         console.log("Template grid is visible");

//         // Get all template items
//         const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
//         console.log(`Found ${templateItems.length} templates`);
//         return true;
//     } catch (error) {
//         console.error("Error in navigateToTemplate:", error);
//         throw error;
//     }
// }
async function findAndClickWixStore(page) {
    try {
        // Wait for the store list to be present
        await page.waitForSelector('.storeList');
        
        // Get all store items
        const storeItems = await page.$$('.storeList [data-test="store-picker-item"]');
        console.log(`Found ${storeItems.length} store items`);
        
        for (const item of storeItems) {
            try {
                // Scroll item into view
                await page.evaluate((el) => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, item);
                
                await wait(1000);
                
                // Get the background image URL
                const backgroundImageUrl = await item.$eval('.square-box', el => {
                    const style = window.getComputedStyle(el);
                    const backgroundImage = style.backgroundImage;
                    // Extract URL from the background-image property
                    // Remove url(" ") wrapper and return clean URL
                    return backgroundImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
                });
                
                console.log('Checking store background image:', backgroundImageUrl);
                
                // Check if the URL contains 'wix'
                if (backgroundImageUrl.toLowerCase().includes('wix')) {
                    console.log('Found Wix store, attempting to click...');
                    
                    // Try multiple click methods with retry
                    for (let attempt = 1; attempt <= 3; attempt++) {
                        try {
                            console.log(`Click attempt ${attempt}`);
                            
                            // Method 1: Direct click
                            try {
                                await item.click();
                                console.log('Successfully clicked store item');
                                return true;
                            } catch (clickError) {
                                console.log('Direct click failed, trying alternative methods...');
                                
                                // Method 2: JavaScript click
                                await page.evaluate(element => {
                                    element.click();
                                }, item);
                                
                                // Method 3: Force click with MouseEvent
                                await page.evaluate(element => {
                                    const clickEvent = new MouseEvent('click', {
                                        view: window,
                                        bubbles: true,
                                        cancelable: true
                                    });
                                    element.dispatchEvent(clickEvent);
                                }, item);
                                
                                // Method 4: Click by coordinates
                                const bbox = await item.boundingBox();
                                if (bbox) {
                                    await page.mouse.click(
                                        bbox.x + bbox.width / 2,
                                        bbox.y + bbox.height / 2
                                    );
                                }
                            }
                            
                            // Wait to see if click was successful
                            await wait(1000);
                            return true;
                            
                        } catch (attemptError) {
                            console.log(`Click attempt ${attempt} failed:`, attemptError.message);
                            if (attempt === 3) {
                                throw new Error('Failed to click store item after all attempts');
                            }
                            await wait(1000);
                        }
                    }
                }
            } catch (itemError) {
                console.log('Error processing store item:', itemError.message);
                continue;
            }
        }
        
        console.log('No Wix store found');
        return false;
        
    } catch (error) {
        console.error('Error in findAndClickWixStore:', error);
        throw error;
    }
}

// Usage example with retries
async function selectWixStore(page, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} to find and select Wix store`);
            
            // Wait for page to be ready
            await wait(1000);
            
            const success = await findAndClickWixStore(page);
            if (success) {
                console.log('Successfully selected Wix store');
                return true;
            }
            
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                throw error;
            }
            await wait(2000);
        }
    }
    
    console.log('Failed to find or select Wix store after all attempts');
    return false;
}
async function navigateToTemplate(page) {
    try {
      // Navigate to templates page with retry
      await retry(
        async () => {
          const templatesSidebarLink = await ensureClickable(
            page,
            SELECTORS.TEMPLATE.SIDEBAR_LINK
          );
          await templatesSidebarLink.click();
          await wait(3000);
        },
        async () => {
          // Verify that the templates page has loaded
          const templateGrid = await page.$(SELECTORS.TEMPLATE.GRID);
          return templateGrid !== null;
        }
      );
  
      // Wait for template grid to be visible with retry
      await retry(
        async () => {
          await page.waitForSelector(SELECTORS.TEMPLATE.GRID, {
            visible: true,
          });
          await wait(1000);
        },
        async () => {
          // Verify that the template grid is visible
          const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
          console.log(`Found ${templateItems.length} templates`);
          return templateItems.length > 0;
        }
      );
  
      return true;
    } catch (error) {
      console.error("Error in navigateToTemplate:", error);
      throw error;
    }
}
async function handleTemplateActions(page, templateTitle) {
    try {
      // Wait for and verify the template grid
      await retry(
        async () => {
          await page.waitForSelector(SELECTORS.TEMPLATE.GRID_ITEM, {
            timeout: 10000,
          });
          const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
          console.log(`Found ${templateItems.length} templates`);
        },
        async () => {
          const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
          return templateItems.length > 0;
        }
      );
  
      // Find and click the correct template
      await retry(
        async () => {
          const targetTemplate = await findTemplate(page, templateTitle);
          if (!targetTemplate) {
            throw new Error(`Template "${templateTitle}" not found in the list`);
          }
  
          const linkHandle = await targetTemplate.$(SELECTORS.TEMPLATE.LINK);
          if (!linkHandle) {
            throw new Error(`Link not found for template "${templateTitle}"`);
          }
  
          await linkHandle.click();
          await page.waitForNavigation();
          await wait(2000);
        },
        async () => {
          // Verify that the template page has loaded
          const addToStoreButton = await page.$(SELECTORS.TEMPLATE.ADD_TO_STORE);
          return addToStoreButton !== null;
        }
      );
  
      // Wait for and click the "Add to Store" button
      await retry(
        async () => {
          const addToStoreButton = await page.waitForSelector(
            SELECTORS.TEMPLATE.ADD_TO_STORE,
            {
              visible: true,
            }
          );
          await page.waitForFunction(
            (button) => !button.disabled,
            {},
            addToStoreButton
          );
          await addToStoreButton.click();
          await wait(2000);
        },
        async () => {
        //   Verify that the modal has appeared
          const modalVisible = await page.evaluate(() => {
            const modal = document.querySelector("#fullscreen-modal-vue");
            return modal && window.getComputedStyle(modal).display !== "none";
          });
          return modalVisible;

        }
      );
      await selectWixStore(page);
      // Handle the modal
      await wait(2000);
      await handleModalButton(page, "proceed");
      await wait(2000);
  
      return true;
    } catch (error) {
      console.error("Error in handleTemplateActions:", error);
      throw error;
    }
  }
  
async function findTemplate(page, templateTitle) {
const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
for (const item of templateItems) {
    const linkHandle = await item.$(SELECTORS.TEMPLATE.LINK);
    if (linkHandle) {
    const linkText = await page.evaluate((el) => el.textContent.trim(), linkHandle);
    if (linkText === templateTitle) {
        return item;
    }
    }
}
return null;
}

async function handleModalButton(page, buttonText) {
const modalButtonSelector = `.modal-footer .pf-btn:contains("${buttonText}")`;
await retry(
    async () => {
    const modalButton = await ensureClickable(page, modalButtonSelector);
    await modalButton.click();
    },
    async () => {
    const modalVisible = await page.evaluate(() => {
        const modal = document.querySelector("#create-product-templates-disclaimer-modal");
        return modal && window.getComputedStyle(modal).display === "none";
    });
    return modalVisible;
    }
);
}
// async function handleTemplateActions(page, templateTitle) {
//     await page.waitForSelector(SELECTORS.TEMPLATE.GRID_ITEM, {
//       timeout: 10000,
//     });
//     const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
  
//     for (const item of templateItems) {
//       const linkHandle = await item.$(SELECTORS.TEMPLATE.LINK);
//       if (linkHandle) {
//         const linkText = await page.evaluate(
//           (el) => el.textContent.trim(),
//           linkHandle
//         );
//         if (linkText === templateTitle) {
//           await linkHandle.click();
//           await page.waitForNavigation();
//           await wait(2000);
//           const addToStoreButton = await page.waitForSelector(
//             SELECTORS.TEMPLATE.ADD_TO_STORE,
//             {
//               visible: true,
//             }
//           );
//           await page.waitForFunction(
//             (button) => !button.disabled,
//             {},
//             addToStoreButton
//           );
//           await addToStoreButton.click();
//           await wait(2000);
//           await handleModalButton(page, "proceed");
//           await wait(2000);
//           // await handleModalButton(page, "continue");
  
//           // Additional template processing steps...
//           return true;
//         }
//       }
//     }
//     return false;
// }


// Modal Actions
async function processModalButtons(page, buttonText) {
  try {
    console.log(`Looking for modal button with text: "${buttonText}"`);

    // Wait for modal to be fully visible
    await page.waitForSelector(SELECTORS.MODAL.CONTAINER, {
      visible: true,
      timeout: 5000,
    });
    await wait(3000); // Wait for modal animation

    // Define button selectors specific to your modal structure
    const buttonSelectors = [
      // Dynamic sticky footer buttons
      ".dynamic-sticky-footer .pf-btn",
      ".dynamic-sticky-footer .footer-double-button .pf-btn-primary",
      ".dynamic-sticky-footer .pf-btn-secondary",
      // Designer footer buttons
      ".designer-footer-buttons .pf-btn",
      ".designer-footer-buttons button",
      // Back button
      ".footer-back-btn",
      // Proceed button
      'button[data-test*="proceed-btn"]',
      // Generic button selectors within the modal
      `${SELECTORS.MODAL.CONTAINER} button`,
      `${SELECTORS.MODAL.CONTAINER} .pf-btn`,
      // XPath for exact text match
       // Exact class-based selector
        ".pf-btn.pf-btn-primary.pf-mr-12",
        // Tag and class selector (less specific)
        "a.pf-btn.pf-btn-primary",
        // Tag and href attribute selector
        'a[href="javascript:"]',
        // Tag, href, and class attribute selector
        'a[href="javascript:"][class="pf-btn pf-btn-primary pf-mr-12"]',
        // Using partial class match for buttons with `pf-btn-primary`
        ".pf-btn-primary",
        // XPath selector based on text content (useful for exact text match)
        // '//a[text()="Delete" and contains(@class, "pf-btn-primary")]',
        // XPath selector without text, based on classes
        // '//a[contains(@class, "pf-btn") and contains(@class, "pf-btn-primary") and contains(@class, "pf-mr-12")]'
    ];

    for (const selector of buttonSelectors) {
      try {
        console.log(`Trying selector: ${selector}`);

        // Handle XPath selectors
        const elements = selector.startsWith("//")
          ? await page.$(selector)
          : await page.$$(selector);

        for (const element of elements) {
          try {
            // Get text content based on selector type
            const elementText = selector.startsWith("//")
              ? await page.evaluate((el) => el.textContent.trim(), element)
              : await element.evaluate((el) => {
                  // Check for nested text content
                  const textContent = el.textContent.trim();
                  // Handle cases where text might be in nested elements
                  return textContent.replace(/\s+/g, " ").trim();
                });

            console.log(`Found button with text: "${elementText}"`);

            if (elementText.includes(buttonText)) {
              console.log(`Found matching button: "${buttonText}"`);

              // Check if button is visible and clickable
              const isVisible = await page.evaluate((el) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return (
                  rect.width > 0 &&
                  rect.height > 0 &&
                  style.visibility !== "hidden" &&
                  style.display !== "none" &&
                  !el.disabled
                );
              }, element);

              if (!isVisible) {
                console.log(
                  "Button is not visible or clickable, continuing search..."
                );
                continue;
              }

              // Scroll into view if needed

              await wait(500);
              await page.waitForFunction(
                (button) => !button.disabled,
                {},
                element
              );
              // Try multiple click methods
              try {
                // Method 1: Direct click with wait
                await element.click({
                  delay: 100,
                });
                console.log("Button clicked successfully (Method 1)");
                return true;
              } catch (clickError1) {
                try {
                  // Method 2: Click using page.evaluate
                  await page.evaluate((el) => {
                    el.click();
                  }, element);
                  console.log("Button clicked successfully (Method 2)");
                  return true;
                } catch (clickError2) {
                  try {
                    // Method 3: Click using JavaScript event
                    await page.evaluate((el) => {
                      const clickEvent = new MouseEvent("click", {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                      });
                      el.dispatchEvent(clickEvent);
                    }, element);
                    console.log("Button clicked successfully (Method 3)");
                    return true;
                  } catch (clickError3) {
                    // Method 4: Try clicking by position
                    const box = await element.boundingBox();
                    if (box) {
                      await page.mouse.click(
                        box.x + box.width / 2,
                        box.y + box.height / 2
                      );
                      console.log("Button clicked successfully (Method 4)");
                      return true;
                    }
                  }
                }
              }
            }
          } catch (elementError) {
            console.log("Error processing element:", elementError);
            continue;
          }
        }
      } catch (selectorError) {
        console.log("Error with selector:", selectorError);
        continue;
      }
    }

    console.log(`Button with text "${buttonText}" not found in modal`);
    return false;
  } catch (error) {
    console.error("Error in processModalButtons:", error);
    throw error;
  }
}
async function handleModalButton(page, buttonType) {
  const buttonMap = {
    proceed: "Proceed to mockups",
    back: "Back",
    done: "Done",
    save: "Save as template",
    savetemplate: "Save product template",
    "product save": "Save product",
    submit:'Submit to store',
    continue: "Continue",
  };

  const buttonText = buttonMap[buttonType.toLowerCase()];
  if (!buttonText) {
    throw new Error(`Unknown button type: ${buttonType}`);
  }

  return await processModalButtons(page, buttonText);
}



// Mockup Selection
async function handleMockupSelection(page, styleType = "ghost") {
  try {
    await clickChooseMockupsButton(page);
    // Additional mockup selection logic will be added here
    await wait(2000); // Wait for mockup grid to fully load
    const styleIdentifiers = {
      ghost: ["ghost/back", "ghost/front"],
      flat: ["flat/back", "flat/front"],
      mens: ["mens/back", "mens/front"],
      womens: ["womens/back", "womens/front"],
      lifestyle_mens: ["mens_lifestyle/front"],
      lifestyle_womens: ["womens_lifestyle/front"],
    };

    // Select the specified mockup style
    if (styleIdentifiers[styleType]) {
      await selectMockupStyle(page, styleIdentifiers[styleType]);
    } else {
      throw new Error(`Unknown style type: ${styleType}`);
    }
    await wait(2000);
    await selectMockupFormat(page);
    await wait(1000);
    await handleModalButton(page, "continue");
    return true;
  } catch (error) {
    console.error("Error in handleMockupSelection:", error);
    throw error;
  }
}
async function clickChooseMockupsButton(page) {
    try {
      console.log("Attempting to find and click Choose mockups button...");
  
      // Wait for any loading indicators to disappear
      try {
        await page.waitForSelector(SELECTORS.MOCKUP.LOADING_INDICATOR, {
          hidden: true,
          timeout: 5000,
        });
      } catch (loadingError) {
        console.log("No loading indicator found or already hidden");
      }
  
      // Multiple methods to find the Choose mockups button
      const buttonSelectors = [
        ".mockup-type-picker a.pf-btn.pf-btn-secondary.pf-btn-block--mobile",
        // Direct text content match
        'button:has-text("Choose mockups")',
        // Data test attribute if available
        'button[data-test="choose-mockups-btn"]',
        // Class-based selector if specific class exists
        ".mockup-selection-button",
        // XPath as fallback
        '//button[contains(text(), "Choose mockups")]',
      ];
      await wait(2000);
      let button = null;
      for (const selector of buttonSelectors) {
        try {
          button = await page.waitForSelector(selector, {
            visible: true,
            timeout: 5000,
          });
          if (button) {
            console.log(`Found button using selector: ${selector}`);
            break;
          }
        } catch (err) {
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }
  
      if (!button) {
        throw new Error("Choose mockups button not found with any selector");
      }
  
      // Ensure button is visible and clickable
      await page.evaluate((btn) => {
        if (btn) {
          btn.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, button);
  
      await wait(1000); // Wait for scroll to complete
  
      // Attempt to click the button using multiple methods
      try {
        // Method 1: Direct click
        await button.click({
          delay: 100,
        });
      } catch (clickError) {
        console.log("Direct click failed, trying alternative methods");
        try {
          // Method 2: Page click
          await page.click('button:has-text("Choose mockups")');
        } catch (pageClickError) {
          // Method 3: Evaluate click
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const chooseMockupsBtn = buttons.find(
              (btn) => btn.textContent.trim().toLowerCase() === "choose mockups"
            );
            if (chooseMockupsBtn) {
              chooseMockupsBtn.click();
            }
          });
        }
      }
      await wait(3000);
      // Verify that the click worked by waiting for the mockup grid
      // await page.waitForSelector(SELECTORS.MOCKUP.MOCKUP_GRID, {
      //     visible: true,
      //     timeout: 10000
      // });
  
      console.log("Successfully clicked Choose mockups button");
      return true;
    } catch (error) {
      console.error("Error in clickChooseMockupsButton:", error);
      throw error;
    }
}
async function selectMockupStyle(page, styleIdentifiers) {
    try {
      console.log("Attempting to select mockup style...");
  
      // Wait for preview containers to be loaded
      await page.waitForSelector(SELECTORS.MOCKUP.PREVIEW_CONTAINER, {
        visible: true,
        timeout: 10000,
      });
  
      // Get all preview containers
      const previewContainers = await page.$$(SELECTORS.MOCKUP.PREVIEW_CONTAINER);
      console.log(`Found ${previewContainers.length} preview containers`);
  
      for (const container of previewContainers) {
        try {
          // Get the background divs within this container
          const backgroundDivs = await container.$$(
            'div[style*="background-image"]'
          );
  
          // Check both background divs for matching identifiers
          let matchFound = false;
          for (const bgDiv of backgroundDivs) {
            const style = await page.evaluate(
              (el) => el.getAttribute("style"),
              bgDiv
            );
  
            // Check if any of the provided identifiers match the background image URL
            for (const identifier of styleIdentifiers) {
              if (style.includes(identifier)) {
                matchFound = true;
                break;
              }
            }
  
            if (matchFound) break;
          }
  
          if (matchFound) {
            // Find the parent mockup style div to click
            const parentSlide = await container.evaluateHandle((node) => {
              return node.closest(".slide-container");
            });
  
            if (parentSlide) {
              // Scroll the element into view
              await page.evaluate((el) => {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, parentSlide);
  
              await wait(1000);
  
              // Find and click the mockup style div
              const mockupStyleDiv = await parentSlide.$(
                ".mockup-style.mockup-slide"
              );
              if (mockupStyleDiv) {
                try {
                  await mockupStyleDiv.click();
  
                  // Verify selection by checking for active-style class
                  const isActive = await page.evaluate(
                    (el) => el.classList.contains("active-style"),
                    mockupStyleDiv
                  );
  
                  if (isActive) {
                    console.log("Successfully selected mockup style");
                    return true;
                  } else {
                    // Retry click if active class not added
                    await wait(500);
                    await mockupStyleDiv.click();
                  }
                } catch (clickError) {
                  console.log("Direct click failed, trying alternative method");
                  await page.evaluate((el) => el.click(), mockupStyleDiv);
                }
              }
            }
          }
        } catch (containerError) {
          console.log("Error processing container:", containerError);
          continue;
        }
      }
  
      throw new Error("No matching mockup style found");
    } catch (error) {
      console.error("Error in selectMockupStyle:", error);
      throw error;
    }
}
async function selectMockupFormat(page) {
    try {
      console.log("Attempting to select PNG format...");
  
      // Wait for the radio button to be present
      await page.waitForSelector("#is-png", {
        visible: true,
        timeout: 5000,
      });
  
      // Scroll the radio button into view if needed
      await page.evaluate(() => {
        const radio = document.querySelector("#is-png");
        if (radio) {
          radio.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
  
      await wait(1000); // Wait for scroll to complete
  
      // Try to click the radio button using multiple methods
      try {
        // Method 1: Direct click
        await page.click("#is-png");
      } catch (clickError) {
        console.log("Direct click failed, trying alternative methods");
        try {
          // Method 2: Evaluate click
          await page.evaluate(() => {
            const radio = document.querySelector("#is-png");
            if (radio) radio.click();
          });
        } catch (evalError) {
          // Method 3: Set checked property directly
          await page.evaluate(() => {
            const radio = document.querySelector("#is-png");
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(
                new Event("change", {
                  bubbles: true,
                })
              );
            }
          });
        }
      }
  
      // Verify selection
      const isSelected = await page.evaluate(() => {
        const radio = document.querySelector("#is-png");
        return radio && radio.checked;
      });
  
      if (!isSelected) {
        throw new Error("Failed to select PNG format");
      }
  
      console.log("Successfully selected PNG format");
      return true;
    } catch (error) {
      console.error("Error in selectMockupFormat:", error);
      throw error;
    }
}

//Product Detail Section
// async function selectProductCategory(page, categoryToSelect) {
//     try {
//       console.log("Attempting to select product category:", categoryToSelect);
  
//       // Wait for and click the dropdown button to open it
//       await page.waitForSelector('.dropdown-input__button', {
//         visible: true,
//         timeout: 5000
//       });
//       await page.click('.dropdown-input__button');
  
//       // Wait for the dropdown menu to be visible
//       await page.waitForSelector('.dropdown-input__menu--list', {
//         visible: true,
//         timeout: 5000
//       });
  
//       // Find and click the matching category checkbox
//       const categorySelected = await page.evaluate((category) => {
//         const menuItems = document.querySelectorAll('.dropdown-input__menu__item');
//         for (const item of menuItems) {
//           const label = item.querySelector('label');
//           if (label && label.textContent.trim() === category) {
//             const checkbox = item.querySelector('input[type="checkbox"]');
//             if (checkbox) {
//               checkbox.click();
//               return true;
//             }
//           }
//         }
//         return false;
//       }, categoryToSelect);
  
//       if (!categorySelected) {
//         throw new Error(`Category "${categoryToSelect}" not found in dropdown`);
//       }
  
//       // Click outside to close the dropdown (optional)
//       await page.evaluate(() => {
//         const button = document.querySelector('.dropdown-input__button');
//         if (button) button.click();
//       });
  
//       console.log("Successfully selected category:", categoryToSelect);
//       return true;
//     } catch (error) {
//       console.error("Error in selectProductCategory:", error);
//       throw error;
//     }
//   }
async function selectProductCategory(page, categoryToSelect) {
    try {
      console.log("Attempting to select product category:", categoryToSelect);
  
      // Wait for any dropdown button that contains "Choose categories"
      await page.waitForFunction(
        () => {
          const buttons = document.querySelectorAll('button[role="combobox"]');
          return Array.from(buttons).some(button => 
            button.textContent.trim().includes('Choose categories')
          );
        },
        { timeout: 5000 }
      );
  
      // Scroll to and click the dropdown button
      const buttonClicked = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button[role="combobox"]');
        for (const button of buttons) {
          if (button.textContent.trim().includes('Choose categories')) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => button.click(), 500); // Add small delay after scroll
            return true;
          }
        }
        return false;
      });
  
      if (!buttonClicked) {
        throw new Error('Could not find or click the category dropdown button');
      }
  
      await wait(1000); // Wait for dropdown to open
  
      // Wait for and verify the dropdown menu is visible
      await page.waitForFunction(
        () => {
          const menu = document.querySelector('.dropdown-input__menu--list');
          return menu && window.getComputedStyle(menu).display !== 'none';
        },
        { timeout: 5000 }
      );
  
      // Find and click the matching category checkbox
      const categorySelected = await page.evaluate((category) => {
        const menuItems = document.querySelectorAll('.dropdown-input__menu__item');
        for (const item of menuItems) {
          const label = item.querySelector('label');
          if (label && label.textContent.trim() === category) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.click();
              return true;
            }
          }
        }
        return false;
      }, categoryToSelect);
  
      if (!categorySelected) {
        throw new Error(`Category "${categoryToSelect}" not found in dropdown`);
      }
  
      // Optional: Close dropdown by clicking outside
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button[role="combobox"]');
        for (const button of buttons) {
          if (button.textContent.trim().includes('Choose categories')) {
            button.click();
            return;
          }
        }
      });
  
      console.log("Successfully selected category:", categoryToSelect);
      return true;
    } catch (error) {
      console.error("Error in selectProductCategory:", error);
      // Add retry logic
      try {
        console.log("Retrying category selection...");
        await wait(2000); // Wait before retry
        
        // Try one more time with a different approach
        await page.evaluate((category) => {
          const buttons = document.querySelectorAll('button[role="combobox"]');
          for (const button of buttons) {
            if (button.textContent.trim().includes('Choose categories')) {
              button.click();
            }
          }
          
          setTimeout(() => {
            const menuItems = document.querySelectorAll('.dropdown-input__menu__item');
            for (const item of menuItems) {
              const label = item.querySelector('label');
              if (label && label.textContent.trim() === category) {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.click();
              }
            }
          }, 1000);
        }, categoryToSelect);
        
        return true;
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        throw error; // Throw original error if retry fails
      }
    }
  }
async function inputProductTitle(page, title,category="") {
  try {
    console.log("Attempting to input product title...");

    // Wait for the title input field to be visible
    await page.waitForSelector("#product-push-title-input", {
      visible: true,
      timeout: 5000,
    });

    // Scroll the input into view if needed
    await page.evaluate(() => {
      const titleInput = document.querySelector("#product-push-title-input");
      if (titleInput) {
        titleInput.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });

    await wait(1000); // Wait for scroll to complete

    // Clear any existing value
    await page.evaluate(() => {
      const titleInput = document.querySelector("#product-push-title-input");
      if (titleInput) {
        titleInput.value = "";
      }
    });

    // Input the new title
    try {
      // Method 1: Type directly
      await page.type("#product-push-title-input", title, {
        delay: 50,
      });
    } catch (typeError) {
      console.log("Direct type failed, trying alternative method");
      // Method 2: Set value through evaluation
      await page.evaluate((inputTitle) => {
        const titleInput = document.querySelector("#product-push-title-input");
        if (titleInput) {
          titleInput.value = inputTitle;
          // Trigger input event to ensure form validation
          titleInput.dispatchEvent(
            new Event("input", {
              bubbles: true,
            })
          );
        }
      }, title);
    }

    // Verify the input
    const inputValue = await page.evaluate(() => {
      const titleInput = document.querySelector("#product-push-title-input");
      return titleInput ? titleInput.value : "";
    });

    if (inputValue !== title) {
      console.log("Direct type failed, trying alternative method");
      // throw new Error('Failed to input product title');
      await page.evaluate((inputTitle) => {
        const titleInput = document.querySelector("#product-push-title-input");
        if (titleInput) {
          titleInput.value = inputTitle;
          // Trigger input event to ensure form validation
          titleInput.dispatchEvent(
            new Event("input", {
              bubbles: true,
            })
          );
        }
      }, title);
    }
    // Select category if provided
    if (category) {
        await selectProductCategory(page, category);
    }
    console.log("Successfully input product title:", title);
    return true;
  } catch (error) {
    console.error("Error in inputProductTitle:", error);
    throw error;
  }
}
async function handleProductDetails(page) {
  try {
    await inputProductTitle(page, "New Test Product","Cropped T-Shirt");
    // Additional mockup selection logic will be added here
    await wait(2000); // Wait for mockup grid to fully load
    await handleModalButton(page, "continue");
    await wait(2000);
    await handleProductPricing(page);

    return true;
  } catch (error) {
    console.error("Error in handleProductDetails:", error);
    throw error;
  }
}
async function handleProductPricing(page) {
  try {
    await handleModalButton(page, "submit");
    return true;
  } catch (error) {
    console.error("Error in handleProductDetails:", error);
    throw error;
  }
}


// Template Deletion
async function deleteTemplate(page) {
  try {
    console.log("Attempting to delete template...");
    // Wait for the template view container and scroll it into view
    await page.waitForSelector(SELECTORS.TEMPLATE_VIEW.CONTAINER, {
      visible: true,
      timeout: 10000,
    });

    await page.evaluate((selector) => {
      const container = document.querySelector(selector);
      if (container) {
        container.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, SELECTORS.TEMPLATE_VIEW.CONTAINER);

    await wait(2000); // Wait for scroll to complete

    // Find the dropdown toggle and its parent container
    const dropdownToggle = await page.waitForSelector(
      SELECTORS.TEMPLATE_VIEW.DROPDOWN_TOGGLE,
      {
        visible: true,
        timeout: 5000,
      }
    );

    if (!dropdownToggle) {
      throw new Error("Dropdown toggle button not found");
    }

    // First, ensure the dropdown container has the necessary classes
    await page.evaluate(() => {
      const dropdownToggleElement = document.querySelector(
        'a[data-test="dPfKn2n8wXKSCJw"]'
      );
      if (dropdownToggleElement) {
        const dropdownContainer = dropdownToggleElement.closest(
          ".pf-dropdown.dropdown-button"
        );
        if (dropdownContainer) {
          // Add the required classes to keep the dropdown open
          dropdownContainer.className =
            "pf-dropdown dropdown-button dropdown open";
        }
      }
    });

    // Click the dropdown toggle
    try {
      await dropdownToggle.click();
    } catch (clickError) {
      console.log("Direct click failed, trying alternative method");
      await page.evaluate(() => {
        const toggle = document.querySelector('a[data-test="dPfKn2n8wXKSCJw"]');
        if (toggle) toggle.click();
      });
    }

    await wait(1000); // Wait for dropdown to open

    // Ensure dropdown stays open by maintaining the classes
    await page.evaluate(() => {
      const dropdownContainer = document.querySelector(
        ".pf-dropdown.dropdown-button"
      );
      if (dropdownContainer) {
        dropdownContainer.className =
          "pf-dropdown dropdown-button dropdown open";
      }
    });

    // Now wait for and click the delete button
    const deleteButton = await page.waitForSelector(
      SELECTORS.TEMPLATE_VIEW.DELETE_BUTTON,
      {
        visible: true,
        timeout: 5000,
      }
    );

    if (!deleteButton) {
      throw new Error("Delete button not found");
    }

    // Try clicking the delete button
    try {
      await deleteButton.click();
      await deleteTemplateModal(page, "Yes, delete");
    } catch (clickError) {
      console.log("Direct click failed, trying alternative method");
      await page.evaluate(async () => {
        const deleteBtn = document.querySelector(
          'a[data-test="product-template-item-delete"]'
        );
        if (deleteBtn) {
          deleteBtn.click();
          await wait(3000);
          await deleteTemplateModal(page, "Yes, delete");
        }
      });
      await page.waitForSelector(".modal-dialog", {
        hidden: true,
        timeout: 5000,
      });
    }

    console.log("Successfully clicked delete button");
    return true;
  } catch (error) {
    console.error("Error in deleteTemplate:", error);
    throw error;
  }
}
async function deleteTemplateModal(page, buttonText) {
  try {
    console.log("Attempting to delete template from modal...");

    // Wait for the specific modal to be visible
    const modalSelector = "#product-templates-deleting-dialog";
    await page.waitForSelector(modalSelector, {
      visible: true,
      timeout: 10000,
    });

    await wait(1000); // Wait for any animations

    // More specific selectors based on the actual HTML structure
    const deleteButtonSelectors = [
      // Primary selector based on exact structure
      "#product-templates-deleting-dialog .modal-footer .pf-btn-primary",

      // Backup selectors with attributes
      "#product-templates-deleting-dialog button[data-v-8367d3a0][data-v-6e3a7269].pf-btn-primary",

      // Text-based selector as fallback
      '#product-templates-deleting-dialog button.pf-btn-primary:has-text("Yes, delete")',

      // Full path selector
      "#product-templates-deleting-dialog .modal-content .modal-footer .modal-footer-buttons .pf-btn-primary",
    ];
    await wait(1000);
    for (const selector of deleteButtonSelectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        await wait(1000);
        const elements = selector.startsWith("//")
          ? await page.$(selector)
          : await page.$$(selector);
        for (const element of elements) {
          try {
            // Get text content based on selector type
            const elementText = selector.startsWith("//")
              ? await page.evaluate((el) => el.textContent.trim(), element)
              : await element.evaluate((el) => {
                  // Check for nested text content
                  const textContent = el.textContent.trim();
                  // Handle cases where text might be in nested elements
                  return textContent.replace(/\s+/g, " ").trim();
                });

            console.log(`Found button with text: "${elementText}"`);

            if (elementText.includes(buttonText)) {
              console.log(`Found matching button: "${buttonText}"`);

              // Check if button is visible and clickable
              const isVisible = await page.evaluate((el) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return (
                  rect.width > 0 &&
                  rect.height > 0 &&
                  style.visibility !== "hidden" &&
                  style.display !== "none" &&
                  !el.disabled
                );
              }, element);

              if (!isVisible) {
                console.log(
                  "Button is not visible or clickable, continuing search..."
                );
                continue;
              }

              // Scroll into view if needed
              await page.evaluate((el) => {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, element);
              await wait(500);
              await page.waitForFunction(
                (button) => !button.disabled,
                {},
                element
              );
              // Try multiple click methods
              try {
                // Method 1: Direct click with wait
                await element.click({
                  delay: 100,
                });
                console.log("Button clicked successfully (Method 1)");
                return true;
              } catch (clickError1) {
                try {
                  // Method 2: Click using page.evaluate
                  await page.evaluate((el) => {
                    el.click();
                  }, element);
                  console.log("Button clicked successfully (Method 2)");
                  return true;
                } catch (clickError2) {
                  try {
                    // Method 3: Click using JavaScript event
                    await page.evaluate((el) => {
                      const clickEvent = new MouseEvent("click", {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                      });
                      el.dispatchEvent(clickEvent);
                    }, element);
                    console.log("Button clicked successfully (Method 3)");
                    return true;
                  } catch (clickError3) {
                    // Method 4: Try clicking by position
                    const box = await element.boundingBox();
                    if (box) {
                      await page.mouse.click(
                        box.x + box.width / 2,
                        box.y + box.height / 2
                      );
                      console.log("Button clicked successfully (Method 4)");
                      return true;
                    }
                  }
                }
              }
            }
          } catch (elementError) {
            console.log("Error processing element:", elementError);
            continue;
          }
        }
      } catch (selectorError) {
        console.log("Error with selector:", selectorError.message);
        continue;
      }
    }

    console.log("Failed to click delete button with all methods");
    return false;
  } catch (error) {
    console.error("Error in deleteTemplateModal:", error);
    throw error;
  }
}

// Product Deletion
async function clickModalDeleteButton(page) {
    try {
      // Wait for modal to be fully visible
    //   await page.waitForSelector('.modal-footer', {
    //     visible: true,
    //     timeout: 5000
    //   });
      await wait(3000); // Wait for modal animation
  
      // Define comprehensive button selectors
      const deleteButtonSelectors = [
        // Exact match based on your HTML
        'a.pf-btn.pf-btn-primary.pf-mr-12',
        // More general selectors
        ".modal-footer .pf-btn",
        ".modal-footer .pf-btn-primary",
        ".modal-footer button",
        'button[data-test*="delete-btn"]',
        // XPath selectors for text-based matching
        '//a[text()="Delete" and contains(@class, "pf-btn-primary")]',
        '//button[text()="Delete"]'
      ];
  
      for (const selector of deleteButtonSelectors) {
        try {
          console.log(`Trying selector: ${selector}`);
  
          // Handle XPath selectors
          const elements = selector.startsWith("//")
            ? await page.$(selector)
            : await page.$$(selector);
  
          for (const element of elements) {
            try {
              // Get text content based on selector type
              const elementText = selector.startsWith("//")
                ? await page.evaluate((el) => el.textContent.trim(), element)
                : await element.evaluate((el) => {
                    const textContent = el.textContent.trim();
                    return textContent.replace(/\s+/g, " ").trim();
                  });
  
              console.log(`Found button with text: "${elementText}"`);
  
              if (elementText.toLowerCase().includes("delete")) {
                console.log(`Found matching delete button`);
  
                // Check if button is visible and clickable
                const isVisible = await page.evaluate((el) => {
                  const rect = el.getBoundingClientRect();
                  const style = window.getComputedStyle(el);
                  return (
                    rect.width > 0 &&
                    rect.height > 0 &&
                    style.visibility !== "hidden" &&
                    style.display !== "none" &&
                    !el.disabled
                  );
                }, element);
  
                if (!isVisible) {
                  console.log(
                    "Button is not visible or clickable, continuing search..."
                  );
                  continue;
                }
  
                // Scroll into view if needed
                await page.evaluate((el) => {
                  el.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, element);
                await wait(500);
  
                // Wait for button to be enabled
                await page.waitForFunction(
                  (button) => !button.disabled,
                  {},
                  element
                );
  
                // Try multiple click methods
                try {
                  // Method 1: Direct click with wait
                  await element.click({
                    delay: 100,
                  });
                  console.log("Delete button clicked successfully (Method 1)");
                  return true;
                } catch (clickError1) {
                  try {
                    // Method 2: Click using page.evaluate
                    await page.evaluate((el) => {
                      el.click();
                    }, element);
                    console.log("Delete button clicked successfully (Method 2)");
                    return true;
                  } catch (clickError2) {
                    try {
                      // Method 3: Click using JavaScript event
                      await page.evaluate((el) => {
                        const clickEvent = new MouseEvent("click", {
                          view: window,
                          bubbles: true,
                          cancelable: true,
                        });
                        el.dispatchEvent(clickEvent);
                      }, element);
                      console.log("Delete button clicked successfully (Method 3)");
                      return true;
                    } catch (clickError3) {
                      // Method 4: Try clicking by position
                      const box = await element.boundingBox();
                      if (box) {
                        await page.mouse.click(
                          box.x + box.width / 2,
                          box.y + box.height / 2
                        );
                        console.log("Delete button clicked successfully (Method 4)");
                        return true;
                      }
                    }
                  }
                }
              }
            } catch (elementError) {
              console.log("Error processing element:", elementError);
              continue;
            }
          }
        } catch (selectorError) {
          console.log("Error with selector:", selectorError);
          continue;
        }
      }
  
      console.log("Delete button not found in modal");
      return false;
    } catch (error) {
      console.error("Error in clickModalDeleteButton:", error);
      throw error;
    }
  }
async function deleteProduct(page, templateTitle) {
    try {
      // Wait for the product list to be visible
      await page.waitForSelector(SELECTORS.PRODUCT.LIST, {
        visible: true,
      });
      await wait(4000);
  
      const productRows = await page.$$(SELECTORS.PRODUCT.ROW);
      console.log(`Found ${productRows.length} product rows`);
      const ProductTableHeader = await page.$(SELECTORS.PRODUCT.HEADER);
  
      await page.evaluate((el) => {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, ProductTableHeader);
      await wait(2000);
  
      for (const row of productRows) {
        try {
          const titleHandle = await row.$(SELECTORS.PRODUCT.TITLE);
          if (!titleHandle) {
            console.log("Title handle not found for row");
            continue;
          }
  
          const productTitle = await page.evaluate(
            (el) => el.textContent.trim(),
            titleHandle
          );
          console.log(productTitle, "product Title ");
          if (productTitle !== templateTitle) {
            console.log(`Title mismatch: ${productTitle}`);
            continue;
          }
  
          // Scroll the row into view and wait for any animations to complete
          await page.evaluate((el) => {
            el.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, row);
          await wait(1000); // Wait for scroll to complete
  
          // Ensure checkbox is visible and clickable
          // await selectCheckbox(page,"")
          const checkbox = await row.$(SELECTORS.PRODUCT.CHECKBOX);
          if (!checkbox) {
            console.log("Checkbox not found for matching product");
            continue;
          }
  
          // Check if checkbox is visible and enabled
          const isClickable = await page.evaluate((el) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0" &&
              rect.width > 0 &&
              rect.height > 0 &&
              !el.disabled
            );
          }, checkbox);
  
          if (!isClickable) {
            console.log("Checkbox is not clickable");
            continue;
          }
  
          // Try multiple click methods
          try {
            // Method 1: Direct click
            await checkbox.click({
              delay: 100,
            });
          } catch (clickError) {
            console.log("Direct click failed, trying alternative methods");
            try {
              // Method 2: Click using page.evaluate
              await page.evaluate((el) => el.click(), checkbox);
            } catch (evalClickError) {
              // Method 3: JavaScript click with position
              await page.evaluate((el) => {
                const rect = el.getBoundingClientRect();
                const event = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: rect.left + rect.width / 2,
                  clientY: rect.top + rect.height / 2,
                });
                el.dispatchEvent(event);
              }, checkbox);
            }
          }
  
          // Verify if checkbox was actually selected
          const isChecked = await page.evaluate((el) => el.checked, checkbox);
          if (!isChecked) {
            console.log("Checkbox click did not register, retrying...");
            await wait(500);
            await checkbox.click({
              delay: 100,
            });
  
            // Final check
            const finalCheck = await page.evaluate((el) => el.checked, checkbox);
            if (!finalCheck) {
              console.log("Failed to select checkbox after retry");
              continue;
            }
          }
  
          console.log(`Successfully selected product: ${templateTitle}`);
          try {
            // Wait for the save button to be visible
            await page.waitForSelector("#delete", {
              visible: true,
            });
  
            // Scroll the button into view if needed
            await page.evaluate(() => {
              const button = document.querySelector("#delete");
              if (button) {
                button.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            });
  
            await wait(1000); // Wait for any animations
  
            // Try clicking the button
            try {
              // First attempt: direct click
              await page.click("#delete");
            } catch (buttonClickError) {
              console.log(
                "Direct button click failed, trying alternative method"
              );
              // Second attempt: evaluate click
              await page.evaluate(() => {
                const button = document.querySelector("#delete");
                if (button) button.click();
              });
            }
  
            console.log("Successfully clicked Save as templates button");
            // return true;
            // Wait for modal to appear and be visible
            // await wait(5000);
            await wait(2000);
            console.log("clucking checkbox");
  
            // Wait for and click the confirmation checkbox
            const checkboxSelector = '.delete-modal-label input[type="checkbox"]';
            await page.waitForSelector(checkboxSelector, {
              visible: true,
              timeout: 5000,
            });
            console.log("visisble checkbox");
  
            // Try multiple methods to check the checkbox
            try {
              // Method 1: Direct click on checkbox
              await page.click(checkboxSelector);
              console.log("clicked checkbox");
            } catch (error) {
              console.log(
                "Direct checkbox click failed, trying alternative methods"
              );
              try {
                // Method 2: Click using evaluate
                await page.evaluate((selector) => {
                  const checkbox = document.querySelector(selector);
                  if (checkbox) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(
                      new Event("change", {
                        bubbles: true,
                      })
                    );
                  }
                }, checkboxSelector);
              } catch (evalError) {
                // Method 3: Click on the label instead
                await page.click(".delete-modal-label");
              }
            }
  
            // Verify checkbox is checked
            const isChecked = await page.evaluate((selector) => {
              const checkbox = document.querySelector(selector);
              return checkbox && checkbox.checked;
            }, checkboxSelector);
  
            if (!isChecked) {
              console.log("Failed to check the confirmation checkbox");
              return false;
            }
  
            console.log("Successfully checked the confirmation checkbox");
            await wait(1000);
            // Wait for the Delete button to become enabled (no longer has 'disabled' class)
            await page.waitForFunction(
              () => {
                const deleteButton = document.querySelector(
                  ".modal-footer .pf-btn-primary"
                );
                return (
                  deleteButton && !deleteButton.classList.contains("disabled")
                );
              },
              {
                timeout: 5000,
              }
            );
            console.log("button is enabled");
  
            // Click the Delete button
            // await page.click('.modal-footer .pf-btn-primary');
  
            // Wait for potential loading state or confirmation
            // await wait(2000);
            // const modalDelButtonSelector = ".modal-footer a.pf-btn.pf-btn-primary.pf-mr-12";
            // const modalDelButtonSelector = `.modal-footer .pf-btn:contains("Delete")`;
            // // const modalDelButton = await page.waitForSelector(modalDelButtonSelector, {
            //     //   visible: true,
            //     //   timeout: 5000,
            //     // });
                
            //     try {
            //         // First attempt: direct click
            //         const modalDelButton = await ensureClickable(page, modalDelButtonSelector);
            //         await modalDelButton.click();
            //         await wait(1000);
            // //   await modalDelButton.click();
            // } catch (modalButtonClickError) {
            //   console.log(
            //     "Direct modal button click failed, trying alternative method"
            //   );
            //   // Second attempt: evaluate click
            //   await page.evaluate(() => {
            //     const button = document.querySelector(
            //      `.modal-footer .pf-btn:contains("Delete")`
            //     );
            //     if (button) button.click();
            //   });
            // }
            await clickModalDeleteButton(page);
            console.log("Successfully initiated product deletion");
            return true;
          } catch (buttonError) {
            console.error(
              "Error clicking Save as templates button:",
              buttonError
            );
            break;
            // throw buttonError;
          }
        } catch (rowError) {
          console.error("Error processing row:", rowError);
          continue;
        }
      }
      console.log(`Product "${templateTitle}" not found in list`);
      return false;
    } catch (error) {
      console.error("Error in selectProduct:", error);
      throw error;
    }
}
async function test(email, password, templateTitle, title) {
  const { browser, page } = await initializeBrowser();

  try {
    await login(page, email, password);
    // await navigateToCatalog(page,'AS Color 4062')
    // await navigateToStore(page, "anxil's Store");
    // await wait(2000);
    // await selectProduct(page, templateTitle);
    await wait(2000);
    await navigateToTemplate(page);
    await wait(1000);
    await handleTemplateActions(page, "Women’s crop top");
    await wait(2000);
    await handleMockupSelection(page, "flat");
    await wait(2000);
    await handleProductDetails(page);
    await wait(2000);
    // await deleteTemplate(page);
    // await wait(2000);
    // await navigateToStore(page, "anxil's Store");
    // await wait(2000);
    // await deleteProduct(page, templateTitle);

    // Additional workflow steps...
  } catch (error) {
    console.error("An error occurred during the process:", error);
    throw error;
  }
}
app.post("/getData", async (req, res) => {
  const { email, password } = req.body;
  const templateTitle = "Hooded long-sleeve tee copy";
  const title = "Test Product Hooded long-sleeve tee";

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
