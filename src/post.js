const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');

const { submitFacebook } = require('./facebook');
const { translateTo } = require('./lookups');
const { POSTS_DIR, postDataFile } = require('./storage');

myArgs = process.argv.slice(2);
const [postName] = myArgs;

console.log(`Fetching data from '${postDataFile(postName)}'`);
formData = yaml.load(fs.readFileSync(postDataFile(postName)));

console.log(formData);

facebookFormData = translateTo('facebook', formData);

console.log(facebookFormData);

// submitFacebook(facebookFormData);
