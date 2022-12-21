const { getPage, clickXpath, waitForSelector } = require('./browser');
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
        await page.type("#inputEmailHandle", getUser(CRAIGSLIST_KEY), typingConfig)
        await page.type("#inputPassword", getPassword(CRAIGSLIST_KEY), typingConfig)
        await page.click("#login");
        await page.waitForSelector('button[value=go]');
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
        await page.goto(CRAIGSLIST_URL, { waitUntil: "networkidle2" });
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies(CRAIGSLIST_KEY));
        const response = await page.goto(CRAIGSLIST_URL, { waitUntil: "networkidle2" });
        if (response.status() === 302) {
            // Cookies were stale
            await login(page);
            await page.goto(CRAIGSLIST_URL, { waitUntil: "networkidle2" });
        }
    }

    console.log('click the post "go" button');
    await page.click('button[value=go]');
    await page.waitForXPath(`//label[contains(.,'east bay area')]`);

    console.log('choose east bay');
    await clickXpath(page, `//label[contains(.,'east bay area')]`);
    await page.waitForXPath(`//label[contains(.,'berkeley')]`);

    console.log('choose berkeley');
    await clickXpath(page, `//label[contains(.,'berkeley')]`);
    await page.waitForXPath(`//label[contains(.,'for sale by owner')]`);

    console.log('choose for sale by owner');
    await clickXpath(page, `//label[contains(.,'for sale by owner')]`);
    await page.waitForXPath(`//label[contains(.,'free stuff')]`);

    console.log(`choose category '${category}'`);
    if (price === "0") {
        await clickXpath(page, `//label[contains(.,'free stuff')]`);
    } else {
        await clickXpath(page, `//label[contains(.,'${category}')]`);
    }

    await page.waitForSelector('input[name="PostingTitle"]');

    console.log('fill title');
    await page.focus('input[name="PostingTitle"]');
    await page.keyboard.sendCharacter(title);
    // await page.type('input[name="PostingTitle"]', title, typingConfig);

    console.log('fill price');
    if (price !== "0") {
        await page.type('input[name="price"]', price, typingConfig);
    }

    // console.log('fill geo area');
    // await page.type('input[name="geographic_area"]', ' ', typingConfig);

    console.log('fill postal code');
    await page.type('input[name="postal"]', HOME_POSTAL_CODE, typingConfig);

    console.log('fill description');
    await page.focus('textarea[name="PostingBody"]');
    await page.keyboard.sendCharacter(description);

    // TODO: condition

    console.log('click "go" to go to next page');
    await page.click('button[name="go"][value="continue"]');
    await page.waitForSelector('button.continue');

    // TODO??: fill in cross street
    console.log('skipping cross street');
    console.log('click "continue" to go to next page');
    await page.click('button.continue');

    await page.waitForSelector('div[id=uploader]');
    await page.waitForSelector('input[type=file]');
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

    console.log('wait for button "Done with Images"');
    await page.waitForSelector('button[name="go"][type="submit"][value="Done with Images"]');
    console.log('click button "Done with Images"');
    await page.click('button[name="go"][type="submit"][value="Done with Images"]');

    await page.waitForSelector('button[name="go"][value="Continue"]');

    console.log('submit');
    await page.click('button[name="go"][value="Continue"]');
    // TODO: instead wait for next page to load, and check for success message like text "Thanks for posting! We really appreciate it."
    await page.waitForTimeout(1000);

    console.log('get the post url');
    await page.goto(CRAIGSLIST_URL, { waitUntil: "networkidle2" });
    await waitForSelector(page, 'tr.posting-row', 'active posts page load')
    // relies on the most recent post being the one we just made, and being first in page order
    const newPostUrl = await page.evaluate(() => document.querySelector('td.title.active').querySelector('a').href);
    await browser.close();
    return newPostUrl;
};

module.exports = {
    submitCraigslist,
}
