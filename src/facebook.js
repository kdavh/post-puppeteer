// const clipboardy = require('clipboardy');

const { getPage } = require('./browser');
const { FACEBOOK_KEY } = require('./const');
const { getUser, getPassword, getCookies, setCookies } = require('./login');

const FACEBOOK_URL = 'https://www.facebook.com/marketplace/create/item';
const TYPING_DELAY = -1;

const typingConfig = {
    delay: TYPING_DELAY,
};

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

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
        await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies(FACEBOOK_KEY));
        const response = await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
        if (response.status() === 302) {
            // Cookies were stale
            await login(page);
            await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
        }
    }

    // await page.click('[aria-label="Category"] input')
    await page.type('[aria-label="Category"] input', category, typingConfig)
    // one option should be showing, click it
    // await page.click('[aria-label="1 suggested search"] [role=option]')

    await page.click('[aria-label="Condition"]')
    await page.waitForTimeout(100);
    let [menuItem] = await page.$x(`//*[contains(@role, "menuitemradio")][contains(., '${condition}')]`);
    // some race condition means this sometimes needs two clicks
    if (!menuItem) {
        console.log('Retrying condition menu click');
        await page.waitForTimeout(100);
        await page.click('[aria-label="Condition"]')
        await page.waitForTimeout(100);
        [menuItem] = await page.$x(`//div[contains(@role, "menuitemradio")][contains(., '${condition}')]`);
    }
    // console.log(menuItem);
    menuItem.click();
    await page.waitForTimeout(100);
    // await page.waitForTimeout(10000);

    // if I don't click first, the *second* character of input is missing
    await page.click('[aria-label="Title"] input');
    await page.type('[aria-label="Title"] input', title, typingConfig);
    await page.type('[aria-label="Price"] input', price, typingConfig);
    // TODO: find a faster way
    await page.type('[aria-label="Description"] textarea', description, typingConfig)


    for( const fileToUpload of pics ) {
        const inputUploadHandle = await page.$('input[type=file]');

        // Sets the value of the file input to fileToUpload
        inputUploadHandle.uploadFile(fileToUpload);
        await page.waitForTimeout(500);
    }

    await page.click('[aria-label="Next"]')
    // some sort of async loading thing happens, so wait a healthy amount before trying to press
    await page.waitForTimeout(4000);
    await page.click('[aria-label="Publish"]')
    // await page.screenshot({path: 'pic.png'});

    // wait for posting list page to load, signifying done
    await page.waitForSelector('[aria-label="Mark as Sold"]');

    // get listing url
    await page.goto('https://www.facebook.com/marketplace/you/selling', { waitUntil: "networkidle2" });
    await page.click(`[aria-label="${title}"]`);

    await page.waitForSelector('[href*="/marketplace/item/"]');
    const newPostUrl = await page.evaluate(_ => document.querySelector('[href*="/marketplace/item/"]').href);

    //Close Browser
    await browser.close();

    return newPostUrl;
};

module.exports = {
    submitFacebook,
}
