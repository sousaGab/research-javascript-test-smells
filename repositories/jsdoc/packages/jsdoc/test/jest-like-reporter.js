import fs from 'node:fs';
import path from 'node:path';

class JestLikeReporter {
  constructor() {
    this.startTime = 0;
    this.suitesTotal = 0;
    this.suitesPassed = 0;
    this.suitesFailed = 0;
    this.specsTotal = 0;
    this.specsPassed = 0;
    this.specsFailed = 0;
    this.specsPending = 0;
  }

  jasmineStarted(suiteInfo) {
    this.startTime = Date.now();
    if (typeof suiteInfo === 'object' && suiteInfo.totalSpecsDefined != null) {
      this.specsTotal = suiteInfo.totalSpecsDefined;
    }
  }

  suiteStarted(/* result */) {
    this.suitesTotal += 1;
  }

  suiteDone(result) {
    if (result && result.failedExpectations && result.failedExpectations.length > 0) {
      this.suitesFailed += 1;
    } else {
      this.suitesPassed += 1;
    }
  }

  specDone(result) {
    if (!result) return;
    const status = result.status;
    if (status === 'passed') {
      this.specsPassed += 1;
    } else if (status === 'failed') {
      this.specsFailed += 1;
    } else if (status === 'pending' || status === 'disabled') {
      this.specsPending += 1;
    }
  }

  jasmineDone() {
    const endTime = Date.now();
    const durationMs = endTime - this.startTime;
    const durationSec = (durationMs / 1000).toFixed(3);

    // If specsTotal was not provided earlier, compute from counts.
    const totalSpecs = this.specsTotal || (this.specsPassed + this.specsFailed + this.specsPending);

    // Build a Jest-like summary string instead of printing immediately.
    const lines = [];
    lines.push('');
    lines.push(`Test Suites: ${this.suitesPassed} passed, ${this.suitesTotal} total`);
    lines.push(`Tests:       ${this.specsPassed} passed, ${totalSpecs} total`);
    lines.push('Snapshots:   0 passed, 0 total');
    lines.push(`Time:        ${durationSec} s`);
    if (this.suitesFailed === 0 && this.specsFailed === 0) {
      lines.push('Ran all test suites.');
    }

    const summary = lines.join('\n') + '\n';

    // Write the summary to a file in the current working directory so a wrapper
    // script can print it after coverage output (which c8 prints after tests).
    const outPath = path.resolve(process.cwd(), 'test-summary.txt');
    try {
      fs.writeFileSync(outPath, summary, { encoding: 'utf8' });
    } catch (e) {
      // If writing fails, fall back to printing immediately so the user still
      // sees test results.
      // eslint-disable-next-line no-console
      console.log(summary);
    }

    // Optionally print immediately when requested.
    if (process.env.PRINT_TEST_SUMMARY_IMMEDIATE) {
      // eslint-disable-next-line no-console
      console.log(summary);
    }
  }
}

export default JestLikeReporter;
