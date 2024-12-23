const chai = require('chai');
const chaiHttp = require('chai-http');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

describe('Express App Tests', () => {
    it('should return a 200 OK status and a title of "root" on the home route', (done) => {
        chai
            .request(app)
            .get('/')
            .set('Host', 'localhost')
            .end((err, res) => {
                expect(res).to.have.status(200);
                const $ = cheerio.load(res.text);
                expect($('title').text()).to.equal('doi.bio root');
                done();
            });
    });

    it('should return content for root', (done) => {
        chai
            .request(app)
            .get('/')
            .set('Host', 'localhost')
            .end((err, res) => {
                expect(res).to.have.status(200);
                const $ = cheerio.load(res.text);
                expect($('li:first').text()).to.equal('');
                done();
            });
    });
    
    it('should return a 200 OK status and a title of "sness" on the sness.localhost subdomain route', (done) => {
        chai
            .request(app)
            .get('/')
            .set('Host', 'sness.localhost')
            .end((err, res) => {
                expect(res).to.have.status(200);
                const $ = cheerio.load(res.text);
                expect($('title').text()).to.equal('doi.bio sness');
                done();
            });
    });

    it('should return content for sness', (done) => {
        chai
            .request(app)
            .get('/')
            .set('Host', 'sness.localhost')
            .end((err, res) => {
                expect(res).to.have.status(200);
                const $ = cheerio.load(res.text);
                expect($('li:first').text()).to.equal('test123');
                done();
            });
    });

    // it('should test JavaScript functionality', async () => {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();

    //     // Go to the home page
    //     await page.goto('http://localhost:3000');

    //     // Test Escape key
    //     await page.keyboard.press('Escape');
    //     const isInputFocused = await page.evaluate(() =>
    //         document.querySelector('input[type="text"]') ===
    //             document.activeElement);
    //     expect(isInputFocused).to.be.true;

    //     // Test Home key
    //     await page.keyboard.press('Home');
    //     const scrollYHome = await page.evaluate(() =>
    //         window.scrollY);
    //     expect(scrollYHome).to.equal(0);

    //     // Test End key
    //     await page.keyboard.press('End');
    //     const scrollYEnd = await page.evaluate(() =>
    //         window.scrollY);
    //     const scrollHeight = await page.evaluate(() =>
    //         document.body.scrollHeight);
    //     const scrollPositions = await page.evaluate(() => ({
    //         scrollY: window.scrollY,
    //         scrollHeight: document.body.scrollHeight,
    //         innerHeight: window.innerHeight,
    //     }));
    //     expect(scrollPositions.scrollY)
    //         .to.be.at.least(
    //             scrollPositions.scrollHeight -
    //                 scrollPositions.innerHeight);

    //     // // Test Backspace key
    //     // await page.keyboard.press('Backspace');
    //     // const scrollXBackspace = await page.evaluate(() => window.scrollX);
    //     // const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    //     // expect(scrollXBackspace).to.equal(scrollWidth);

    //     await browser.close();

    // });

    
});
