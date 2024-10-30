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
      await fn();
      // If verification function is provided, check if action was successful
      if (verifyFn) {
        const isSuccess = await verifyFn();
        if (!isSuccess) {
          throw new Error("Action verification failed");
        }
      }
      return;
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

// async function navigateToStore(page, storeName) {
//   await page.waitForSelector(SELECTORS.NAVIGATION.STORES);
//   await page.click(SELECTORS.NAVIGATION.STORES);
//   await wait(3000);

//   await page.waitForSelector(SELECTORS.STORE.CONTAINER, {
//     visible: true,
//   });
//   await wait(1000);

//   const storeCards = await page.$$(SELECTORS.STORE.CARD);
//   for (const card of storeCards) {
//     const titleHandle = await card.$(SELECTORS.STORE.TITLE);
//     if (titleHandle) {
//       const storeTitle = await page.evaluate(
//         (el) => el.textContent.trim(),
//         titleHandle
//       );
//       if (storeTitle === storeName) {
//         const viewStoreButton = await card.$(SELECTORS.STORE.VIEW_BUTTON);
//         if (viewStoreButton) {
//           await viewStoreButton.click();
//           return true;
//         }
//       }
//     }
//   }
//   return false;
// }
async function verifyStoreNavigation(page, expectedStoreName) {
  await wait(2000); // Wait for any animations/transitions

  try {
    // Verify we're on the correct store page
    const currentUrl = await page.url();
    if (!currentUrl.includes("/store")) {
      throw new Error("Not on store page");
    }

    // Verify store name is displayed correctly
    const storeNameExists = await page.evaluate((storeName) => {
      const storeElements = Array.from(document.querySelectorAll(
        '[data-testid="store-name"], .store-name, .store-title'
      ));
      return storeElements.some(el => 
        el.textContent.trim().toLowerCase() === storeName.toLowerCase()
      );
    }, expectedStoreName);

    if (!storeNameExists) {
      throw new Error(`Store "${expectedStoreName}" not found on page`);
    }

    // Verify store content is loaded
    const hasStoreContent = await page.evaluate(() => {
      return document.querySelector('.store-content, [data-testid="store-content"]') !== null;
    });

    if (!hasStoreContent) {
      throw new Error("Store content not loaded");
    }

    return true;
  } catch (error) {
    console.log('Store verification failed:', error.message);
    return false;
  }
}

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
        // Verify stores container is visible
        const isStoresVisible = await page.evaluate(() => {
          const storesContainer = document.querySelector('[data-testid="stores-container"]');
          return storesContainer !== null && 
                 window.getComputedStyle(storesContainer).display !== 'none';
        });
        return isStoresVisible;
      }
    );

    // Wait for and verify store container
    await retry(
      async () => {
        await page.waitForSelector(SELECTORS.STORE.CONTAINER, {
          visible: true,
        });
        await wait(1000);
      },
      async () => {
        return await page.evaluate((selector) => {
          const container = document.querySelector(selector);
          return container !== null && 
                 window.getComputedStyle(container).display !== 'none';
        }, SELECTORS.STORE.CONTAINER);
      }
    );

    // Find and click the correct store card
    await retry(
      async () => {
        const storeCards = await page.$$(SELECTORS.STORE.CARD);
        let storeFound = false;

        for (const card of storeCards) {
          const titleHandle = await card.$(SELECTORS.STORE.TITLE);
          if (titleHandle) {
            const storeTitle = await page.evaluate(
              (el) => el.textContent.trim(),
              titleHandle
            );
            
            if (storeTitle === storeName) {
              const viewStoreButton = await ensureClickable(
                page, 
                `${SELECTORS.STORE.CARD}:has(${SELECTORS.STORE.TITLE}:text-is("${storeName}")) ${SELECTORS.STORE.VIEW_BUTTON}`
              );
              await viewStoreButton.click();
              storeFound = true;
              break;
            }
          }
        }

        if (!storeFound) {
          throw new Error(`Store "${storeName}" not found in the list`);
        }
      },
      async () => {
        // Use the comprehensive verification function
        return await verifyStoreNavigation(page, storeName);
      }
    );
    await retry(
      async () => {
        const storeCard = await findStoreCard(page, storeName);
        if (!storeCard) {
          throw new Error(`Store "${storeName}" not found in the list`);
        }

        const viewStoreButton = await storeCard.$(SELECTORS.STORE.VIEW_BUTTON);
        if (!viewStoreButton) {
          throw new Error(`View button not found for store "${storeName}"`);
        }

        await viewStoreButton.click();
      },
      async () => {
        return await verifyStoreNavigation(page, storeName);
      }
    );
    return true;
  } catch (error) {
    console.error("Store navigation failed:", error.message);
    throw error;
  }
}

// Helper function to find store card by name
async function findStoreCard(page, storeName) {
  try {
    const cards = await page.$$(SELECTORS.STORE.CARD);
    for (const card of cards) {
      const titleHandle = await card.$(SELECTORS.STORE.TITLE);
      if (titleHandle) {
        const title = await page.evaluate(el => el.textContent.trim(), titleHandle);
        if (title === storeName) {
          return card;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Error finding store card: ${error.message}`);
    return null;
  }
}
async function navigateToTemplate(page) {
  try {
    // Navigate to templates page
    await page.waitForSelector(SELECTORS.TEMPLATE.SIDEBAR_LINK, {
      visible: true,
    });
    await page.click(SELECTORS.TEMPLATE.SIDEBAR_LINK);
    console.log("Clicked on Product templates menu item");
    await wait(3000);
    // Wait for template grid to be visible
    await page.waitForSelector(SELECTORS.TEMPLATE.GRID, {
      visible: true,
    });
    await wait(1000);
    console.log("Template grid is visible");

    // Get all template items
    const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);
    console.log(`Found ${templateItems.length} templates`);
    return true;
  } catch (error) {
    console.error("Error in navigateToTemplate:", error);
    throw error;
  }
}
async function selectProduct(page, templateTitle) {
  try {
    // Wait for the product list to be visible
    await page.waitForSelector(SELECTORS.PRODUCT.LIST, {
      visible: true,
    });
    await wait(2000);

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
          await page.waitForSelector("#create-product-templates", {
            visible: true,
          });

          // Scroll the button into view if needed
          await page.evaluate(() => {
            const button = document.querySelector("#create-product-templates");
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
            await page.click("#create-product-templates");
          } catch (buttonClickError) {
            console.log(
              "Direct button click failed, trying alternative method"
            );
            // Second attempt: evaluate click
            await page.evaluate(() => {
              const button = document.querySelector(
                "#create-product-templates"
              );
              if (button) button.click();
            });
          }

          console.log("Successfully clicked Save as templates button");
          // return true;
          // Wait for modal to appear and be visible
          await page.waitForSelector(
            "#create-product-templates-disclaimer-modal",
            {
              visible: true,
              timeout: 5000,
            }
          );
          console.log("Modal is visible");

          // Wait a moment for modal animation to complete
          await wait(1000);

          // Click the "Save as template" button in the modal
          const modalSaveButtonSelector = ".modal-footer .pf-btn-primary";
          await page.waitForSelector(modalSaveButtonSelector, {
            visible: true,
          });

          try {
            // First attempt: direct click
            await page.click(modalSaveButtonSelector);
          } catch (modalButtonClickError) {
            console.log(
              "Direct modal button click failed, trying alternative method"
            );
            // Second attempt: evaluate click
            await page.evaluate(() => {
              const button = document.querySelector(
                ".modal-footer .pf-btn-primary"
              );
              if (button) button.click();
            });
          }

          console.log("Successfully clicked Save as template button in modal");
          return true;
        } catch (buttonError) {
          console.error(
            "Error clicking Save as templates button:",
            buttonError
          );
          throw buttonError;
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
          await wait(5000);
          await wait(4000);
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
          const modalDelButtonSelector = ".modal-footer .pf-btn-primary";
          await wait(4000);
          await page.waitForSelector(modalDelButtonSelector, {
            visible: true,
            timeout: 5000,
          });

          try {
            // First attempt: direct click
            await page.click(modalDelButtonSelector);
          } catch (modalButtonClickError) {
            console.log(
              "Direct modal button click failed, trying alternative method"
            );
            // Second attempt: evaluate click
            await page.evaluate(() => {
              const button = document.querySelector(
                ".modal-footer .pf-btn-primary"
              );
              if (button) button.click();
            });
          }
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
    "product save": "Save product",
    continue: "Continue",
  };

  const buttonText = buttonMap[buttonType.toLowerCase()];
  if (!buttonText) {
    throw new Error(`Unknown button type: ${buttonType}`);
  }

  return await processModalButtons(page, buttonText);
}
async function handleTemplateActions(page, templateTitle) {
  await page.waitForSelector(SELECTORS.TEMPLATE.GRID_ITEM, {
    timeout: 10000,
  });
  const templateItems = await page.$$(SELECTORS.TEMPLATE.GRID_ITEM);

  for (const item of templateItems) {
    const linkHandle = await item.$(SELECTORS.TEMPLATE.LINK);
    if (linkHandle) {
      const linkText = await page.evaluate(
        (el) => el.textContent.trim(),
        linkHandle
      );
      if (linkText === templateTitle) {
        await linkHandle.click();
        await page.waitForNavigation();
        await wait(2000);
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
        await handleModalButton(page, "proceed");
        await wait(2000);
        // await handleModalButton(page, "continue");

        // Additional template processing steps...
        return true;
      }
    }
  }
  return false;
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
// Usage example:
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
async function inputProductTitle(page, title) {
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

    console.log("Successfully input product title:", title);
    return true;
  } catch (error) {
    console.error("Error in inputProductTitle:", error);
    throw error;
  }
}
async function handleProductDetails(page) {
  try {
    await inputProductTitle(page, "New Test Product");
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
    await handleModalButton(page, "product save");
    return true;
  } catch (error) {
    console.error("Error in handleProductDetails:", error);
    throw error;
  }
}
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
// async function test(email, password, templateTitle, title) {
//     const {
//         browser,
//         page
//     } = await initializeBrowser();

//     try {
//         await login(page, email, password);
//         await navigateToStore(page, "anxil's Store");
//         // await wait(2000);
//         // await selectProduct(page, templateTitle);
//         // await wait(2000);
//         // await navigateToTemplate(page);
//         // await wait(1000);
//         // await handleTemplateActions(page, templateTitle);
//         // await wait(2000);
//         // await handleMockupSelection(page, 'flat');
//         // await wait(2000);
//         // await handleProductDetails(page);
//         // await wait(2000);
//         // await deleteTemplate(page);
//         // await wait(2000);
//         // await navigateToStore(page, "anxil's Store");
//         await wait(2000);
//         await deleteProduct(page, templateTitle);

//         // Additional workflow steps...
//     } catch (error) {
//         console.error("An error occurred during the process:", error);
//         throw error;
//     }
// }
// Generic retry wrapper function
async function withRetry(
  actionName,
  action,
  verificationFn,
  maxRetries = 10,
  retryDelay = 2000
) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      console.log(`${actionName}: Attempt ${attempts + 1} of ${maxRetries}`);

      // Execute the action
      await action();

      // If verification function is provided, check if action was successful
      if (verificationFn) {
        const isSuccessful = await verificationFn();
        if (isSuccessful) {
          console.log(`${actionName}: Action completed successfully`);
          return true;
        }
        throw new Error("Verification failed");
      }

      return true;
    } catch (error) {
      attempts++;
      console.error(
        `${actionName}: Attempt ${attempts} failed:`,
        error.message
      );

      if (attempts >= maxRetries) {
        console.error(
          `${actionName}: Max retries (${maxRetries}) reached. Action failed.`
        );
        throw new Error(
          `${actionName} failed after ${maxRetries} attempts: ${error.message}`
        );
      }

      console.log(`${actionName}: Retrying in ${retryDelay}ms...`);
      await wait(retryDelay);
    }
  }
}

// Modified test function with retry mechanism
// async function test(email, password, templateTitle, title) {
//     const { browser, page } = await initializeBrowser();

//     try {
//         // Login with retry
//         await withRetry('Login',
//             () => login(page, email, password),
//             async () => {
//                 try {
//                     // Verify login by checking for a dashboard element
//                     await page.waitForSelector('.dashboard-element', { timeout: 5000 });
//                     return true;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Navigate to store with retry
//         await withRetry('Navigate to Store',
//             () => navigateToStore(page, "anxil's Store"),
//             async () => {
//                 try {
//                     // Verify navigation by checking for store-specific element
//                     await page.waitForSelector(SELECTORS.PRODUCT.LIST, { timeout: 5000 });
//                     return true;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Select product with retry
//         await withRetry('Select Product',
//             () => selectProduct(page, templateTitle),
//             async () => {
//                 try {
//                     // Verify product selection by checking for selected state
//                     const checkbox = await page.$(SELECTORS.PRODUCT.CHECKBOX);
//                     const isChecked = await page.evaluate(el => el.checked, checkbox);
//                     return isChecked;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Navigate to template with retry
//         await withRetry('Navigate to Template',
//             () => navigateToTemplate(page),
//             async () => {
//                 try {
//                     // Verify template navigation
//                     await page.waitForSelector('.template-page-indicator', { timeout: 5000 });
//                     return true;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Handle template actions with retry
//         await withRetry('Template Actions',
//             () => handleTemplateActions(page, templateTitle),
//             async () => {
//                 try {
//                     // Verify template actions completed
//                     const templateElement = await page.$(`[data-template-title="${templateTitle}"]`);
//                     return !!templateElement;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Handle mockup selection with retry
//         await withRetry('Mockup Selection',
//             () => handleMockupSelection(page, 'flat'),
//             async () => {
//                 try {
//                     // Verify mockup selection
//                     const selectedMockup = await page.$('.selected-mockup-indicator');
//                     return !!selectedMockup;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Handle product details with retry
//         await withRetry('Product Details',
//             () => handleProductDetails(page),
//             async () => {
//                 try {
//                     // Verify product details saved
//                     const savedIndicator = await page.$('.details-saved-indicator');
//                     return !!savedIndicator;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Delete template with retry
//         await withRetry('Delete Template',
//             () => deleteTemplate(page),
//             async () => {
//                 try {
//                     // Verify template deletion
//                     const templateExists = await page.$(`[data-template-title="${templateTitle}"]`);
//                     return !templateExists;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Navigate back to store with retry
//         await withRetry('Navigate to Store',
//             () => navigateToStore(page, "anxil's Store"),
//             async () => {
//                 try {
//                     await page.waitForSelector(SELECTORS.PRODUCT.LIST, { timeout: 5000 });
//                     return true;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//         // Delete product with retry
//         await withRetry('Delete Product',
//             () => deleteProduct(page, templateTitle),
//             async () => {
//                 try {
//                     // Verify product deletion
//                     const productExists = await page.$(`[data-product-title="${templateTitle}"]`);
//                     return !productExists;
//                 } catch {
//                     return false;
//                 }
//             }
//         );

//     } catch (error) {
//         console.error("An error occurred during the process:", error);
//         throw error;
//     } finally {
//         await browser.close();
//     }
// }
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
    await wait(2000);
    await handleMockupSelection(page, "flat");
    await wait(2000);
    await handleProductDetails(page);
    await wait(2000);
    await deleteTemplate(page);
    await wait(2000);
    await navigateToStore(page, "anxil's Store");
    await wait(2000);
    await deleteProduct(page, templateTitle);

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
