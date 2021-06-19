const fs = require('fs');
const prompt = require('prompt');
const { FACEBOOK_KEY, NEXTDOOR_KEY, CRAIGSLIST_KEY } = require('./const');
const { CREDENTIALS_FILE, STORAGE_DIR, POSTS_DIR } = require('./storage');

const QUESTIONS = [
    {
        type: 'string',
        name: `${FACEBOOK_KEY}:username`,
        description: "What's your facebook username?"
    },
    {
        type: 'string',
        name: `${FACEBOOK_KEY}:password`,
        hidden: true,
        replace: '*',
        description: "What's your facebook password?"
    },
    {
        type: 'string',
        name: `${NEXTDOOR_KEY}:username`,
        description: "What's your nextdoor username?"
    },
    {
        type: 'string',
        name: `${NEXTDOOR_KEY}:password`,
        hidden: true,
        replace: '*',
        description: "What's your nextdoor password?"
    },
    {
        type: 'string',
        name: `${CRAIGSLIST_KEY}:username`,
        description: "What's your craigslist username?"
    },
    {
        type: 'string',
        name: `${CRAIGSLIST_KEY}:password`,
        hidden: true,
        replace: '*',
        description: "What's your craigslist password?"
    },
]

prompt.start();

prompt.get(QUESTIONS, function (err, answers) {
    const secrets = {
        cookies: [],
    };
    for (k in answers) {
        [k1, k2] = k.split(':');
        secrets[k1] = secrets[k1] || {};
        secrets[k1][k2] = answers[k];
        secrets[k1]['cookies'] = [];
    }
    try {
        fs.mkdirSync(STORAGE_DIR);
    } catch (e) {
        console.log(STORAGE_DIR + ' already exists, skipping creation');
    }

    try {
        fs.mkdirSync(POSTS_DIR);
    } catch (e) {
        console.log(POSTS_DIR + ' already exists, skipping creation');
    }

    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(secrets, null, 4));
});

