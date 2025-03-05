/**
 * @typedef {import("node:test/reporters").TestEvent} TestEvent
 */

import { makeBadge } from "badge-maker";

const percentFormat = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 0,
});

/**
 * @param {number} p
 * @returns {string}
 */
function formatPercentage(p) {
  return percentFormat.format(p);
}

/**
 * @param {AsyncIterable<TestEvent, void>} source
 * @yields {string}
 */
export default async function* coverageBadgeReporter(source) {
  for await (const event of source) {
    switch (event.type) {
      case "test:coverage": {
        const { coveredLineCount, totalLineCount } = event.data.summary.totals;
        const message = formatPercentage(coveredLineCount / totalLineCount);
        const badge = makeBadge({ label: "coverage", message });

        yield badge;

        break;
      }
    }
  }
}
