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
// TODO: this updates the pics array with all pics in the post's pics dir. We need to only add things like this transiently,
// we don't want to save this to the post data file.  differentiate between transient and persistent data somehow.
formData.pics = fs.readdirSync(picsDir)
    // ignore hidden files
    .filter(p => p[0] !== '.')
    .map(p => path.join(picsDir, p));

for (p of formData.pics) {
    // Facebook in chrome automated mode freezes on jpgs
    if (! /.png$/.test(p)) {
        console.log(`Facebook freezes uploading jpgs, please convert all to png`);;
    }
}

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
    try {
        await postIfMissing(formData, postName, FACEBOOK_KEY, submitFacebook);
        await postIfMissing(formData, postName, NEXTDOOR_KEY, submitNextdoor);
        await postIfMissing(formData, postName, CRAIGSLIST_KEY, submitCraigslist);
    } catch (e) {
        console.log(e.toString());
    }
})();
