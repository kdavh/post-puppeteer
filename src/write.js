const path = require('path');
const fs = require('fs');
const prompt = require('prompt');
const yaml = require('js-yaml');

const { POSTS_DIR, postDataFile, postDir, postPicsDir } = require('./storage');
const { categories, conditions } = require('./lookups');

// https://yaml-multiline.info/
const categoryPromptText = Object.keys(categories).join("\n") + "\n";
const conditionPromptText = Object.keys(conditions).join("\n") + "\n";

const QUESTIONS1 = [
    {
        type: 'string',
        name: 'name',
        description: "What's the name of the post? Must be unique across all posts, often can be whatever the post title will be. ex: 'Red Shoes Size 8'"
    },
];

const QUESTIONS2 = [
    {
        type: 'string',
        name: 'price',
        description: "What's the price?"
    },
    {
        type: 'string',
        name: 'category',
        description: "What's the category? Choose from:\n" + categoryPromptText,
    },
    {
        type: 'string',
        name: 'condition',
        description: "What's the condition? Choose from:\n" + conditionPromptText,
    },
];

prompt.start();

let name = '';

prompt.get(QUESTIONS1).then(answers => {
    name = answers.name;

    if (!name) {
        console.log("Name must be present, try again.");
        process.exit(0);
    }
    try {
        fs.mkdirSync(postDir(name));
    } catch (e) {
        console.log(`'${postDir(name)}' already exists, please choose a different name`);
        process.exit(0);
    }
}).then(() => prompt.get(QUESTIONS2)).then((answers) => {
    const {price, category, condition} = answers;

    const description = `Put description here,\nWith multiple lines...`;

    const data = {
        title: name,
        price: price,
        category: category,
        condition: condition,
        description: description,
        postUrls: {},
    }

    const dataFile = postDataFile(name);
    fs.writeFileSync(dataFile, yaml.dump(data));
    try {
        fs.mkdirSync(postPicsDir(name));
    } catch (e) {
    }
    console.log(`Created '${dataFile}'!`)
    console.log(`Next, edit '${dataFile}', adding proper description, then add post pictures into the same directory.`);
    console.log(`(If you have vscode installed, try: code -n '${dataFile}')`);
    console.log(`When finished, run: npm run post -- "${name}" to post to different websites`);
})
