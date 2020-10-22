const puppeteer = require("puppeteer");

const urls = [
    "https://in.tradingview.com/chart/?symbol=CURRENCYCOM%3AGOLD",
    "https://www.tradingview.com/chart/?symbol=NSE%3ASBIN",
    "https://www.tradingview.com/chart/?symbol=NSE%3AITC"
];

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    for (let i = 0; i < urls.length - 1; i++) {
        await browser.newPage();
    }

    const pages = await browser.pages();
    for (let i = 0; i < pages.length; i++) {
        await pages[i].exposeFunction("doSomething", (val) => {
            console.log(`${urls[i]} ${val}}`);
        })
        await pages[i].goto(urls[i]);
        await pages[i].evaluate(() => {
            const target = document.querySelectorAll("span.priceWrapper-12IXdGf3");
            for (let t of target) {
                const observer = new MutationObserver((mutations) => {
                    for (let mutation of mutations) {
                        doSomething(mutation.target.textContent);
                    }
                });
                observer.observe(t, {
                    attributes: true,
                    attributeOldValue: true,
                    characterData: true,
                    characterDataOldValue: true,
                    childList: true,
                    subtree: true
                });
            }
        });
    }
})()


