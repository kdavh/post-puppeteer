const os = require('os');
const path = require('path');

const STORAGE_DIR = os.homedir() + '/.post-puppeteer';
const CREDENTIALS_FILE = STORAGE_DIR + '/credentials.json';
const POSTS_DIR = STORAGE_DIR + '/posts';

const postDataFile = (postName) => path.join(POSTS_DIR, postName, 'data.yaml')

module.exports = {
    STORAGE_DIR,
    CREDENTIALS_FILE,
    POSTS_DIR,
    postDataFile,
}
