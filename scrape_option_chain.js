const mongoose = require("mongoose");
const OPTION_CHAIN = require("./dbmodels/option_chains");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs").promises;
const { existsSync } = require("fs");
function getOptionChainUrl(stockOrIndex) {
  if (stockOrIndex.toLowerCase() == "nifty") {
    return "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp";
  } else if (stockOrIndex.toLowerCase() == "banknifty") {
    return `https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTIDX&symbol=${stockOrIndex}`;
  }
  return `https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?symbol=${stockOrIndex}&instrument=OPTSTK&date=-&segmentLink=17&segmentLink=17`;
}
const getData = async (storeLocally = false) => {
  const { index, stocks } = JSON.parse(
    await fs.readFile(path.join(__dirname, "OptionChainConfig.json"))
  );
  const browser = await puppeteer.launch({ headless: true });
  for (let i = 0; i < index.length + stocks.length; i++) {
    let isGt = i >= index.length;
    let gt = isGt ? stocks[i - index.length] : index[i];
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );
    await page.exposeFunction("printSomething", async (val) => {
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
        "PE_OI",
      ];
      const toSave = [];
      for (let ele of val) {
        const rawArr = ele.split(/\s/g).filter((e) => e != "");
        const toPush = {};
        for (let i = 0; i < rawArr.length; i++) {
          const parsedVal = parseFloat(
            rawArr[i].replace(/\s/g, "").replace(/,/g, "")
          );
          toPush[labels[i].toUpperCase()] = parsedVal ? parsedVal : 0;
        }
        toSave.push(toPush);
      }
      if (!existsSync(dirName)) {
        await fs.mkdir(dirName, { recursive: true });
      }
      const dat = new Date();
      try {
        if (storeLocally) {
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
        }
        if (toSave.length > 0) {
          const optionChain = new OPTION_CHAIN({
            ticker: gt,
            option_chain: toSave,
          });
          await optionChain.save();
        }
      } catch (e) {
        console.log(e.message);
      }
    });
    const toDo = goToSpecificOptionChain(gt, page, isGt ? "stocks" : "index");
    await toDo;
  }
  await browser.close();
};

async function goToSpecificOptionChain(ticker, page, type) {
  await page.goto(getOptionChainUrl(ticker), {
    waitUntil: "load",
  });
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
async function saveToDb1(toSave, gt) {
  const { lastErrorObject } = await mongoose.connection
    .collection("option_chains")
    .findOneAndUpdate(
      { ticker: gt },
      { $push: { option_chains: { $each: [toSave] } } }
    );
  if (!lastErrorObject.updatedExisting) {
    const option_chain = new OPTION_CHAIN({
      ticker: gt,
      option_chains: [toSave],
    });
    await option_chain.save();
  }
}
module.exports = { getData };
