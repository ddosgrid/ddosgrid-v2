/*
In order to replay certain pcap files to a specific port as outpout i used this:
https://tcpreplay.appneta.com/
https://tcpreplay.appneta.com/wiki/tcpreplay-edit-man.html
example command here:
sudo tcpreplay-edit -i wlo1 -t -K --portmap=1-9999:3000 UDP-flooding_fcada352e9c25e65977abfdaf40eae6d.pcap

To see traffic on port:
sudo tcpdump port 3000 and '(tcp-syn|tcp-ack)!=0'


Tool used for Netflow exporter(WHICH IS ALSO ABLE TO REPLAY PCAP FILES): softflowd
softflowd -n localhost:9000 -r ddosdb_syn_2-chunked.pcap
softflowd -n localhost:3000 -r DNS-flooding_7498de6f87aea566dadd7c2302eaf59f.pcap
to monitor a port and aggregate data to flow with different pcap file replayer example:
sudo softflowd -n 0.0.0.0:3000 -i wlo1
 */


var Collector = require('node-netflowv9');

module.exports.init = function() {
    console.log("listening...")
    var collector = Collector({port: 3000});
    collector.on('data', function(data) {
        console.log(data);
    });
}
