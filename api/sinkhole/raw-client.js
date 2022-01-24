const udp = require('dgram');
const dns2 = require('dns2');
const { equal } = require('assert');
const { debuglog } = require('util');

const debug = debuglog('dns2');

const resolvePacket = (query, dns, socketType='udp4', port=53) => {
    const client = new udp.Socket(socketType);
    return new Promise((resolve, reject) => {
        client.once('message', function onMessage(message) {
            client.close();
            const response = dns2.Packet.parse(message);
            equal(response.header.id, query.header.id);
            resolve(response);
        });
        debug('send', dns, query.toBuffer());
        client.send(query.toBuffer(), port, dns, err => err && reject(err));
    });
};

module.exports = {
    resolvePacket
};