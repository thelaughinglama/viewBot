const fs = require('fs');
const beautify = require('json-beautify');

const pathToCookies = `${__dirname}/../assets/cookies.json`;

const __addUserCookiesToFile = async (userName, page) => {
  const allUserCookies = require('../assets/cookies.json');

  const userCookies = await page.cookies();
  allUserCookies[userName] = userCookies;

  return fs.writeFileSync(pathToCookies, beautify(allUserCookies, null, 2, 80));
};

const __deleteAllCookies = () => fs.writeFileSync(pathToCookies, '{}');

const __deleteUserCookies = (userName) => {
  const allUserCookies = require('../assets/cookies.json');
  delete allUserCookies[userName];
  return fs.writeFileSync(pathToCookies, beautify(allUserCookies, null, 2, 80));
};

module.exports = {
  addUserCookiesToFile: async (userName, page) => await __addUserCookiesToFile(userName, page),

  deleteAllCookies: async () => __deleteAllCookies(),

  deleteUserCookies: (userName) => __deleteUserCookies(userName),

  initializeEmptyCookiesFile: () => __deleteAllCookies(),
};
