const fs = require("fs");
const https = require("https");
const file = fs.createWriteStream("./website.html", { encoding: "utf-8" });

https.get(
  "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTIDX&symbol=banknifty",
  (res) => {
    console.log(res);
    file.pipe(res);
  }
);
