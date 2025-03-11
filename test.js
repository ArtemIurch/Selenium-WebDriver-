import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import loginPage from './pageobjects/loginPage.js';
import creativePage from './pageobjects/creativePage.js';

let driver;

describe('My Login application', function () {
    this.timeout(60000); // Увеличиваем таймаут на случай долгих тестов

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
    });

    beforeEach(async () => {
        // Переходим на страницу
        await driver.get('https://su-p.undertone.com/125173');
        await driver.sleep(1000);

        // Выполняем логин
        await loginPage.login(driver, 'tomsmith', 'SuperSecretPassword!'); // Логин лучше скрывать через Jenkins
    });

    after(async () => {
        await driver.quit();
    });

    it.only('find the Creative ID + additional tests', async () => {
        // Проверяем наличие Creative ID
        const element = await driver.findElement(creativePage.creativeID);
        const elementText = await element.getText();
        expect(elementText).to.equal('ID: 125173'); // Проверяем Creative ID

        // Сворачиваем page settings
        await driver.findElement(creativePage.pageSettings).click();
        await driver.sleep(1000);

        // Проверяем, что элемент скрыт
        const settingsElement = await driver.findElement(By.id('settingsDevices'));
        const displayValue = await settingsElement.getCssValue('display');
        expect(displayValue).to.equal('none');

        // Разворачиваем page settings
        await driver.findElement(creativePage.pageSettings).click();
        await driver.sleep(1000);

        // Проверяем, что элемент видим
        const isVisible = await settingsElement.isDisplayed();
        expect(isVisible).to.be.true;

        // Сворачиваем GEO
        const geoToggle = await driver.findElement(By.css('.sf-summary'));
        await geoToggle.click();
        await driver.sleep(1000);

        // Проверяем, что GEO закрыто
        const details = await driver.findElement(By.css('.sf-details'));
        const isOpen = (await details.getAttribute('open')) !== null;
        expect(isOpen).to.be.false;

        // Разворачиваем GEO
        await geoToggle.click();
        await driver.sleep(1000);

        // Проверяем, что контент видим
        const content = await driver.findElement(By.css('.sf-details__content'));
        expect(await content.isDisplayed()).to.be.true;
    });

    it('zoom in, zoom out', async () => {
        // Находим ползунок zoom
        const rangeInput = await driver.findElement(creativePage.range);

        // Получаем текущее, минимальное и максимальное значение ползунка
        const value = parseFloat(await rangeInput.getAttribute('value'));
        const min = parseFloat(await rangeInput.getAttribute('min'));
        const max = parseFloat(await rangeInput.getAttribute('max'));

        // Получаем координаты ползунка
        const rect = await rangeInput.getRect();
        const width = rect.width;
        const sliderX = rect.x + ((value - min) / (max - min)) * width;
        const sliderY = rect.y + rect.height / 2;

        // Увеличиваем зум (перемещаем ползунок вправо на 50 пикселей)
        await driver.actions()
            .move({ x: Math.floor(sliderX), y: Math.floor(sliderY) })
            .press()
            .move({ x: 50, y: 0 })
            .release()
            .perform();

        // Проверяем URL после увеличения
        await driver.sleep(400);
        let currentUrl = await driver.getCurrentUrl();
        expect(currentUrl.split('zoom=')[1]).to.equal('1.65');

        // Уменьшаем зум (перемещаем ползунок влево на 50 пикселей)
        await driver.actions()
            .move({ x: Math.floor(sliderX + 50), y: Math.floor(sliderY) })
            .press()
            .move({ x: -50, y: 0 })
            .release()
            .perform();

        // Проверяем URL после уменьшения
        await driver.sleep(400);
        currentUrl = await driver.getCurrentUrl();
        expect(currentUrl.split('zoom=')[1]).to.equal('0.95');
    });

    it('Monitor events', async () => {
        // Нажимаем кнопку "Monitor"
        await driver.findElement(creativePage.toggleMonitorButton).click();
        await driver.wait(until.elementLocated(creativePage.monitorPanel), 5000);

        // Массив для хранения событий
        const eventLogs = [];
        const startTime = Date.now();
        let currentTime = startTime;

        // Функция для получения событий
        const getEventText = async () => {
            const eventRows = await driver.findElements(creativePage.eventRows);
            const events = [];

            for (let row of eventRows) {
                const eventName = await row.findElement(creativePage.eventName).getText();
                const eventTime = await row.findElement(creativePage.eventTime).getText();
                events.push({ time: eventTime, event: eventName });
            }
            return events;
        };

        // Мониторим события в течение 60 секунд
        while (currentTime - startTime < 60000) {
            const events = await getEventText();

            // Логируем новые события
            events.forEach(event => {
                if (!eventLogs.some(existingEvent => existingEvent.event === event.event && existingEvent.time === event.time)) {
                    console.log('New Event:', event);
                    eventLogs.push(event);
                }
            });

            await driver.sleep(5000);
            currentTime = Date.now();
        }

        // Выводим итоговый список событий
        console.log('Collected Events:', eventLogs);
    });
});
