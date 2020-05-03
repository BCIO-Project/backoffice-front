// test.js
const loginPagePO = require('../../pages/backoffice/common/login.po'); 
const HomePagePO = require('../../pages/backoffice/home/home.po');
const timeout = 50000;

describe(
  'Logout of the tool',
  () => {
    let page;
    jest.setTimeout(timeout);

    beforeAll(async () => {
      page  = (await global.__BROWSER__.pages())[0];
      HomePage = new HomePagePO(page);
    });

    it('Logout', async () => {
      //await HomePage.visit();
      await HomePage.logout();
      let cookies = await page.cookies();
      const authCookie = cookies.find(c => c.name === 'auth');
      expect(authCookie).toBeUndefined();
      //await page.screenshot({path: 'buddy-screenshot3.png'});
    });
  },
  timeout
);
