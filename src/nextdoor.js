const { getPage } = require('./browser');
const { NEXTDOOR_KEY } = require('./const');
const { getUser, getPassword, getCookies, setCookies } = require('./login');
const { typeIntoSelector, waitForXPath, pasteIntoSelector, clickSelector, waitForSelector, waitThenClickSelector, waitThenclickXPath } = require('./browser');

const NEXTDOOR_ITEMS_URL = 'https://nextdoor.com/for_sale_and_free/your_items/';

const login = async (page) => {
    try {
        await page.goto("https://www.nextdoor.com/login");
        await waitForSelector(page, "[id=id_email]")
        await pasteIntoSelector(page, "[id=id_email]", getUser(NEXTDOOR_KEY))
        await pasteIntoSelector(page, "[id=id_password]", getPassword(NEXTDOOR_KEY))
        await clickSelector(page, "[id=signin_button]");
        await waitForSelector(page, "[id=main_content]", "The main content at the top of the page just after login");
        let currentCookies = await page.cookies();

        // save for later
        console.log('saving cookies')
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
        await page.goto(NEXTDOOR_ITEMS_URL);
    } else{
        //User Already Logged In
        await page.setCookie(...getCookies(NEXTDOOR_KEY));
        const response = await page.goto(NEXTDOOR_ITEMS_URL);
        if (response.status() === 302) {
            // Cookies were stale
            await login(page);
            await page.goto(NEXTDOOR_ITEMS_URL);
        }
    }

    // TODO: make this more robust, maybe have a second way of selecting the button so that if one way breaks, we can try the other, and fix it without things first breaking
    await waitThenclickXPath(
        page, `//button[contains(.,'Post a listing')]`, 'The "Post a listing" button in the top right of the items list page');

    console.log('weird donation modal pops up, close it');
    await waitThenclickXPath(page, `//a[contains(.,'Not interested in donating now')]`, 'bypass button on weird donation modal');

    // sometimes category button doesn't show up immediately?
    await waitThenClickSelector(page, `button[data-testid="category-selection-field"]`, 'category dropdown menu')
    await waitThenClickSelector(page, `input[data-testid="${category}"]`, 'category menu item');

    await pasteIntoSelector(page, '[data-testid="classified-title-input"]', title, 'title input');

    if (price === "0") {
        await clickSelector(page, 'input[name="price"][type="checkbox"]', '"it is free" checkbox');
    } else {
        await pasteIntoSelector(page, '[data-testid="postbox-price-input"]', price, 'price input');
    }

    // not last so pics have time to upload
    console.log(`upload pics ${pics}`);
    for( const pic of pics ) {
        const inputUploadHandle = await page.$('input[id=photo-input]');

        // Sets the value of the file input to pic
        await inputUploadHandle.uploadFile(pic);
    }

    console.log('wait for pics to fully upload')
    while (true) {
        // wait for the image to be fully uploaded, checking for preview with delete button before proceeding
        if ((await page.$$('button.postbox-remove-attachment')).length >= pics.length) {
            break;
        }
        await page.waitForTimeout(100);
    }

    await pasteIntoSelector(page, '[data-testid="classified-detail-input"]', description, 'description input');

    await waitThenClickSelector(page, '[data-testid="content-composer-dialog"] button.postbox-submit', 'submit button');

    await waitForSelector(page, '[id="social-sharing-modal-content"]', 'sharing modal that shows up after submitting a post is successful');
    await clickSelector(page, '[data-testid="composer-close-button"]', 'close button on sharing modal');

    await page.goto(NEXTDOOR_ITEMS_URL);
    // TODO: does this handle quotation marks in the title okay? does it need to?
    await waitForXPath(page, `//a[contains(.,"${title}")]`, 'new post link')
    const newPostUrl = await page.evaluate(() => document.querySelector('a.fsf-item-detail-link').href);
    await browser.close();

    return newPostUrl;
};

module.exports = {
    submitNextdoor,
}
