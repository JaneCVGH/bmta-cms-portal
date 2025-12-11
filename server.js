const { createServer } = require("https");
const { readFileSync } = require("fs");
const next = require("next");

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpsOptions = {
    key: readFileSync("./localhost-key.pem"),
    cert: readFileSync("./localhost.pem"),
  };

  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3000, () => {
    console.log("HTTPS Server running at...https://localhost:3000");
  });
});
