const fs = require("fs");
const fsP = fs.promises;
const https = require("https");
const url = "https://www1.nseindia.com/content/indices/ind_nifty100list.csv";
const n200url =
  "https://www1.nseindia.com/content/indices/ind_nifty200list.csv";
const fileName = "./nifty100.csv";
const toWriteFileName = "./OptionChainConfig.json";
function saveNifty100() {
  const file = fs.createWriteStream(fileName);
  return new Promise((resolve, reject) => {
    https.get(n200url, (res) => {
      res.pipe(file).on("close", () => {
        resolve();
      });
    });
  });
}

async function changeConfig() {
  let config = await fsP.readFile("./OptionChainConfig.json", {
    encoding: "utf-8",
  });
  config = JSON.parse(config);
  const data = await fsP.readFile(fileName, { encoding: "utf-8" });
  const stocks = data
    .replace(/\r/g, "")
    .split(/\n/g)
    .slice(1, 201)
    .map((val) => {
      const [company, sector, ticker, donno, ineNo] = val.split(/,/g);
      // return { company, ticker };
      return ticker;
    });
  const toSave = { index: config.index, stocks };
  await fsP.writeFile(toWriteFileName, JSON.stringify(toSave));
}

module.exports = { saveNifty100, changeConfig };
