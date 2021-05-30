const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { username, password } = require('../config/secrets.json');
const cookies = require('../config/cookies.json');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const NEXTDOOR_URL = 'https://nextdoor.com/for_sale_and_free/?init_source=more_menu';
const GLOBAL_DELAY = 20;
const TYPING_DELAY = 5;

const typingConfig = { delay: TYPING_DELAY };

const nextdoorCategories = {
    luggageCovers: "Luggage Covers",
};

const nextdoorConditions = {
    usedLikeNew: "Used - Like New",
};

const formData = {
    title: "Test Title",
    price: "100",
    category: nextdoorCategories.luggageCovers,
    condition: nextdoorConditions.usedLikeNew,
    description: `Test
next line.
last line`
};

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const uploadsDir = __dirname + '/../uploads';

const submitnextdoor = async () => {

    let browser = await puppeteer.launch({
        headless: false,
        slowMo: GLOBAL_DELAY,
        executablePath: CHROME_PATH,
    });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.nextdoor.com", []);
    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(20000);
    await page.setViewport({ width: 1200, height: 800 });

    if (!Object.keys(cookies).length) {
        await page.goto("https://www.nextdoor.com/login", { waitUntil: "networkidle2" });
        await page.type("#id_email", username, typingConfig)
        await page.type("#id_password", password, typingConfig)
        await page.click("#signin_button");
        await page.waitForNavigation({ waitUntil: "networkidle0" });
        await page.waitForTimeout(5000);
        try {
            await page.waitForSelector('.header-bar-logo');
        } catch (err) {
            console.log("failed to login");
            process.exit(0);
        }
        let currentCookies = await page.cookies();
        writeFileSync(__dirname + '/../config/cookies.json', JSON.stringify(currentCookies));
    } else{
        //User Already Logged In
            await page.setCookie(...cookies);
            await page.goto("https://www.nextdoor.com/", { waitUntil: "networkidle2" });
    }

    await page.goto(nextdoor_URL, { waitUntil: "networkidle2" });

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
    submitnextdoor,
}
