class ModifyCampaignPage {

    constructor(page) {
        this.page = page;
        this.saveButton = ".btn-save .save";
        this.launchButton = ".button .star"
        this.buttonPause = "button .pause";
        this.exitButton = ".btn-exit";
        this.modifyCampaignTitleInut = "input.modify_campaign_title";
        this.startDatePicker = "";
        this.endDatePicker = "";
        this.stateLabel = ".bcio_status";
        this.newOfferButton = ".modify_campaign_add_offer_button";
        this.cloneOfferButton = ".bcio_button .clone";
        this.offerSectionArticle = ".offer_row.offer_component";
        this.offerCloneModal = ".modal.active.tiny";
        this.offerCloneModalButtons = ".tiny.modal.active .bcio_button";
        this.exitModal = ".modal.tiny.visible.active";
        this.exitModalModalButtons = ".tiny.modal.active .bcio_button";

        this.offerNameInput = "[name='name']";
        this.offerDescriptionInput = "[name='description']";
        this.brandNameInput = "[name='brandName']";
        this.offerUrlInput = "[name='offerUrl']";
        this.headlineInput = "[name='headline']";
        this.offerGoalInput = "[name='goal']";
        this.kickerUrlInput = "[name='kickerUrl']";
        this.kickerTextInput = "[name='kickerText']";
        this.subtitleInput = "[name='subtitle']";
        this.tagsDocuCombo = ".Tags.documentation";
        this.tagsSegmentCombo = ".Tags.segmentation";
        this.kickerClassInput= "[name='kickerClass']";
        this.authorInput = "[name='author']";
        this.authorUrlInput = "[name='authorLink']";
        this.brandNameInput = "[name='brandName']";
        this.photographerInput = "[name='photoAuthor']";
        this.imageCaptionInput = "[name='footerUrl']";
        this.imageCopyrightInput = "[name='copyright']";
        this.offerImageInput = ".image_component input[type='file']";
        this.trashImageButton = ".image_preview_container .bcio_icon .trash"
        this.imagePositionSizesSlots = ".slot_description"
        this.imagePositionsModalUpdateButton = ".actions .bcio_button"
        this.imagePositionsModalCancelButton = ".actions .bcio_button"
    };

    async newOffer() {
        await Promise.all([
            await this.page.waitFor(this.newOfferButton),
            await this.page.click(this.newOfferButton)
        ]);
    };

    async cloneOffer(id) {
        let articleFinalSelector = "[data-qa='" + id + "'] ";
        await Promise.all([
            await this.page.waitFor(articleFinalSelector + this.cloneOfferButton),
            await this.page.click(articleFinalSelector + this.cloneOfferButton)
        ]);

        if (await this.page.$(this.offerCloneModal) !== null) {
            const action_button = await this.page.$$(this.offerCloneModalButtons);
            // [1] = Yes ; [2] = No
            await action_button[1].click();
        } 
    };

    async getCampaignStatus() {
        await Promise.all([
            await this.page.waitFor(this.stateLabel),
            text = await this.page.$(this.stateLabel).textContent
        ]);
        return text;
    };

    async save() {
        await Promise.all([
            //await this.page.waitForNavigation(),
            await this.page.waitFor(this.saveButton),
            await this.page.click(this.saveButton)
        ]);
    };

    async launch() {
        await Promise.all([
            //await this.page.waitForNavigation(),
            await this.page.waitFor(this.launchButton),
            await  this.page.click(this.launchButton),
            await this.page.waitForNavigation()
        ]);
    };

    async clearInputElement(selector) {
        await this.page.evaluate(selector => {
          document.querySelector(selector).value = "";
        }, selector);
      }

    async modifyOffer(id, offer) {
        let articleFinalSelector = "[data-qa='" + id + "'] ";

        await Promise.all([
            await this.page.waitFor(articleFinalSelector),

            await this.clearInputElement(articleFinalSelector + this.offerNameInput),
            await this.page.type(articleFinalSelector + this.offerNameInput, offer.name),

            await this.clearInputElement(articleFinalSelector + this.offerDescriptionInput),
            await this.page.type(articleFinalSelector + this.offerDescriptionInput, offer.description),

            await this.clearInputElement(articleFinalSelector + this.offerUrlInput),
            await this.page.type(articleFinalSelector + this.offerUrlInput, offer.offerurl),

            await this.clearInputElement(articleFinalSelector + this.offerGoalInput),
            await this.page.type(articleFinalSelector + this.offerGoalInput, offer.goal),

            await this.clearInputElement(articleFinalSelector + this.headlineInput),
            await this.page.type(articleFinalSelector + this.headlineInput, offer.headline),

            await this.clearInputElement(articleFinalSelector + this.subtitleInput),
            await this.page.type(articleFinalSelector + this.subtitleInput, offer.subtitle),

            await this.clearInputElement(articleFinalSelector + this.kickerTextInput),
            await this.page.type(articleFinalSelector + this.kickerTextInput, offer.kickertext),

            await this.loadOfferIage(articleFinalSelector + this.offerImageInput, "test/e2e/tests/assets/offerdata/" + offer.image),

            await this.clearInputElement(articleFinalSelector + this.authorInput),
            await this.page.type(articleFinalSelector + this.authorInput, offer.author),

            await this.clearInputElement(articleFinalSelector + this.authorUrlInput),
            await this.page.type(articleFinalSelector + this.authorUrlInput, offer.authorurl),

            await this.clearInputElement(articleFinalSelector + this.brandNameInput),
            await this.page.type(articleFinalSelector + this.brandNameInput, offer.brandname),

            await this.clearInputElement(articleFinalSelector + this.photographerInput),
            await this.page.type(articleFinalSelector + this.photographerInput, offer.photographer),

            await this.clearInputElement(articleFinalSelector + this.imageCaptionInput),
            await this.page.type(articleFinalSelector + this.imageCaptionInput, offer.imagecaption),

            await this.clearInputElement(articleFinalSelector + this.imageCopyrightInput),
            await this.page.type(articleFinalSelector + this.imageCopyrightInput, offer.imagecopyright),

            await this.clearInputElement(articleFinalSelector + this.kickerClassInput),
            await this.page.type(articleFinalSelector + this.kickerClassInput , offer.kickerclass)
        ]);
    };

    async loadOfferIage(selector, imageName) {

        await this.page.evaluate((selector) => { document.querySelector(selector).className = ""; }, selector);

        const input = await this.page.$(selector);
        await input.uploadFile(imageName);

        await this.page.waitFor(".modal_image_component_content");

        const handles = await this.page.$$(this.imagePositionSizesSlots);
        for (const handle of handles) {
            await this.page.waitFor(".content_cropper");
            await handle.click();
            await this.page.waitFor(".content_cropper [data-testid='container']");
        }

        const action_button = await this.page.$$(this.imagePositionsModalUpdateButton);
        await action_button[1].click();
        await this.page.waitFor(3000);
    }

    async exit() {
        await Promise.all([
            //await this.page.waitForNavigation(),
            await this.page.waitFor(this.exitButton),
            await this.page.click(this.exitButton)
        ]);

        if (await this.page.$(this.exitModal) !== null) {
            const action_button = await this.page.$$(this.exitModalModalButtons);
            // [1] = Yes ; [2] = No
            await action_button[1].click();
        } 
        await this.page.waitForNavigation();
    };
}

module.exports = ModifyCampaignPage; 