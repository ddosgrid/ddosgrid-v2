const bodyParser = require('body-parser')
const {Router} = require('express')
const router = Router()

const Manager = require('../live-data-manager/Manager')
const manager = new Manager()

const {protect} = require('../auth/index')

router.post('/connection', protect, bodyParser.json(), establishConnection)


async function establishConnection(req, res) {
  try {
    if (!req.body) {
      return res.status(400).send('No body sent')
    }
    if (!req.body.hasOwnProperty('port') || !req.body.port || req.body.port === '') {
      return res.status(400).send('No port was sent')
    }
    const port = req.body.port
    await manager.establishConnection(port)

    res.status(200).send(`Collector is connected on port ${port}`)
  } catch (e) {
    console.warn(e)
    res.send(500)
  }
}


module.exports = router
