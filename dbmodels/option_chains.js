const mongoose = require("mongoose");
const { option_chain } = require("./models_names");
const schema = new mongoose.Schema({
  ticker: { type: String, required: true },
  date: { type: String, required: true, unique: true },
  option_chain: [
    {
      CE_OI: { type: Number, default: 0 },
      CE_CHANGE_IN_OI: { type: Number, default: 0 },
      CE_VOLUME: { type: Number, default: 0 },
      CE_IV: { type: Number, default: 0 },
      CE_LTP: { type: Number, default: 0 },
      CE_NET_CHANG: { type: Number, default: 0 },
      CE_BID_QTY: { type: Number, default: 0 },
      CE_BID_PRICE: { type: Number, default: 0 },
      CE_ASK_PRICE: { type: Number, default: 0 },
      CE_ASK_QTY: { type: Number, default: 0 },
      STRIKE_PRICE: { type: Number, default: 0 },
      PE_BID_QTY: { type: Number, default: 0 },
      PE_BID_PRICE: { type: Number, default: 0 },
      PE_ASK_PRICE: { type: Number, default: 0 },
      PE_ASK_QTY: { type: Number, default: 0 },
      PE_NET_CHANG: { type: Number, default: 0 },
      PE_LTP: { type: Number, default: 0 },
      PE_IV: { type: Number, default: 0 },
      PE_VOLUME: { type: Number, default: 0 },
      PE_CHANGE_IN_OI: { type: Number, default: 0 },
      OI: { type: Number, default: 0 },
    },
  ],
});
const model = mongoose.model(option_chain, schema);
module.exports = model;
