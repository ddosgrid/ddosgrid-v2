const EventEmitter = require('events')

const sockets = new Set()
const dataBroadcaster = new EventEmitter()

// dataBroadcaster listens for events 'new data',
// emits data with namespace 'newData' to all sockets
dataBroadcaster.on('newData', (data) => {
  sockets.forEach((socket) => {
    console.log('emit newData')
    socket.emit('newData', data)
  })
})

class SocketHandler {

  onNewSocketConnection(socket) {
    console.log('new websocket connected');
    sockets.add(socket)

    socket.on('disconnect', () => {
      sockets.delete(socket)
      console.log(`socket with id ${socket.id} has disconnected`)
    })
  }
}


module.exports = {
  SocketHandler: SocketHandler,
  sockets: sockets,
  dataBroadcaster: dataBroadcaster
}