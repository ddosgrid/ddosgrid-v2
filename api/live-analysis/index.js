const bodyParser = require('body-parser')
const {Router} = require('express')
const router = Router()

const Manager = require('../live-data-manager/Manager')
const manager = new Manager()

const {protect} = require('../auth/index')

router.get('/connection', protect, getAllLiveConnections)
router.post('/connection', protect, bodyParser.json(), establishConnection)
router.delete('/connection', protect, deleteConnection)

const connections = new Set()

async function getAllLiveConnections(req, res) {
  try {
    all = [...connections]
    res.json(all)
  } catch (e) {
    console.warn(e)
    res.send(500)
  }
}

function connectionAlreadyExists(port) {
  // check if a connection with the same port already exists
  // connections.has() does not work here
  let exists = false
  connections.forEach((connection) => {
    if (connection.port === port) {
      // can't return out of forEach loop
      exists = true
    }
  })
  return exists
}

async function establishConnection(req, res) {
  try {
    if (!req.body) {
      return res.status(400).send('No body sent')
    }
    if (!req.body.hasOwnProperty('port') || !req.body.port || req.body.port === '') {
      return res.status(400).send('No port was sent.')
    }
    if (isNaN(parseInt(req.body.port))) {
      return res.status(400).send('Port must be a number.')
    }
    const port = parseInt(req.body.port)

    if (connectionAlreadyExists(port)) {
      return res.status(400).send('Connection to this port already exists.')
    }
    await manager.establishConnection(port)
    connections.add({'port': port})
    res.status(200).send(`Collector is connected on port ${port}.`)
  } catch (e) {
    console.warn(e)
    res.send(500)
  }
}

function deleteConnection(req, res) {
  try {
    connections.forEach((connection) => {
      if (connection.port === parseInt(req.query.PORT)) {
        connections.delete(connection)
      }
    })
    res.status(200).send('deleted')
  } catch (e) {
    console.warn(e)
    res.send(500)
  }
}


module.exports = router
