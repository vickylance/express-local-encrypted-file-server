const { networkInterfaces } = require("os");

const nets = networkInterfaces();

function getAddresses() {
  const results = Object.create({}); // Or just '{}', an empty object
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  return results;
}

function getLocalIp() {
  return getAddresses()["en0"][0];
}

module.exports = {
  getAddresses,
  getLocalIp,
};
