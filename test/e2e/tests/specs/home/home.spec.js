// test.js
const HomePagePO = require('../../pages/backoffice/home/home.po');
const CreateCampaignPagePO = require('../../pages/backoffice/campaign/create.po');
const ModifyCampaignPagePO = require('../../pages/backoffice/campaign/modify.po');
const jsonOffers = require('../../assets/offerdata/offers.json');

const timeout = 50000;

describe(
  'Home tests',
  () => {
    let page;
    jest.setTimeout(timeout);

    beforeAll(async () => {
      page = (await global.__BROWSER__.pages())[0];      
    });

    it('Create Campaign', async () => {
       HomePage = new HomePagePO(page);
       await HomePage.newCampaign(); 
       CreateCampaignPage = new CreateCampaignPagePO(page);
       await CreateCampaignPage.createCampaign("El País - PORTADA", "Premium", "Tests01", 5, 14);
       await CreateCampaignPage.save();
       //await CreateCampaignPage.exit();
    });

    it('Modify Campaign Offer and save', async () => {
      ModifyCampaign = new ModifyCampaignPagePO(page);
      await ModifyCampaign.modifyOffer(0,jsonOffers[0]);
      await ModifyCampaign.save();
    });

    it('Clone Offer', async () => {
      ModifyCampaign = new ModifyCampaignPagePO(page);
      await ModifyCampaign.cloneOffer(0);
    });

    it('Modify Campaign Offer From HomePage and save', async () => {
      HomePage = new HomePagePO(page);
      await HomePage.modifyCampaign("Tests01");
      ModifyCampaign = new ModifyCampaignPagePO(page);
      await ModifyCampaign.modifyOffer(1,jsonOffers[1]);
      await ModifyCampaign.save();
    });

    it('Exit from modify Campaign', async () => {
      ModifyCampaign = new ModifyCampaignPagePO(page);
      await ModifyCampaign.exit();
    });
  },
  timeout
);