const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const rootRoutes = require('./routes/root')

app.use('/', rootRoutes)
app.listen(port, logStart)

function logStart () {
  console.log(`App is listening on port ${port}`)
}
