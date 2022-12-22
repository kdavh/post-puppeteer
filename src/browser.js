const puppeteer = require('puppeteer');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const GLOBAL_DELAY = 20;

const getPage = async () => {
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
    await page.setViewport({ width: 1200, height: 700 });

    return {page, browser};
};

const waitForXPath = async (page, xpath, description = '') => {
    console.log(`waiting for (xpath: "${xpath}") (${description})`);
    return await page.waitForXPath(xpath);
}

const clickXPath = async (page, xpath, description = '') => {
    console.log(`finding (xpath: "${xpath}") (${description})`);
    const [el] = await page.$x(xpath);
    console.log(`clicking (xpath: "${xpath}")`);
    await el.click();
}

const waitThenclickXPath = async (page, xpath, description = '') => {
    await waitForXPath(page, xpath, description);
    await clickXPath(page, xpath, '⇑⇑⇑');
}

const waitForSelector = async (page, selector, description = '') => {
    console.log(`waiting for (selector: "${selector}") (${description})`);
    return await page.waitForSelector(selector);
}

const clickSelector = async (page, selector, description = '') => {
    console.log(`clicking (selector: "${selector}") (${description})`);
    return await page.click(selector);
}

const waitThenClickSelector = async (page, selector, description = '') => {
    await waitForSelector(page, selector, description);
    await clickSelector(page, selector, '⇑⇑⇑');
}

const pasteIntoSelector = async (page, selector, text, description = '') => {
    console.log(`pasting text into (selector: "${selector}") (${description})`);
    await page.focus(selector);
    await page.keyboard.sendCharacter(text);
}

const typeIntoSelector = async (page, selector, text, description = '') => {
    console.log(`typing text into (selector: "${selector}") (${description})`);
    await page.type(selector, text)
}

// Useful??
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

module.exports = {
    getPage,
    clickXPath,
    waitForSelector,
    pasteIntoSelector,
    typeIntoSelector,
    waitForXPath,
    clickSelector,
    waitThenClickSelector,
    waitThenclickXPath,
}
