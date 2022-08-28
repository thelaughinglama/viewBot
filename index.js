const puppeteer = require('puppeteer');
const fs = require('fs');
const credentials = require('./assets/credentials');
const cookiesHelper = require('./helpers/cookiesHelper');

require('events').defaultMaxListeners = credentials.length; //

let allCookies = {};
fs.existsSync(`${__dirname}/assets/cookies.json`) ? allCookies = require('./assets/cookies.json') : cookiesHelper.initializeEmptyCookiesFile();

/*
after node index, 1st arg: LivestreamUrl, 2nd arg: delete Cookie flag (takes 1 or 0), 3rd arg: username
if flag is 1 and no username is passed in args, system will refresh cookies for all user, if flag is 1 and username is passed in
args , the system wil refresh cookies for that particular user
  */
const userInputArr = process.argv.slice(2);
const [liveUrl, deleteCookiesFlag, userEmail] = userInputArr;

const errObj = {};
let errCount = 0;

deleteCookiesFlag ? userEmail.length ? cookiesHelper.deleteAllCookies() : cookiesHelper.deleteUserCookies(userEmail) : null;

const delay = async (page, time) => {
  await page.waitForTimeout(time);
};
try {
  liveUrl.length || deleteCookiesFlag ? (async () => {
    for (let it = 0; it < credentials.length; it++) {
      const { u: userName, p: password } = credentials[it];// id pass
      if (!userName || !password) continue;

      const browser = await puppeteer.launch({ headless: false, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });

      /* executablePath -- This is a custom path.
    Set it according to your system's executableof chrome.Default sets it to open chromium which doesnot have video playing support.
    In future if we want to mass raid the group with likes or other non-media stuff. Chromium would be a better option since its lighter.
    Go to 'chrome://version/' to fetch executablePath.
    Make sure to replace single slashes with double slash for windows path
     */

      const page = await browser.newPage();

      const userCookies = allCookies?.[userName];
      // login using cookies if exist,otherwise login using user cred and save the cookies for next time we login
      if (Object.keys(allCookies)?.length && userCookies) {
        await page.setCookie(...userCookies);
        await page.goto(liveUrl, { waitUntil: 'networkidle2' });
        await delay(page, 1000);
        await page.$eval('video', (video) => video.play());
        await delay(page, 200);
      }

      else {
        await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle0' });
        await page.type('#email', userName, { delay: 50 });
        await page.type('#pass', password, { delay: 50 });

        //  await browser.close();
        await page.click('#loginbutton');

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        delay(page, 50);
        await page.goto(liveUrl, { waitUntil: 'networkidle0' });
        await delay(page, 3000);
        await page.$eval('video', (video) => video.play());
        await delay(page, 200);
        await cookiesHelper.addUserCookiesToFile(userName, page);
        await delay(page, 50);
      }
    }
  })() : null;
}
catch (err) {
  errObj[`err${errCount}`] = err;
  errCount++;
}
