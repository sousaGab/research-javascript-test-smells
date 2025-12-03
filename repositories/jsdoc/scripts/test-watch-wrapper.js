#!/usr/bin/env node
/*
  Wrapper to run the project's test-watch behavior (c8 + npm test) and then
  print the saved test summary produced by the Jasmine reporter.

  This ensures the coverage summary (printed by c8 after the tests) appears
  before the test summary (saved to `test-summary.txt` by the reporter).
*/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const C8 = 'npx';
const args = [
  'c8',
  '--exclude=Herebyfile.js',
  "--exclude=**/test{,s}/**",
  '--reporter=text-summary',
  'npm',
  'test',
];

// Run c8 wrapping npm test; inherit stdio so live test output and coverage
// summary appear as usual (except our reporter wrote the final test summary
// to a file).
const result = spawnSync(C8, args, { stdio: 'inherit', shell: false });

// After the command completes, print the saved test summary (if present).
const summaryPath = path.resolve(process.cwd(), 'test-summary.txt');
if (fs.existsSync(summaryPath)) {
  try {
    const contents = fs.readFileSync(summaryPath, { encoding: 'utf8' });
    // Ensure a blank line separates coverage from test summary.
    process.stdout.write('\n');
    process.stdout.write(contents);
    // Optionally remove the file so repeated runs start fresh.
    try { fs.unlinkSync(summaryPath); } catch (e) {}
  } catch (e) {
    // ignore read errors
  }
}

process.exit(result.status || 0);
