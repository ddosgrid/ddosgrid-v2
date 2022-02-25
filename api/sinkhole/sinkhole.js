import dns from "dns";
import RawClient from "./raw-client.js";
import BL from "./blacklist.js";
import dns2 from "dns2";

const { Packet } = dns2;

class Sinkhole {
    #running = false;
    stats = {};

    constructor({dnsPort = 53, sinkholeAddress, blacklist, mainDns = null}){
    // constructor(dnsPort = 53, sinkholeAddress, blacklist, mainDns) {
        this.port = dnsPort;

        if (!sinkholeAddress) {
            throw "A sinkhole address must be provided!";
        }
        this.sinkholeAddress = sinkholeAddress;

        if (!(blacklist instanceof Array)) {
            throw "Blacklist must be a string array!";
        }
        this.blacklist = BL.sortBlacklist(blacklist);

        this.mainDns = mainDns ?? dns.getServers()[0];

        this.server = dns2.createServer({ udp: true, handle: this.handleDnsRequest });
        this.on = this.server.on;
    }

    createSinkholeResponse = request => {
        const response = Packet.createResponseFromRequest(request);
        // only respond for ipv4 requests, all others are non-existent for us :)
        if (request.questions[0].type === 1) {
            response.answers.push({
                name: request.questions[0].name,
                type: Packet.TYPE.A,
                class: Packet.CLASS.IN,
                ttl: 300,
                address: this.sinkholeAddress
            });
        }
        return response;
    }

    handleDnsRequest = async (request, send, rinfo) => {
        let response;
        let debug = [];
        // requested domain is in the blacklist
        debug.push("handling " + JSON.stringify(request.questions[0]));
        if (this.blacklist.domains.has(request.questions[0].name)) {
            response = this.createSinkholeResponse(request);
            this.logBlacklistTrigger(request.questions[0].name, rinfo.address);
            debug.push("request triggered blacklist!");
        }
        else {
            response = await RawClient.resolvePacket(request, this.mainDns);
            // the domain resolves to a domain that is in the blacklist (e.g. via CNAME)
            // or the resolved to IP is in the blacklist
            for (let a of response.answers) {
                if (this.blacklist.domains.has(a.name) ||
                    (a.address && this.blacklist.addresses.has(a.address))) {
                    response = this.createSinkholeResponse(request, send);
                    this.logBlacklistTrigger(request.questions[0].name, rinfo.address);
                    debug.push("response triggered blacklist!");
                    break;
                }
            }
        }
        debug.push('sending ' + JSON.stringify(response.answers));
        debug.push('---');
        console.log(debug.join('\n'));
        send(response);
    }

    clearStats = () => {
        this.stats = {};
    }

    logBlacklistTrigger = async (entry, source) =>  {
        return new Promise(resolve => {
            if (!this.stats.hasOwnProperty(entry)) {
                this.stats[entry] = {count: 0, sources: {}};
            }
            if (!this.stats[entry].sources.hasOwnProperty(source)) {
                this.stats[entry].sources[source] = 0;
            }
            this.stats[entry].count++;
            this.stats[entry].sources[source]++;
        });
    }

    start = async () => {
        this.clearStats();
        await this.server.listen({udp: this.port});
        this.#running = true;
    }

    stop = async () => {
        await this.server.close();
        this.#running = false;
    }

    isRunning = () => {
        return this.#running;
    }

    getConfig = () => {
        return {
            dnsPort: this.port,
            sinkholeAddress: this.sinkholeAddress,
            mainDns: this.mainDns
        }
    }

    updateBlacklist = (bl) => {
        this.blacklist = BL.sortBlacklist(bl);
    }
}

export default Sinkhole;