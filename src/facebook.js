// const clipboardy = require('clipboardy');

const { getPage } = require('./browser');
const { FACEBOOK_KEY } = require('./const');
const { categories } = require('./lookups');
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

    url = FACEBOOK_NEW_LISTING_URL;
    // TODO: this needs more work to work.  This form doesn't have category, instead make, model, year
    if (category === categories['motorcycles']) {
        url = 'https://www.facebook.com/marketplace/create/vehicle';
    }

    const {page, browser} = await getPage();

    if (!getCookies(FACEBOOK_KEY).length) {
        await login(page);
        await page.goto(url, { waitUntil: "networkidle2" });
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies(FACEBOOK_KEY));
        const response = await page.goto(url, { waitUntil: "networkidle2" });
        if (response.status() === 302) {
            // Cookies were stale
            await login(page);
            await page.goto(url, { waitUntil: "networkidle2" });
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

    for( const i in pics ) {
        const inputUploadHandle = await page.$('input[type=file]');

        // Sets the value of the file input to fileToUpload
        await inputUploadHandle.uploadFile(pics[i]);
        // TODO: bug where the UI freezes, something wrong with jpg / jpeg.  Even when I resize in Preview to smaller quality
        while (true) {
            await page.waitForTimeout(100);
            // wait for the image to be fully uploaded, checking for preview with delete button before proceeding.  This may not be needed as the issue is jpg breakage, but keeping in for now.
            if ((await page.$$('[role="progressbar"][aria-label="Loading..."]')).length === 0) {
                break;
            }
            console.log(`waiting for image ${i} to show as uploaded...`)
        }
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
