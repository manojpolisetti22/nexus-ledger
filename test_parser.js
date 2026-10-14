import { parseLocally } from './src/utils/aiParser.js';

const testCases = [
  "Paid 150 for office supplies",
  "Gas $48 at Chevron",
  "Client lunch $65 yesterday",
  "Spent 35.50 on printer ink at Staples",
  "Paid Dave 250 for website maintenance",
  "Uber ride $24.80 to airport",
  "Software subscription 29 dollars"
];

console.log("=== RUNNING PARSER UNIT TESTS ===\n");
let passed = 0;

testCases.forEach((tc, i) => {
  const result = parseLocally(tc);
  console.log(`Test #${i + 1}: "${tc}"`);
  console.log(`  -> Amount: $${result.amount}`);
  console.log(`  -> Payee: ${result.payee}`);
  console.log(`  -> Category: ${result.category}`);
  console.log(`  -> Date: ${result.date}`);
  console.log(`  -> Notes: "${result.notes}"`);
  console.log("------------------------------------------");

  if (result.amount > 0 && result.category && result.payee) {
    passed++;
  }
});

console.log(`\nResults: ${passed}/${testCases.length} tests passed successfully!`);
if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
