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

module.exports = {
    getPage,
}
