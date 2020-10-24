const { get } = require("https");
const Stream = require("stream").Transform;
const fs = require("fs");
const url =
  "https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_960_720.jpg";
get(url, (res) => {
  const data = new Stream();
  res.on("data", (d) => data.push(d));
  res.on("end", () => {
    fs.writeFileSync("someimage.jpg", data.read());
  });
});
