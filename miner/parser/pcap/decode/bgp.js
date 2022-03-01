const IPv4Addr = require('./ipv4_addr')
const marker = new Buffer('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 'hex')

function BGP(emitter) {
  this.emitter = emitter;
}

BGP.prototype.decoderName = "bgp";
BGP.prototype.eventsOnDecode = true;

BGP.prototype.decode = function (raw_packet, offset) {
  if(raw_packet === null) { return }

  var boundaries = []
  raw_packet.forEach((by, i) => {
    if (by === 255) {
      if(raw_packet.slice(i, i + 16 ).equals(marker)) {
        boundaries.push(i)
      }
    }
  })
  if(boundaries.length === 0) {
    boundaries = [ raw_packet ]
  }
  var messages = boundaries.map((el, i) => {
    var nextBoundary = boundaries[i + 1]
    if(nextBoundary) {
      return raw_packet.slice(el, nextBoundary)
    } else {
      return raw_packet.slice(el)
    }
  })
  var decodedMessages = messages.map(this.decodeMsg.bind(this))
  return decodedMessages
}
BGP.prototype.decodeMsg = function (raw_packet) {

  const messageTypes = {
    1: 'Open',
    2: 'Update',
    3: 'Notification',
    4: 'Keepalive'
  }
  var markerBytes = raw_packet.slice(0, 16)
  if(!markerBytes.equals(marker)) {
    throw new Error('Marker malformed')
  }
  this.length = raw_packet.readUInt16BE(16)
  var messageTypeCode = raw_packet.readUInt8(18)
  this.messageType = messageTypes[messageTypeCode]
  this.payload = raw_packet.slice(19)

  if (this.messageType === 'Open') {
    this.message = new OpenMessage(this.payload)
  } else if (this.messageType === 'Update') {
    this.message = new UpdateMessage(this.payload)
  } else if (this.messageType === 'Notification') {
    this.message = new NotificationMessage(this.payload)
  } else if (this.messageType === 'Keepalive') {
    this.message = new KeepaliveMessage(this.payload)
  } else {
    console.warn('Unsupported ')
  }
  if(this.emitter) { this.emitter.emit("bgp", this); }
  return this;
};

BGP.prototype.toString = function () {
  var msg = `BGP "${this.messageType}" message`
  return msg;
};

function OpenMessage(buff) {
  this.decode(buff)
}
OpenMessage.prototype.decode = function decodeOpen (buff) {
  this.version = buff.readUInt8(0)
  this.autonomoussystem = buff.readUInt16BE(1)
  this.holdtime = buff.readUInt16BE(3)
  this.bgpID = new IPv4Addr()
  this.bgpID.decode(buff.slice(5, 9), 0)
  this.optparamlength = buff.readUInt8(9)
  var hasParams = this.optparamlength > 0
  if (hasParams) {
    this.optparams = buff.slice(10)
    var collector = []
    var remainingBuff = this.optparams
    var offset =  0
    while (remainingBuff.length > offset) {
      var length = remainingBuff.readUInt8(offset + 1)
      collector.push({
        type: remainingBuff.readUInt8(offset),
        length: length,
        val: remainingBuff.slice(offset + length)
      })
      const staticHeaderLength = 2
      offset += staticHeaderLength + length
    }
    this.optparams = collector
  }
}

OpenMessage.prototype.toString = function serializeOpenMsg () {
  return `Connection request from ${this.bgpID} in AS${this.autonomoussystem}`
}

function NotificationMessage() { this.decode(buff) }
NotificationMessage.prototype.decode = function decodeNotification (buff) {
  this.errorCode = buff.readUInt8(0)
  this.subErrorCode = buff.readUInt8(1)
  var messageNames = {
    1: {
      name: 'Message Header Error',
      sub: {
        1: 'Connection Not Synchronized',
        2: 'Bad Message Length',
        3: 'Bad Message Type'
      }
    },
    2:{
      name: 'OPEN Message Error',
      sub: {
        1: 'Unsupported Version Number.',
        2: 'Bad Peer AS.',
        3: 'Bad BGP Identifier.',
        4: 'Unsupported Optional Parameter.',
        5: 'Authentication Failure.',
        6: 'Unacceptable Hold Time.'
      }
    } ,
    3: {
      name: 'UPDATE Message Error',
      sub: {
        1: 'Malformed Attribute List.',
        2: 'Unrecognized Well-known Attribute.',
        3: 'Missing Well-known Attribute.',
        4: 'Attribute Flags Error.',
        5: 'Attribute Length Error.',
        6: 'Invalid ORIGIN Attribute',
        7: 'AS Routing Loop.',
        8: 'Invalid NEXT_HOP Attribute.',
        9: 'Optional Attribute Error.',
        10: 'Invalid Network Field.',
        11: 'Malformed AS_PATH.'
      }
    },
    4: {
      name: 'Hold Timer Expired',
      sub: {

      }
    },
    5: {
      name: 'Finite State Machine Error',
    },
    6: { name: 'Cease'}
  }
  this.errorMessage = messageNames[this.errorCode].name
  this.subMessage = messageNames[this.errorCode].sub[this.subErrorCode]
  this.data = buff.slice(2)
}

NotificationMessage.prototype.toString = function serializeNotification () {
  return `${this.errorMessage}: ${this.subMessage}`
}

function KeepaliveMessage() { }

KeepaliveMessage.prototype.toString = function serializeKeepalive () {
  return 'Keep Alive'
}

function UpdateMessage(buff) { this.decode(buff) }
UpdateMessage.prototype.decode = function decodeUpdate (buff) {
  this.unfeasible = {
    length: 0,
    withdrawnroutes: [ ]
  }
  this.unfeasible.length = buff.readUInt16BE(0)
  var unfeasible = buff.slice(2, 2 + this.unfeasible.length)
  this.pathattributes = {
    length: 0,
    attributes: [ ]
  }
  this.pathattributes.length = buff.readUInt16BE(2 + this.unfeasible.length)
  var pathAttrBuff = buff.slice(2 + this.unfeasible.length + 2, 2 + this.unfeasible.length + 2 + this.pathattributes.length)
  this.nlriBuff = buff.slice(2 + this.unfeasible.length + 2 + this.pathattributes.length)
  this.nlri = []
  while(this.nlriBuff.length > 0 && !this.nlriBuff.slice(0, 16).equals(marker)) {
    var length = this.nlriBuff.readUInt8(0)
    var pref = new IPv4Addr()
    pref.decode(this.nlriBuff.slice(1,4), 0)
    this.nlri.push(`${pref.addr.join('.')}/${length}`)
    this.nlriBuff = this.nlriBuff.slice(4)
  }
}

UpdateMessage.prototype.toString = function serializeUpdateMessage () {
  return `Withdraw ${this.unfeasible.withdrawnroutes.length} routes, announce ${this.nlri.join(', ')}`
}

module.exports = BGP;
