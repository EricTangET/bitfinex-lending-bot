const bitfinext = require("./bitfinex");
const {
  getBalance,
  getCurrentLending,
  cancelAllFundingOffers,
  submitFundingOffer,
  getFundingBook
} = bitfinext;
const { readableLend, toTaipeiTime } = require('./utils');

async function getRate() {
  const EXPECTED_AMOUNT = 50000;
  const RATE_OFFSET = 0.00000001;

  // get funding book
  const offers = (await getFundingBook()).offer;

  let total = 0;
  let idx = 0;
  for (; idx < offers.length; idx++) {
    total += offers[idx][3] * offers[idx][2];
    if (total > EXPECTED_AMOUNT) {
      break;
    }
  }
  const rate =
    idx === offers.length ? offers[idx - 1][0] : offers[idx][0] - RATE_OFFSET;

  return rate;
}

async function getFundingOffers(balance, lending, rate) {
  const MIN_TO_LEND = 50;
  const NUM_ALL_IN = 1100;
  const SPLIT_UNIT = 1000;

  const lendingAmount = lending.reduce((total, c) => total + c.amount, 0);
  let remain = balance - lendingAmount;

  const amounts = [];
  while (remain > NUM_ALL_IN) {
    amounts.push(SPLIT_UNIT);
    remain -= SPLIT_UNIT;
  }

  if (remain <= NUM_ALL_IN && remain >= MIN_TO_LEND) {
    amounts.push(remain);
  }

  return amounts.map(amount => ({
    rate,
    amount
  }));
}

function printStatus(balance, lending, offers) {
  console.log("=========================================================");
  const time = toTaipeiTime();
  console.log(`Time: ${time}`);
  console.log(`Balance: $${balance}`);
  console.log("Status:");
  const items = lending.map(l => ({
    ...readableLend(l),
    executed: true
  }));

  offers.forEach(o => {
    items.push({
      amount: Number(o.amount.toFixed(2)),
      period: 2,
      rate: Number((o.rate * 365).toFixed(4)),
      exp: null,
      executed: false
    });
  });
  if (lending.length) {
    console.table(items);
  }
}

async function main() {
  await cancelAllFundingOffers();

  const balance = await getBalance();
  const lending = await getCurrentLending();
  const rate = await getRate();
  const offers = await getFundingOffers(balance, lending, rate);

  // submit funding offer
  offers.forEach(offer => submitFundingOffer(offer));

  printStatus(balance, lending, offers);
}

main();