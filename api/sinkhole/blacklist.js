const ipRegex = require('./ipRegex');
const fetch = require('node-fetch')

const ipv4reg = ipRegex({exact: true, includeBoundaries: true});

const sortBlacklist = (bl) => {
    const result = {
        domains: [],
        addresses: []
    };

    for (let e of bl) {
        if (ipv4reg.test(e)) {
            result.addresses.push(e);
        } else {
            result.domains.push(e);
        }
    }

    return result;
};

const getRawBlacklistFromText = (text) => {
    let processedList = []
    for (let line of text.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g)) {
        line = line.trim()
        if (line.length && !line.startsWith('#')) {
            processedList.push(line)
        }
    }
    return processedList
};

const getRawBlacklistFromUrl = async (url) => {
    let testRes = await ((await fetch(url)).text())
    return getRawBlacklistFromText(testRes)
};

module.exports = {
    sortBlacklist,
    getRawBlacklistFromUrl
};