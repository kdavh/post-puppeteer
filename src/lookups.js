const { FACEBOOK_KEY, NEXTDOOR_KEY, CRAIGSLIST_KEY } = require('./const');

const categories = {
    "womens-clothing": true,
    "womens-handbags": true,
    "womens-shoes-flats": true,
    "nursery-furniture": true,
    "baby-clothing-shoes": true,
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
        "womens-clothing": "Women's Clothing",
        "womens-handbags": "Women's Handbags",
        "womens-shoes-flats": "Women's Flats",
        "nursery-furniture": "Nursery Furniture",
        "baby-clothing-shoes": "Baby Clothing & Shoes",
    },
    [NEXTDOOR_KEY]: {
        "womens-clothing": "Clothing & accessories",
        "womens-handbags": "Clothing & accessories",
        "womens-shoes-flats": "Clothing & accessories",
        "nursery-furniture": "Baby & kids",
        "baby-clothing-shoes": "Baby & kids",
    },
    [CRAIGSLIST_KEY]: {
        "womens-clothing": "clothes+acc",
        "womens-handbags": "clothes+acc",
        "womens-shoes-flats": "clothes+acc",
        "nursery-furniture": "baby+kids",
        "baby-clothing-shoes": "baby+kids",
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

const descriptionFooterLocal = `Porch pickup in North Berkeley + electronic payment. Please message me with a day and time window you'd be available to pick up. Unfortunately I won't respond if you just ask if the item is available. I'll take the listing down when it's sold.`

// TODO: unused until ebay is added
const descriptionFooterShipping = `I ship promptly with expedited shipping! Please feel free to ask any and all questions as I don't accept returns and always hope for your full satisfaction when you receive the item. I've attempted to disclose or photograph all visible flaws to the best of my abilities.`

const storeDescriptionFooter = {
    [FACEBOOK_KEY]: descriptionFooterLocal,
    [NEXTDOOR_KEY]: descriptionFooterLocal,
    [CRAIGSLIST_KEY]: descriptionFooterLocal,
}

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
        throw Error(`${store} category missing for ` + formData.category)
    }
    const condition = storeConditions[store][formData.condition];
    if (condition === undefined) {
        throw Error(`${store} condition missing for ` + formData.condition)
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
