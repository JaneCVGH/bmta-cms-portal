const { createServer } = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const app = next({ dev: true })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(
    {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
    (req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    }
  ).listen(3000, () => {
    console.log('> Ready on https://localhost:3000')
  })
})
