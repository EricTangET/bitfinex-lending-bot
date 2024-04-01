const db = require("./db");

async function main() {
  await db.earnings.remove({}, { multi: true });
}

module.exports = main;

if (require.main === module) {
  main();
}
