class HomePage {

    constructor (page) {
        this.page = page; 
        this.newCampaignButton = ".item[href='/create-campaign']";
        this.livePausedCheckbox = "[value='LIVE,PAUSED']";
        this.scheduledCheckbox = "[value='SCHEDULED']";
        this.draftCheckbox = "[value='DRAFT']";
        this.closedCheckbox = "[value='CLOSED']";
        this.logoutButton = "[alt='login']";
    };

    async visit() {
        await this.page.goto(global.baseUrl, {
            waitUntil: 'load' 
        }); 
    }; 

    async newCampaign() {
        await Promise.all([
            //await this.page.waitFor(this.newCampaignButton),
            this.page.click(this.newCampaignButton)
        ]);
    };

    async filterByStatus(status) {
        switch (status) {
            case "LIVE","PAUSED":
                await this.page.click(this.livePausedCheckbox);
                break;
            case "SCHEDULED":
                await this.page.click(this.scheduledCheckbox);
                break;
            case "DRAFT":
                await this.page.click(this.draftCheckbox);
                break;  
            case "CLOSED":
                await this.page.click(this.closedCheckbox);
                break;  
            default:
                break;    
        }
    };
    
    async modifyCampaign(campaign) {
        const campaignId = ".campaign[data-qa='" + campaign.toLowerCase()  + "'] .campaign_actions .button[data-qa='campaign-edit']"
        await Promise.all([
             await this.page.waitFor(campaignId),
             await this.page.click(campaignId)
         ]);
    }; 

    async logout() {        
        await Promise.all([
             await this.page.waitForSelector(this.logoutButton),
             await this.page.click(this.logoutButton)
          ]);
    };
}

module.exports = HomePage; 