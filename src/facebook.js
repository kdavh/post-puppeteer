// const clipboardy = require('clipboardy');

const { getPage } = require('./browser');
const { FACEBOOK_KEY } = require('./const');
const { getUser, getPassword, getCookies, setCookies } = require('./login');
const { typeIntoSelector, waitForXPath, pasteIntoSelector, clickSelector, waitForSelector, waitThenClickSelector } = require('./browser');

const FACEBOOK_NEW_LISTING_URL = 'https://www.facebook.com/marketplace/create/item';
const TYPING_DELAY = -1;

const typingConfig = {
    delay: TYPING_DELAY,
};

const login = async (page) => {
    try {
        await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
        await page.type("#email", getUser(FACEBOOK_KEY), typingConfig)
        await page.type("#pass", getPassword(FACEBOOK_KEY), typingConfig)
        await page.click("#loginbutton");
        await page.waitForNavigation({ waitUntil: "networkidle0" });
        await page.waitForTimeout(5000);
        try {
            await page.waitForSelector('[aria-label="Home"]');
        } catch (err) {
            console.log("failed to login");
            process.exit(0);
        }
        let currentCookies = await page.cookies();

        // save for later
        setCookies(FACEBOOK_KEY, currentCookies);
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

const submitFacebook = async (formData) => {
    const {title, price, category, condition, description, pics} = formData;

    const {page, browser} = await getPage();

    if (!getCookies(FACEBOOK_KEY).length) {
        await login(page);
        await page.goto(FACEBOOK_NEW_LISTING_URL, { waitUntil: "networkidle2" });
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies(FACEBOOK_KEY));
        const response = await page.goto(FACEBOOK_NEW_LISTING_URL, { waitUntil: "networkidle2" });
        if (response.status() === 302) {
            // Cookies were stale
            await login(page);
            await page.goto(FACEBOOK_NEW_LISTING_URL, { waitUntil: "networkidle2" });
        }
    }

    await typeIntoSelector(page, '[aria-label="Category"] input', category);
    // one option should be showing, click it
    const categoryEl = await waitForXPath(page, `//*[contains(@role, "option")][contains(., "${category}")]`);
    await categoryEl.click();


    await clickSelector(page, '[aria-label="Condition"]', 'condition dropdown');
    const conditionEl = await waitForXPath(page, `//*[contains(@role, "option")][contains(., "${condition}")]`);
    await conditionEl.click();

    await pasteIntoSelector(page, '[aria-label="Title"] input', title, 'title input');
    await pasteIntoSelector(page, '[aria-label="Price"] input', price, 'price input');
    await pasteIntoSelector(page, '[aria-label="Description"] textarea', description, 'Description field')

    for( const fileToUpload of pics ) {
        const inputUploadHandle = await page.$('input[type=file]');

        // Sets the value of the file input to fileToUpload
        await inputUploadHandle.uploadFile(fileToUpload);
    }
    await waitThenClickSelector(
        page, '[aria-label="Next"]:not([aria-disabled="true"])',
        'Next button (enabled) on the photos and attributes page');

    await waitForSelector(page, '[aria-label="Location"]', 'Location field on the location and shipping page');
    await clickSelector(page, '[aria-label="Next"]:not([aria-disabled="true"])', 'Next button on the location and shipping page')


    await waitThenClickSelector(page, '[aria-label="Publish"]:not([aria-disabled="true"])', 'Publish button on the confirmation / share page');

    // wait for posting list page to load, signifying done
    await waitForSelector(page, '[aria-label="Mark as Sold"]', '"Mark as sold" button on the listing completed page');

    // get listing url
    await page.goto('https://www.facebook.com/marketplace/you/selling', { waitUntil: "networkidle2" });
    await waitThenClickSelector(page, `[aria-label="${title}"]`);

    await waitForSelector(page, '[href*="/marketplace/item/"]');
    const newPostUrl = await page.evaluate(_ => document.querySelector('[href*="/marketplace/item/"]').href);

    //Close Browser
    await browser.close();

    return newPostUrl;
};

module.exports = {
    submitFacebook,
}
