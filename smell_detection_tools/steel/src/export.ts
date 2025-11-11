import { writeFile, readFile } from "fs"
import { Accumulator, Detection, Report, SmelledFile, SmellInfo } from './types';
import { EOL } from "os"
import Mustache from 'mustache';
import { listSmellPackageNames } from "./pluginManager";
import color from "./color";
import { Smell } from "./smell";

interface Quality {
  maintainability: number,
  aggregate: Aggregate
}

interface Aggregate {
  cyclomatic: number,
  cyclomaticDensity: number,
  halstead: Halstead,
  sloc: Sloc
}

interface Halstead {
  bugs: number,
  difficulty: number,
  effort: number,
  length: number,
  time: number,
  vocabulary: number,
  volume: number
}

interface Sloc {
  logical: number,
  physical: number
}

const qualityHeaders = [
  'Physical SLOC',
  'Logical SLOC',
  'Cyclomatic',
  'CyclomaticDensity',
  'HalsteadBugs',         // The number of delivered bugs (B) correlates with the overall complexity of the software.
  'HalsteadDifficulty',   // This parameter shows how difficult to handle the program is.
  'HalsteadEffort',       // Measures the amount of mental activity needed to translate the existing algorithm into implementation in the specified program language.
  'HalsteadLength',       // The total number of operator occurrences and the total number of operand occurrences.
  'HalsteadTime',         // Shows time (in minutes) needed to translate the existing algorithm into implementation in the specified program language.
  'HalsteadVocabulary',   // The total number of unique operator and unique operand occurrences.
  'HalsteadVolume',       // Proportional to program size, represents the size, in bits, of space necessary for storing the program.
  'Maintainability',
];

export function writeToHtml(report: Report, outputPath: string): void {
  readFile(module.path + "/report.html", function(err, data) {
    if (err) throw err;
    let output = Mustache.render(data.toString(), report);

    writeFile(`${outputPath}/${report.project.toLowerCase()}.html`, output, 'utf8', function(err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
    });
  });
}

export function writeToJson(report: Report, outputPath: string): void {
  let jsonContent = JSON.stringify(report);
  writeFile(`${outputPath}/${report.project.toLowerCase()}.json`, jsonContent, 'utf8', function(err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }
  });
}

function getAccumulators(report: Report) {
  return report.smelledFiles.reduce((acc, cur) => {
    cur.smellInfo.forEach(obj => {
      const item = acc.find(i => i.name === obj.packageName);
      if (item) {
        item.total += obj.items.length;
      } else {
        acc.push({ name: obj.packageName, total: obj.items.length ?? 0 });
      }
    });
    return acc;
  }, [] as Accumulator[]);
}

function getMetrics(report: Report) {
  return report.smelledFiles.reduce((acc, cur) => {
    const quality = <Quality>cur.metrics;
    acc.maintainability += quality.maintainability;
    acc.aggregate.cyclomatic += quality.aggregate.cyclomatic;
    acc.aggregate.cyclomaticDensity += quality.aggregate.cyclomaticDensity;
    acc.aggregate.halstead.bugs += quality.aggregate.halstead.bugs;
    acc.aggregate.halstead.difficulty += quality.aggregate.halstead.difficulty;
    acc.aggregate.halstead.effort += quality.aggregate.halstead.effort;
    acc.aggregate.halstead.length += quality.aggregate.halstead.length;
    acc.aggregate.halstead.time += quality.aggregate.halstead.time;
    acc.aggregate.halstead.vocabulary += quality.aggregate.halstead.vocabulary;
    acc.aggregate.halstead.volume += quality.aggregate.halstead.volume;
    acc.aggregate.sloc.logical += quality.aggregate.sloc.logical;
    acc.aggregate.sloc.physical += quality.aggregate.sloc.physical;
    return acc;
  }, {
    maintainability: 0,
    aggregate: {
      cyclomatic: 0,
      cyclomaticDensity: 0,
      halstead: {
        bugs: 0,
        difficulty: 0,
        effort: 0,
        length: 0,
        time: 0,
        vocabulary: 0,
        volume: 0
      },
      sloc: {
        logical: 0,
        physical: 0
      }
    }
  });
}

export function writeResumeCsv(report: Report, outputPath: string): void {
  const plugins = listSmellPackageNames();
  const header = [
    "project",
    "version",
    "total_of_test_files",
    "total_smelled_files",
    "test_methods",
    "test_smells",
    ...plugins,
    ...qualityHeaders
  ];
  const output = [header.join()];
  const row = [];
  row.push(report.project);
  row.push(report.version);
  row.push(report.testSuites);
  row.push(report.smelledTestSuites);
  row.push(report.testCases);
  row.push(report.smells);

  const acc = getAccumulators(report);

  plugins.forEach(plugin => {
    const item = acc.find(i => i.name === plugin);
    const total = item ? item.total : 0;
    row.push(total);
  })

  const metrics = getMetrics(report);

  row.push(metrics.aggregate.sloc.physical);
  row.push(metrics.aggregate.sloc.logical);
  row.push(metrics.aggregate.cyclomatic);
  row.push(metrics.aggregate.cyclomaticDensity);
  row.push(metrics.aggregate.halstead.bugs);
  row.push(metrics.aggregate.halstead.difficulty);
  row.push(metrics.aggregate.halstead.effort);
  row.push(metrics.aggregate.halstead.length);
  row.push(metrics.aggregate.halstead.time);
  row.push(metrics.aggregate.halstead.vocabulary);
  row.push(metrics.aggregate.halstead.volume);
  row.push(metrics.maintainability);

  output.push(row.join());

  writeFile(`${outputPath}/${report.project.toLowerCase()}-resume.csv`, output.join(EOL), 'utf8', function(err) {
    if (err) {
      console.log("An error occured while writing data to csv file.");
      return console.log(err);
    }
  });
}

export function writeDetailedCsv(report: Report, outputPath: string): void {
  const plugins = listSmellPackageNames();
  const output = ['FileName, TotalMethods, TotalTestSmells,' + qualityHeaders.join() + ',' + plugins.join()];
  report.smelledFiles.forEach(file => {
    const row: any[] = [];
    const quality = <Quality>file.metrics;
    const smellInfo = <SmellInfo[]>file.smellInfo;
    row.push(file.path);
    row.push(file.testCases);
    row.push(file.smellInfo.length);
    row.push(quality.aggregate.sloc.physical);
    row.push(quality.aggregate.sloc.logical);
    row.push(quality.aggregate.cyclomatic);
    row.push(quality.aggregate.cyclomaticDensity);
    row.push(quality.aggregate.halstead.bugs);
    row.push(quality.aggregate.halstead.difficulty);
    row.push(quality.aggregate.halstead.effort);
    row.push(quality.aggregate.halstead.length);
    row.push(quality.aggregate.halstead.time);
    row.push(quality.aggregate.halstead.vocabulary);
    row.push(quality.aggregate.halstead.volume);
    row.push(quality.maintainability);

    let smellsCount: number[] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    smellInfo.forEach(element => {
      switch (element.name) {
        case "Assertion Roulette":
          smellsCount[0] = element.items.length;
          break;
        case "Conditional Test Logic":
          smellsCount[1] = element.items.length;
          break;
        case "Duplicate Assert":
          smellsCount[2] = element.items.length;
          break;
        case "Eager Test":
          smellsCount[3] = element.items.length;
          break;
        case "Empty Test":
          smellsCount[4] = element.items.length;
          break;
        case "Exception Handling":
          smellsCount[5] = element.items.length;
          break;
        case "Global Variable":
          smellsCount[6] = element.items.length;
          break;
        case "Ignored Test":
          smellsCount[7] = element.items.length;
          break;
        case "Lazy Test":
          smellsCount[8] = element.items.length;
          break;
        case "Magic Number":
          smellsCount[9] = element.items.length;
          break;
        case "Mystery Guest":
          smellsCount[10] = element.items.length;
          break;
        case "Redundant Assertion":
          smellsCount[11] = element.items.length;
          break;
        case "Redundant Print":
          smellsCount[12] = element.items.length;
          break;
        case "Resource Optimism":
          smellsCount[13] = element.items.length;
          break;
        case "Sleepy Test":
          smellsCount[14] = element.items.length;
          break;
        case "Unknown Test":
          smellsCount[15] = element.items.length;
          break;
        default:
          break;
      }
    });
    row.push(...smellsCount);
    output.push(row.join());
  });
  writeFile(`${outputPath}/${report.project.toLowerCase()}-detailed.csv`, output.join(EOL), "utf8", function(err) {
    if (err) {
      console.log("An error occured while writing data to csv file.");
      return console.log(err);
    }
  });
}

export function writeValidationCsv(report: Report, outputPath: string): void {
  const output: any = [];
  output.push(
    [
      'Filename',
      'Smell',
      'Line',
      'Correct?',
      'Estimated',
      'Note',
    ].join(',')
  );
  const row: any[] = [];
  report.smelledFiles.forEach(file => {
    const smellInfo = <SmellInfo[]>file.smellInfo;
    smellInfo.forEach(element => {
      element.items.forEach(smell => {
        row.push(file.path);
        row.push(element.name);
        row.push(smell.start.line);
        row.push('');
        row.push('P');
        row.push('');
        output.push(row.join(','));
        row.splice(0);
      });
    });
  });
  writeFile(`${outputPath}/${report.project.toLowerCase()}-validation.csv`, output.join(EOL), "utf8", function(err) {
    if (err) {
      console.log("An error occured while writing data to csv file.");
      return console.log(err);
    }
  });
}

export function output(results: Detection[]): void {

}

export function printReport(report: Report, display: boolean) {
  if (!display) return;
  report.smelledFiles.forEach((smelled: SmelledFile) => {
    console.log("");
    console.log("File: " + smelled.path);
    smelled.smellInfo.forEach(smell => {
      console.log("");
      console.log(color.fg.red + `\u270B ${smell.name} test smell`, color.reset); //270B //2622
      smell.items.forEach((item: Smell) => {
        console.log("");
        console.log(color.fg.yellow + smelled.path + color.reset +
          color.fg.cyan + `:${item.start.line}:${item.start.column}` + color.reset);
        console.log(item.frame);
      });

    });
    console.log("--------------------------------------------------------------------------------");
    console.log("");
    console.log(`Found ${smelled.smells} possible test smell${smelled.smells > 1 ? "s" : ""}.`);
    console.log("================================================================================");
  });
}
