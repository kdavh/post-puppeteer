const { getPage, clickXPath, waitForSelector, clickSelector, waitThenClickSelector, pasteIntoSelector, waitForXPath, waitThenclickXPath } = require('./browser');
const { CRAIGSLIST_KEY } = require('./const');
const { getUser, getPassword, getCookies, setCookies } = require('./login');

const CRAIGSLIST_URL = 'https://accounts.craigslist.org/login/home';
const TYPING_DELAY = 0;
const HOME_POSTAL_CODE = '94703';

const typingConfig = { delay: TYPING_DELAY };

// function waitForXPath(path) {
//     return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
// }

const login = async (page) => {
    try {
        await page.goto("https://accounts.craigslist.org/login", { waitUntil: "networkidle2" });
        await pasteIntoSelector(page, "#inputEmailHandle", getUser(CRAIGSLIST_KEY), 'email/username input');
        await pasteIntoSelector(page, "#inputPassword", getPassword(CRAIGSLIST_KEY), 'password input')
        await clickSelector(page, "#login", 'login button');
        await waitForSelector(page, 'button[value=go]', 'post "go" button');
        let currentCookies = await page.cookies();

        // save for later
        setCookies(CRAIGSLIST_KEY, currentCookies);
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

const submitCraigslist = async (formData) => {
    const {title, price, category, condition, description, pics} = formData;

    const {page, browser} = await getPage();

    if (!getCookies(CRAIGSLIST_KEY).length) {
        await login(page);
        await page.goto(CRAIGSLIST_URL);
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies(CRAIGSLIST_KEY));
        const response = await page.goto(CRAIGSLIST_URL);
        // redirect is transparent to puppeteer, so we have to check the end url
        if (response.url().startsWith('https://accounts.craigslist.org/login?')) {
            // Cookies were stale
            await login(page);
            await page.goto(CRAIGSLIST_URL);
        }
    }

    await waitThenClickSelector(page, 'button[value=go]', 'post "go" button');

    // TODO: assumes user has default area chosen.  If they don't, this will fail.
    await waitThenclickXPath(page, `//label[contains(.,'east bay area')]`, 'east bay location category');

    await waitThenclickXPath(page, `//label[contains(.,'berkeley')]`, 'berkeley location category');

    await waitThenclickXPath(page, `//label[contains(.,'for sale by owner')]`, 'for sale by owner category');

    await waitForXPath(page, `//label[contains(.,'free stuff')]`, 'categories list');
    if (price === "0") {
        await clickXPath(page, `//label[contains(.,'free stuff')]`);
    } else {
        await clickXPath(page, `//label[@class="radio-option"][contains(.,'${category}')]`);
    }

    await page.waitForSelector('input[name="PostingTitle"]');
    await pasteIntoSelector(page, 'input[name="PostingTitle"]', title, 'title input');
    // await page.type('input[name="PostingTitle"]', title, typingConfig);

    if (price !== "0") {
        await pasteIntoSelector(page, 'input[name="price"]', price, 'price input');
    }

    await pasteIntoSelector(page, 'input[name="postal"]', HOME_POSTAL_CODE, 'postal code input');

    await pasteIntoSelector(page, 'textarea[name="PostingBody"]', description, 'post description input');

    // TODO: condition

    // TODO: add these values to preferences.yaml
    await clickSelector(page, 'input[type="checkbox"][name="show_address_ok"][value="1"]', 'show address checkbox');
    await pasteIntoSelector(page, 'input[name="xstreet0"]', 'Rose', 'cross street 0 input');
    await pasteIntoSelector(page, 'input[name="xstreet1"]', 'Sacramento', 'cross street 1 input');
    await pasteIntoSelector(page, 'input[name="city"]', 'Berkeley', 'city input');

    await clickSelector(page, 'button[name="go"][value="continue"]', 'button to continue to location options');

    await waitThenClickSelector(page, 'button.continue', 'button to continue to images');

    await waitForSelector(page, 'div[id=uploader]', 'uploader div');
    await waitForSelector(page, 'input[type=file]', 'uploader input');

    // not last so pics have time to upload
    console.log('upload pics');
    for( const pic of pics ) {
        const inputUploadHandle = await page.$('input[type=file]');

        // Sets the value of the file input to pic
        await inputUploadHandle.uploadFile(pic);
    }

    while (true) {
        // wait for the image to be fully uploaded, checking for preview with delete button before proceeding
        if ((await page.$$('button[name=go][title="delete image"')).length >= pics.length) {
            break;
        }
        await page.waitForTimeout(100);
    }

    await waitThenClickSelector(page, 'button[name="go"][type="submit"][value="Done with Images"]', 'done with images button');

    await waitThenClickSelector(page, 'button[name="go"][value="Continue"]', 'submit post');

    await waitForSelector(page, 'a[href*="craigslist.org/manage/"]', 'link to manage the new post')
    const newPostUrl = await page.evaluate(() => document.querySelector('a[href*="craigslist.org/manage/"]').href);
    await browser.close();
    return newPostUrl;
};

module.exports = {
    submitCraigslist,
}
