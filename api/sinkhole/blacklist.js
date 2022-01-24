const ipRegex = require('./ipRegex');

const ipv4reg = ipRegex({ exact: true, includeBoundaries: true });

const sortBlacklist = (bl) => {
    const result = {
        domains: [],
        addresses: []
    };

    for (let e of bl) {
        if (ipv4reg.test(e)) {
            result.addresses.push(e);
        }
        else {
            result.domains.push(e);
        }
    }

    return result;
};

module.exports = {
    sortBlacklist
};