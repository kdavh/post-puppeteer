const { FACEBOOK_KEY, NEXTDOOR_KEY, CRAIGSLIST_KEY } = require('./const');

const WOMENS_PANTS = "womens-pants"
const WOMENS_HANDBAGS = "womens-handbags"
const WOMENS_SHOES_FLATS = "womens-shoes-flats"
const BABY_CLOTHING_SHOES = "baby-clothing-shoes"
const BABY_AND_KID = "baby-and-kid"
const MOTORCYCLES = "motorcycles"
const OTHER = "other"

const categories = {
    [WOMENS_PANTS]: true,
    [WOMENS_HANDBAGS]: true,
    [WOMENS_SHOES_FLATS]: true,
    [BABY_CLOTHING_SHOES]: true,
    [BABY_AND_KID]: true,
    [MOTORCYCLES]: true,
    [OTHER]: true,
};

const conditions = {
    "new": true,
    "like-new": true,
    "excellent": true,
    "good": true,
    "fair": true,
    "salvage": true,
};

const storeCategories = {
    [FACEBOOK_KEY]: {
        [WOMENS_PANTS]: "Women's Pants",
        [WOMENS_HANDBAGS]: "Other Women's Accessories",
        [WOMENS_SHOES_FLATS]: "Women's Flats",
        [BABY_CLOTHING_SHOES]: "Girls' Dresses", // "Other Baby Clothing & Shoes",
        [BABY_AND_KID]: "Girls' Dresses",  // not correct, rough approximation
        [OTHER]: "Women's Dresses",
        [MOTORCYCLES]: {
            url: "https://www.facebook.com/marketplace/create/vehicle",
            // TODO: year, make, model
        },
    },
    [NEXTDOOR_KEY]: {
        [WOMENS_PANTS]: "Clothing & accessories",
        [WOMENS_HANDBAGS]: "Clothing & accessories",
        [WOMENS_SHOES_FLATS]: "Clothing & accessories",
        [BABY_CLOTHING_SHOES]: "Baby & kids",
        [BABY_AND_KID]: "Baby & kids",
        [OTHER]: "Other",
        [MOTORCYCLES]: "Automotive",
    },
    [CRAIGSLIST_KEY]: {
        [WOMENS_PANTS]: "clothing & accessories - by owner",
        [WOMENS_HANDBAGS]: "clothing & accessories - by owner",
        [WOMENS_SHOES_FLATS]: "clothing & accessories - by owner",
        [BABY_CLOTHING_SHOES]: "baby & kid stuff - by owner",
        [BABY_AND_KID]: "baby & kid stuff - by owner",
        [OTHER]: "general for sale - by owner",
        [MOTORCYCLES]: "Automotive",
    },
};

// const craigslistFreeCategory = "free stuff";

const storeConditions = {
    [FACEBOOK_KEY]: {
        "new": "New",
        "like-new": "Used - Like New",
        "excellent": "Used - Good",
        "good": "Used - Good",
        "fair": "Used - Fair",
        "salvage": "Used - Fair",
    },
    // use facebook conditions in plain text in the description, or omit
    [NEXTDOOR_KEY]: {
        "new": null,
        "like-new": null,
        "excellent": null,
        "good": null,
        "fair": null,
        "salvage": null,
    },
    [CRAIGSLIST_KEY]: {
        "new": "new",
        "like-new": "like new",
        "excellent": "excellent",
        "good": "good",
        "fair": "fair",
        "salvage": "salvage",
    },
}

const descriptionFooterLocal = `Porch pickup in North Berkeley near Monterey Market + electronic payment preferred. Please message me with a day and time window you'd be available to pick up, thanks! I won't respond if you just ask if the item is available but I will take the listing down when it's sold.`

// TODO: unused until ebay is added
const descriptionFooterShipping = `I ship promptly with expedited shipping! Please feel free to ask any and all questions as I don't accept returns and always hope for your full satisfaction when you receive the item. I've attempted to disclose or photograph all visible flaws to the best of my abilities.`

// TODO: put footer in a config file in ~/.post-puppeteer/
const storeDescriptionFooter = {
    [FACEBOOK_KEY]: descriptionFooterLocal,
    [NEXTDOOR_KEY]: descriptionFooterLocal,
    [CRAIGSLIST_KEY]: descriptionFooterLocal,
}

// TODO: this craigslist switch is implemented in the craigslist.js logic, is it okay to keep there?
// const storeTransforms = {
//     [FACEBOOK_KEY]: (formData) => formData,
//     [NEXTDOOR_KEY]: (formData) => formData,
//     [CRAIGSLIST_KEY]: (formData) => {
//         if (formData.price === "0") {
//             formData.category = craigslistFreeCategory;
//         }

//         return formData;
//     },
// }

const translateTo = (store, formData) => {
    const category = storeCategories[store][formData.category];
    if (category === undefined) {
        throw Error(`${store} category missing for "${formData.category}"`)
    }
    const condition = storeConditions[store][formData.condition];
    if (condition === undefined) {
        throw Error(`${store} condition missing for  "${formData.condition}"`)
    }

    const description = formData.description + `\n\n${storeDescriptionFooter[store]}`
    // formData = storeTransforms[store](formData);

    return {...formData, category, condition, description};
}

module.exports = {
    categories,
    conditions,
    translateTo,
}
