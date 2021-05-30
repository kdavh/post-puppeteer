const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { getUser, getPassword, getCookies, setCookies } = require('./login');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FACEBOOK_URL = 'https://www.facebook.com/marketplace/create/item';
const GLOBAL_DELAY = 20;
const TYPING_DELAY = 5;

const typingConfig = { delay: TYPING_DELAY };

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const uploadsDir = __dirname + '/../uploads';

const loginFacebook = async (page) => {
    try {
        await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
        await page.type("#email", getUser(), typingConfig)
        await page.type("#pass", getPassword(), typingConfig)
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

        setCookies('facebook', currentCookies);
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

const submitFacebook = async (formData) => {
    console.log(getUser());

    process.exit();
    let browser = await puppeteer.launch({
        headless: false,
        slowMo: GLOBAL_DELAY,
        executablePath: CHROME_PATH,
    });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.facebook.com", []);
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
    await page.setDefaultNavigationTimeout(20000);
    await page.setViewport({ width: 1200, height: 800 });

    if (!getCookies()) {
        await loginFacebook(page);
        await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies());
        const response = await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
        if (response.status() === 302) {
            // Cookies were stale
            await loginFacebook(page);
            await page.goto(FACEBOOK_URL, { waitUntil: "networkidle2" });
        }
    }

    await page.type('[aria-label="Title"] input', formData.title, typingConfig)
    await page.type('[aria-label="Price"] input', formData.price, typingConfig)
    await page.type('[aria-label="Category"] input', formData.category, typingConfig)
    await page.type('[aria-label="Description"] textarea', formData.description, typingConfig)

    // click once to close the Category dropdown
    await page.click('[aria-label="Condition"]')
    await page.click('[aria-label="Condition"]')
    const [menuItem] = await page.$x(`//div[contains(@role, "menu")]/div/div/div/div/div[contains(., '${formData.condition}')]`);
    // console.log('Condition menu item:');
    // console.log(menuItem);
    menuItem.click();

    const filesToUpload = await fs.promises.readdir( uploadsDir );

    for( const file of filesToUpload ) {
        const fileToUpload = path.join( uploadsDir, file );
        const inputUploadHandle = await page.$('input[type=file]');

        // Sets the value of the file input to fileToUpload
        inputUploadHandle.uploadFile(fileToUpload);
        await page.waitForTimeout(500);
    }

    await page.click('[aria-label="Next"]')
    await page.waitForTimeout(1000);
    // await page.click('[aria-label="Publish"]')
    // await page.screenshot({path: 'pic.png'});

    //Close Browser
    // await browser.close();
};

module.exports = {
    submitFacebook,
}
