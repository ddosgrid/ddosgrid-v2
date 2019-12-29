const { Router } = require('express')
const router = Router()

router.get('', getRoot)

function getRoot (_, res) {
  res.send(`
    <html>
      <head>
        <style>
          blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: .25em solid #dfe2e5;
            margin-left: 0px;
          }
        </style>
      </head>
      <body>
        <h1>ddosgrid API v1</h1>
        <blockquote>Please refer to the documentation in our <a href="https://github.com/ddosgrid/ddos-visualization">GitHub repository</a>.</blockquote>
      </body>
    </html>
  `)
}

module.exports = router
