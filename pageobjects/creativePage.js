import { By } from 'selenium-webdriver';

class CreativePage {
    creativeID = By.css('[automation-id="demoCreativeID"]');
    pageSettings = By.css('.po-icon__svg.__fill-color--white.__stroke-color--white');
    toggleMonitorButton = By.id('toggle-monitor');
    monitorPanel = By.css('.monitor__panel');
    eventRows = By.css('table.sf__table tbody tr');
    eventName = By.css('td:nth-child(2) span');
    eventTime = By.css('td:nth-child(1) span');
    range = By.id('range');
}

export default new CreativePage();
