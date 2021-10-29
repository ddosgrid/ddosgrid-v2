const EventEmitter = require('events')

const sockets = new Set()
const dataBroadcaster = new EventEmitter()


class SocketHandler {

  onNewSocketConnection(socket) {
    console.log('new websocket connected');
    sockets.add(socket)

    socket.on('disconnect', () => {
      sockets.delete(socket)
      console.log(`socket with id ${socket.id} has disconnected`)
    })

    // dataBroadcaster listens for events 'new data',
    // emits data with namespace 'new data' to all sockets
    dataBroadcaster.on('newData', (data) => {
      sockets.forEach((socket) => {
        console.log('emit newData')
        socket.emit('newData', data)
      })
    })
  }
}


module.exports = {
  SocketHandler: SocketHandler,
  sockets: sockets,
  dataBroadcaster: dataBroadcaster
}