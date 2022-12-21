const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');

const { FACEBOOK_KEY, NEXTDOOR_KEY, CRAIGSLIST_KEY } = require('./const');
const { submitCraigslist } = require('./craigslist');
const { submitFacebook } = require('./facebook');
const { submitNextdoor } = require('./nextdoor');
const { translateTo } = require('./lookups');
const { POSTS_DIR, postDataFile, postPicsDir } = require('./storage');

myArgs = process.argv.slice(2);
const [postName] = myArgs;

const dataFile = postDataFile(postName);

console.log(`Fetching data from '${dataFile}'`);
formData = yaml.load(fs.readFileSync(dataFile));
const picsDir = postPicsDir(postName);
formData.pics = fs.readdirSync(picsDir).map(p => path.join(picsDir, p));

const savePostUrl = (url, formData, dataFile, site) => {
    console.log(`Saving ${site} post to post data: ${url}`)
    formData.postUrls = formData.postUrls || {};
    formData.postUrls[site] = url;
    fs.writeFileSync(dataFile, yaml.dump(formData));
}

const postIfMissing = async (formData, postName, site, submitFunc) => {
    const dataFile = postDataFile(postName);

    if (!formData.postUrls || !formData.postUrls[site]) {
        console.log(`creating ${site} post for '${postName}'`);
        const siteFormData = translateTo(site, formData);

        console.log(siteFormData);

        const newPost = await submitFunc(siteFormData);
        savePostUrl(newPost, formData, dataFile, site);
    } else {
        console.log(`${site} post already created for '${postName}', skipping`);
    }
}

(async () => {
    // console.log(formData);
    // await postIfMissing(formData, postName, FACEBOOK_KEY, submitFacebook);
    // await postIfMissing(formData, postName, NEXTDOOR_KEY, submitNextdoor);
    await postIfMissing(formData, postName, CRAIGSLIST_KEY, submitCraigslist);
})();
