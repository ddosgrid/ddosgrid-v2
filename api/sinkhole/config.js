import fs from "fs";
import path from "path";
import dns from "dns";
import {networkInterfaces} from "os";
import Ajv from "ajv";
import dirname from 'ususdirname'

const __dirname = dirname()
const ajv = new Ajv();

const configSchema = {
    type: "object",
    properties: {
        dnsPort: {type: "integer"},
        sinkholeAddress: {type: "string"},
        mainDns: {type: "string"}
    },
    required: [],
    additionalProperties: false
};
const blacklistSchema = {
    type: "object",
    properties: {
        mode: {type: "string"},
        url: {type: ["string", "null"]},
        data: {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
};

const validateConfig = ajv.compile(configSchema);
const validateBlacklist = ajv.compile(blacklistSchema);

const configPath = path.resolve(__dirname, '../data/sinkhole/config.json');
const blacklistPath = path.resolve(__dirname, '../data/sinkhole/blacklist.json');
// this is just the first lan ipv4, however this might not always be what the user wants,
// but it should be fine for a default setting
const lanIP = Object.values(networkInterfaces()).flat().find(i => i.family == 'IPv4' && !i.internal).address;

const defaultConfig = {
    dnsPort: 5333,
    sinkholeAddress: lanIP,
    mainDns: dns.getServers()[0]
};
const defaultBlacklist = {
    url: null,
    mode: 'manual',
    data: []
};

function loadConfig() {
    if (!fs.existsSync(configPath)) {
        fs.mkdirSync(path.dirname(configPath), {recursive: true});
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig));
        return defaultConfig;
    }
    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(config) {
    if (!validateConfig(config)) {
        throw validateConfig.errors;
    }
    if (!fs.existsSync(configPath)) {
        fs.mkdirSync(path.dirname(configPath), {recursive: true});
    }
    fs.writeFileSync(configPath, JSON.stringify(config));
}

function loadBlacklist() {
    if (!fs.existsSync(blacklistPath)) {
        fs.mkdirSync(path.dirname(blacklistPath), {recursive: true});
        fs.writeFileSync(blacklistPath, JSON.stringify(defaultBlacklist));
        return defaultBlacklist;
    }
    return JSON.parse(fs.readFileSync(blacklistPath));
}

function saveBlacklist(bl) {
    if (!validateBlacklist(bl)) {
        throw validateBlacklist.errors;
    }
    if (!fs.existsSync(blacklistPath)) {
        fs.mkdirSync(path.dirname(blacklistPath), {recursive: true});
    }
    fs.writeFileSync(blacklistPath, JSON.stringify(bl));
}

export default {
    loadConfig,
    saveConfig,
    loadBlacklist,
    saveBlacklist
};