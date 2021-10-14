/*
In order to replay certain pcap files to a specific port as outpout i used this:
https://tcpreplay.appneta.com/
https://tcpreplay.appneta.com/wiki/tcpreplay-edit-man.html
example command here:
sudo tcpreplay-edit -i wlo1 -t -K --portmap=1-9999:3000 DNS-flooding_7498de6f87aea566dadd7c2302eaf59f.pcap

To see traffic on port:
sudo tcpdump port 3000 and '(tcp-syn|tcp-ack)!=0'
 */


var Collector = require('node-netflowv9');

module.exports.init = function() {
    console.log("listening...")
    var collector = Collector({port: 3000});
    collector.on('data', function(data) {
        console.log(data);
    });
    collector.on('template', function(data) {
        console.log(data);
    });

}

// class CollectorConnector {
//     constructor() {
//     }
// }