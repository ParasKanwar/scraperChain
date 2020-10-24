const job = require("node-cron");
const mongoose = require("mongoose");
const { saveNifty100, changeConfig } = require("./getNifty200");
const { getData } = require("./scrape_option_chain");
job.schedule("*/50 * * * * *", async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://paras:PpdSKbOaWfSg9xm1@cluster0.7pnto.mongodb.net/Trading?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    await saveNifty100();
    await changeConfig();
    await getData();
    process.exit();
  } catch (e) {
    console.log(e.message);
  }
});
// (async () => {
//   try {
//     await getData();
//   } catch (e) {
//     console.log(e.message);
//   }
// })();
