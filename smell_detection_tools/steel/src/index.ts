#! /usr/bin/env node

import figlet from 'figlet';
import { Command } from 'commander';
import run from './detector';
import { printReport } from './output';
import { writeDetailedCsv, writeResumeCsv, writeToHtml, writeToJson } from './export';

const program = new Command();

console.log(figlet.textSync('STEEL'))

program
  .version('3.0.0')
  .description('teST smElls dEtection tooL')
  .option('-d, --display', 'display report in terminal')
  .option('-o, --output <path>', 'target path for reports', '.')
  .command('detect <pattern>')
  .description('detect test smells for glob pattern. i.e.: "**/*.test.js"')
  .action((pattern) => {
    const report = run(pattern);
    if (report.isLeft()) {
      console.log(report.value.message);
      return;
    }
    printReport(report.value, program.opts().display);
    writeToHtml(report.value, program.opts().output);
    writeToJson(report.value, program.opts().output);
    writeResumeCsv(report.value, program.opts().output);
    writeDetailedCsv(report.value, program.opts().output);
  });

program.parse(process.argv);
