const NodeCache = require("node-cache");
const cache = new NodeCache();

async function main() {
  cache.del("data");
}

module.exports = main;

if (require.main === module) {
  main();
}
