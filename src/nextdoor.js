const { getPage } = require('./browser');
const { NEXTDOOR_KEY } = require('./const');
const { getUser, getPassword, getCookies, setCookies } = require('./login');

const NEXTDOOR_URL = 'https://nextdoor.com/for_sale_and_free/your_items/';
const TYPING_DELAY = 0;

const typingConfig = { delay: TYPING_DELAY };

function waitForXPath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const login = async (page) => {
    try {
        await page.goto("https://www.nextdoor.com/login", { waitUntil: "networkidle2" });
        await page.type("#id_email", getUser(NEXTDOOR_KEY), typingConfig)
        await page.type("#id_password", getPassword(NEXTDOOR_KEY), typingConfig)
        await page.click("#signin_button");
        await page.waitForTimeout(1000);
        await page.waitForNavigation({ waitUntil: "networkidle0" });
        // try {
        //     await page.waitForSelector('.header-bar-logo');
        // } catch (err) {
        //     console.log("failed to login");
        //     process.exit(0);
        // }
        let currentCookies = await page.cookies();

        // save for later
        setCookies(NEXTDOOR_KEY, currentCookies);
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

const submitNextdoor = async (formData) => {
    const {title, price, category, condition, description, pics} = formData;

    const {page, browser} = await getPage();

    if (!getCookies(NEXTDOOR_KEY).length) {
        await login(page);
        await page.goto(NEXTDOOR_URL, { waitUntil: "networkidle2" });
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies(NEXTDOOR_KEY));
        const response = await page.goto(NEXTDOOR_URL, { waitUntil: "networkidle2" });
        if (response.status() === 302) {
            // Cookies were stale
            await login(page);
            await page.goto(NEXTDOOR_URL, { waitUntil: "networkidle2" });
        }
    }

    await page.waitForTimeout(100);
    await page.click('#main_content');

    console.log('weird donation modal pops up, close it');
    await page.waitForXPath(`//a[contains(.,'Not interested in donating now')]`);
    await page.waitForTimeout(1000);
    const [donateModalClose] = await page.$x(`//a[contains(.,'Not interested in donating now')]`);
    donateModalClose.click()

    console.log('fill category');
    // sometimes category button doesn't show up immediately?
    await page.waitForTimeout(1000);
    const [categoryButton] = await page.$x(`//span[contains(text(),'Choose category')]`)
    await categoryButton.click();
    await page.waitForSelector(`[data-testid="${category}"]`);
    await page.click(`[data-testid="${category}"]`);

    console.log('fill title');
    await page.waitForTimeout(100);
    await page.type('[data-testid="classified-title-input"]', title, typingConfig);

    console.log('fill price');
    await page.waitForTimeout(100);
    if (price === "0") {
        await page.click('[name="price"][type="checkbox"]');
    } else {
        await page.type('[data-testid="postbox-price-input"]', price, typingConfig);
    }

    // not last so pics have time to upload
    console.log('upload pics');
    for( const pic of pics ) {
        await page.waitForTimeout(100);
        const inputUploadHandle = await page.$('input[aria-label="Add photos"]');

        // Sets the value of the file input to pic
        inputUploadHandle.uploadFile(pic);
        await page.waitForTimeout(500);
    }

    console.log('fill description');
    await page.waitForTimeout(100);
    // await page.evaluate((description) => {
    //     console.log(description);
    //     document.querySelector('[data-testid="classified-detail-input"]').value = description;
    // }, description);
    await page.type('[data-testid="classified-detail-input"]', description, typingConfig);

    console.log('submit');
    await page.waitForTimeout(100);
    await page.click('button.postbox-submit')
    await page.waitForTimeout(3000);

    console.log('get the post url');
    await page.goto(NEXTDOOR_URL, { waitUntil: "networkidle2" });
    await page.waitForSelector('.fsf-item-detail-link')
    await page.waitForTimeout(100);
    const newPostUrl = await page.evaluate(() => document.querySelector('.fsf-item-detail-link').href);
    browser.close();
    return newPostUrl;
};

module.exports = {
    submitNextdoor,
}
