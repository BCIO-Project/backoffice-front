// test.js
const loginPagePO = require('../../pages/backoffice/common/login.po'); 
const HomePagePO = require('../../pages/backoffice/home/home.po');
const timeout = 50000;

describe(
  'Login into the tool',
  () => {
    let page;
    jest.setTimeout(timeout);

    beforeAll(async () => {
      page  = (await global.__BROWSER__.pages())[0];
      LoginPage = new loginPagePO(page);
    });

    it('should load without error', async () => {
      await LoginPage.visit();
      const text = await page.evaluate(() => document.body.textContent);
      expect(text).toContain('Sign up in Bcio');
    });

    it('Login', async () => {
      await LoginPage.executeLogin("bcio@paradigmadigital.com","bcio@com");
      let cookies = await page.cookies();
      const authCookie = cookies.find(c => c.name === 'auth');
      expect(authCookie).not.toBeUndefined();
    });
  },
  timeout
);