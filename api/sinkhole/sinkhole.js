import dns from "dns";
import RawClient from "./raw-client.js";
import BL from "./blacklist.js";
import dns2 from "dns2";

const { Packet } = dns2;

class Sinkhole {
    #running = false;

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
        response.answers.push({
            name: request.questions[0].name,
            type: Packet.TYPE.A,
            class: Packet.CLASS.IN,
            ttl: 300,
            address: this.sinkholeAddress
        });
        return response;
    }

    handleDnsRequest = async (request, send, rinfo) => {
        let response;
        // requested domain is in the blacklist
        if (this.blacklist.domains.includes(request.questions[0].name)) {
            response = this.createSinkholeResponse(request);
        }
        else {
            response = await RawClient.resolvePacket(request, this.mainDns);
            // the domain resolves to a domain that is in the blacklist (e.g. via CNAME)
            // or the resolved to IP is in the blacklist
            for (let a of response.answers) {
                if (this.blacklist.domains.includes(a.name) ||
                    (a.address && this.blacklist.addresses.includes(a.address))) {
                    response = this.createSinkholeResponse(request, send);
                    break;
                }
            }
        }
        send(response);
    }

    start = async () => {
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