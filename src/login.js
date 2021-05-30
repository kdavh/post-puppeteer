const fs = require('fs');
const os = require('os');

const { CREDENTIALS_FILE } = require('./storage');

const USERNAME = 'username';
const PASSWORD = 'password';
const COOKIES = 'cookies';

const getCredentials = (site) => {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE))[site];
}

const setCredentials = (site, key, value) => {
    // calling getCredentials ensures the file is created
    const siteSecrets = getCredentials(site);
    siteSecrets[key] = value;

    const secrets = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));
    secrets[site] = siteSecrets;

    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(secrets, null, 2), { flag: 'w' });
}

const getUser = (site) => getCredentials(site)[USERNAME];
const getPassword = (site) => getCredentials(site)[PASSWORD];
const getCookies = (site) => getCredentials(site)[COOKIES];
const setCookies = (site, value) => setCredentials(site, COOKIES, value);

module.exports = {
    getUser,
    getPassword,
    getCookies,
    setCookies,
}
