import { By, until } from 'selenium-webdriver';

class LoginPage {
    usernameInput = By.id('username');
    passwordInput = By.id('password');
    loginButton = By.css('button[type="submit"]');

    async login(driver, username, password) {
        await driver.findElement(this.usernameInput).sendKeys(username);
        await driver.findElement(this.passwordInput).sendKeys(password);
        await driver.findElement(this.loginButton).click();
        await driver.wait(until.urlContains('dashboard'), 5000);
    }
}

export default new LoginPage();
