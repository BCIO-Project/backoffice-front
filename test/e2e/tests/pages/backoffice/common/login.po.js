class LoginPage {

    constructor (page) {
        this.page = page; 
        this.userNameLocator = "[name='username']";
        this.passwordLocator = "[name='password']";
        this.loginButtonLocator = ".button";
    };

    async visit() {
        await this.page.goto(global.baseUrl, {
            waitUntil: 'load' 
        }); 
    }; 

    async fillUsername(username) {
        await this.page.type(this.userNameLocator, username);
    };

    async fillPassword(password) {
        await this.page.type(this.passwordLocator, password);
    };

    async submitLogin () {
        await Promise.all([
             await this.page.click(this.loginButtonLocator),
             await this.page.waitForNavigation()
        ]);
    };    
      
    async executeLogin(username,password) {
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.submitLogin();
    }    
}

module.exports = LoginPage; 