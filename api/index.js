const path = require('path')
const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')

const rootRoutes = require('./routes/root')
const analysisRoutes = require('./routes/analysis/index')

const tempDir = path.resolve(__dirname, './tmp/')
const port = process.env.PORT || 3000
const inDevMode = process.env.NODE_ENV === 'dev'

const uploadMiddleWare = fileUpload({
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: tempDir,
  debug: inDevMode
})

app.use(uploadMiddleWare)
app.use('/', rootRoutes)
app.use('/analysis', analysisRoutes)

app.listen(port, logStart)

function logStart () {
  console.log(`App is listening on port ${port}`)
}
