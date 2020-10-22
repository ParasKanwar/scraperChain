const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs").promises;
const { existsSync } = require("fs");
const option_chain_url =
  "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp";

function getOptionChainUrl(stockOrIndex) {
  return `https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?symbol=${stockOrIndex}&instrument=OPTSTK&date=-&segmentLink=17&segmentLink=17`;
}

(async () => {
  const { index, stocks } = JSON.parse(
    await fs.readFile(path.join(__dirname, "OptionChainConfig.json"))
  );
  const browser = await puppeteer.launch({ headless: false });
  const pages = await openNPages(browser, index.length + stocks.length - 1);
  const parr = [];
  for (let i = 0; i < index.length + stocks.length; i++) {
    let isGt = i >= index.length;
    let gt = isGt ? stocks[i - index.length] : index[i];
    await pages[i].exposeFunction("printSomething", async (val) => {
      const dirName = `./option_chain/${gt}`;
      const labels = [
        "CE_OI",
        "CE_Change_In_OI",
        "CE_Volume",
        "CE_IV",
        "CE_LTP",
        "CE_NET_CHANG",
        "CE_Bid_Qty",
        "CE_Bid_Price",
        "CE_Ask_Price",
        "CE_ASK_QTY",
        "STRIKE_PRICE",
        "PE_Bid_Qty",
        "PE_Bid_Price",
        "PE_Ask_Price",
        "PE_ASK_QTY",
        "PE_NET_CHANG",
        "PE_LTP",
        "PE_IV",
        "PE_Volume",
        "PE_Change_In_OI",
        "OI",
      ];
      const toSave = [];
      for (let ele of val) {
        const rawArr = ele.split(/\s/g).filter((e) => e != "");
        const toPush = {};
        for (let i = 0; i < rawArr.length; i++) {
          toPush[labels[i].toUpperCase()] = parseFloat(
            rawArr[i].replace(",", "")
          );
        }
        toSave.push(toPush);
      }
      if (!existsSync(dirName)) {
        await fs.mkdir(dirName, { recursive: true });
      }
      const dat = new Date();
      try {
        await fs.writeFile(
          path.join(
            __dirname,
            dirName,
            `${gt}_${
              dat.getDate() + "_" + dat.getMonth() + "_" + dat.getFullYear()
            }.json`
          ),
          JSON.stringify(toSave)
        );
      } catch (e) {
        console.log(e.message);
      }
    });
    // await exposeSpecialFunctionToPage(pages[i],makeOurFunction(index[i]));
    const toDo = goToSpecificOptionChain(
      gt,
      pages[i],
      isGt ? "stocks" : "index"
    );
    // parr.push(toDo);
    await toDo;
  }

  //   await Promise.all(parr);
  // p[0].select("","")
  // p[0].waitForNavigation({waitUntil:"networkidle2"})
  // await pages[0].exposeFunction("getDetails", async (val) => {
  //     const dirName = "./option_chain"
  //     const labels = ["CE_OI", "CE_Change_In_OI", "CE_Volume", "CE_IV", "CE_LTP", "CE_NET_CHANG", "CE_Bid_Qty", "CE_Bid_Price", "CE_Ask_Price", "CE_ASK_QTY", "STRIKE_PRICE", "PE_Bid_Qty", "PE_Bid_Price", "PE_Ask_Price", "PE_ASK_QTY", "PE_NET_CHANG", "PE_LTP", "PE_IV", "PE_Volume", "PE_Change_In_OI", "OI"];
  //     const toSave = [];
  //     for (let ele of val) {
  //         const rawArr = ele.split(/\s/g).filter(e => e != "");
  //         const toPush = {};
  //         for (let i = 0; i < rawArr.length; i++) {
  //             toPush[labels[i].toUpperCase()] = parseFloat(rawArr[i].replace(",", ""));
  //         }
  //         toSave.push(toPush);
  //     }

  //     if(!existsSync(dirName)){
  //        await fs.mkdir(dirName);
  //     }
  //     const dat = new Date();
  //     try{
  //         await fs.writeFile(path.join(__dirname,dirName,"/NIFTY",`NIFTY_${dat.getDate()+"_"+dat.getMonth()+"_"+dat.getFullYear()}.json`), JSON.stringify(toSave));
  //     }catch(e){
  //         console.log(e.message);
  //     }
  // });
  // await pages[0].evaluate(() => {
  //     const tableRows = Array.from(document.querySelectorAll("table tr"));
  //     const toMap = [];
  //     for (let i = 5; i < tableRows.length - 2; i++) {
  //         toMap.push(tableRows[i]);
  //     }
  //     const toReturn = toMap.map(td => String(td.innerText).replace("\t", ""));
  //     getDetails(toReturn);
  // });

  await browser.close();
})();

async function delay(seconds) {
  return new Promise((res, rej) => {
    setTimeout(res, seconds * 1000);
  });
}

async function goToSpecificOptionChain(ticker, page, type) {
  await page.goto(getOptionChainUrl(ticker), { waitUntil: "load", timeout: 0 });
  await page.evaluate(() => {
    const tableRows = Array.from(document.querySelectorAll("table tr"));
    const toMap = [];
    for (let i = 5; i < tableRows.length - 2; i++) {
      toMap.push(tableRows[i]);
    }
    const toReturn = toMap.map((td) => String(td.innerText).replace("\t", ""));
    printSomething(toReturn);
  });
  await page.close();
}

async function openNPages(browser, n) {
  for (let i = 0; i < n; i++) {
    await browser.newPage();
  }
  const pages = await browser.pages();
  return pages;
}

async function makeOurFunction(ticker) {
  const myFun = async (val) => {
    console.log(val);
    const dirName = `./option_chain/${ticker}`;
    const labels = [
      "CE_OI",
      "CE_Change_In_OI",
      "CE_Volume",
      "CE_IV",
      "CE_LTP",
      "CE_NET_CHANG",
      "CE_Bid_Qty",
      "CE_Bid_Price",
      "CE_Ask_Price",
      "CE_ASK_QTY",
      "STRIKE_PRICE",
      "PE_Bid_Qty",
      "PE_Bid_Price",
      "PE_Ask_Price",
      "PE_ASK_QTY",
      "PE_NET_CHANG",
      "PE_LTP",
      "PE_IV",
      "PE_Volume",
      "PE_Change_In_OI",
      "OI",
    ];
    const toSave = [];
    for (let ele of val) {
      const rawArr = ele.split(/\s/g).filter((e) => e != "");
      const toPush = {};
      for (let i = 0; i < rawArr.length; i++) {
        toPush[labels[i].toUpperCase()] = parseFloat(
          rawArr[i].replace(",", "")
        );
      }
      toSave.push(toPush);
    }
    if (!existsSync(dirName)) {
      await fs.mkdir(dirName, { recursive: true });
    }
    const dat = new Date();
    try {
      await fs.writeFile(
        path.join(
          __dirname,
          dirName`${ticker}_${
            dat.getDate() + "_" + dat.getMonth() + "_" + dat.getFullYear()
          }.json`
        ),
        JSON.stringify(toSave)
      );
    } catch (e) {
      console.log(e.message);
    }
  };
  return myFun;
}
