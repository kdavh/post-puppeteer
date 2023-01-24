# Post puppeteer

## Install

These instructions are for Mac. If you're on Windows, you're on your own. If you're on Linux, you're probably fine.

If you don't have `npm` installed (if you don't know, you probably don't), click [here](https://nodejs.org/dist/v18.12.1/node-v18.12.1.pkg) to download the .pkg file.

To see all bundles available for 18.12.1, go [here](https://nodejs.org/dist/v18.12.1/).

Install npm at a specific version as noted above (this is important, as the latest version of npm may not be compatible with the dependencies of this project), i.e. don't go [here](https://nodejs.org/en/).

Open the downloaded installer and install.

All following commands are generally run in a shell, i.e. in the "Terminal" app on a Mac.

Download this repository anywhere you'd like.

`git clone https://github.com/kdavh/post-puppeteer && cd post-puppeteer`

Initialize the configurations (will live in ~/.post-puppeteer)

`npm install && npm run init` and follow the prompts.


## Use It

Write your post:

`npm run write` and follow the prompts.

Post your post on websites:

`npm run post -- "Your Post Name"`


NOTE:
- You cannot use jpg / jpeg images, stick to png images.
