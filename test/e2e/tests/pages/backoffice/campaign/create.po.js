class CreateCampaignPage {

    constructor(page) {
        this.page = page;
        this.saveButton = ".btn-save";
        this.exitButton = ".btn-exit";
        this.pageSelect = "select#page";
        this.positionSelect = "select#position";
        this.titleInput = "input#name";
        this.startdateInput = "[field='startDate']";
        this.enddateInput = "[field='endDate']";
        this.modalCollision = ".modal.active.tiny";
        this.modalCollisionButton = ".tiny.modal.active .bcio_button";
    };

    async createCampaign(finalPage, position, title, startDay, endDay) {

        await this.page.waitForFunction('document.querySelector("' + this.pageSelect + '").length > 1');
        await this.page.type(this.pageSelect, finalPage);

        await this.page.waitForFunction('document.querySelector("' + this.positionSelect + '").length > 1');
        await this.page.type(this.positionSelect, position);

        //let dropdowns = await this.page.$$eval(this.pageSelect, all => all.map(a => a.textContent));
        //console.log(dropdowns);

        //dropdowns = await this.page.$$eval(this.positionSelect, all => all.map(a => a.textContent));
        //console.log(dropdowns);

        await this.page.type(this.titleInput, title);

        await this.page.click(this.startdateInput);
        await this.page.click("[aria-label='day-" + startDay + "']");

        await this.page.click(this.enddateInput);
        await this.page.click("[aria-label='day-" + endDay + "']");

    };

    async save() {
        await Promise.all([
            //await this.page.waitForNavigation(),
            await this.page.waitFor(this.saveButton),
            await this.page.click(this.saveButton)
        ]);

        if (await this.page.$(this.modalCollision) !== null) {
            await this.page.click(this.modalCollisionButton);
        } 
    };

    async exit() {
        await Promise.all([
            //await this.page.waitForNavigation(),
            await this.page.waitFor(this.exitButton),
            this.page.click(this.exitButton),
            this.page.waitForNavigation()
        ]);
    };
}

module.exports = CreateCampaignPage; 