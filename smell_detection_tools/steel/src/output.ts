import color from "./color";
import { Smell } from "./smell";
import { Accumulator, Report, SmelledFile } from "./types";


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

export function printSummary(report: Report, outputPath: string) {
  const accumulators = report.smelledFiles.reduce((acc, cur) => {
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

  console.log("");
  console.log("✓ Test file analysis completed");
  console.log(`✓ Detected ${report.smells} test smells across ${report.smelledTestSuites} files`);
  console.log(`✓ Reports exported successfully to: ${outputPath}`);
  console.log("");
  console.log("📊 Summary:");
  console.log(`   - Test files analyzed: ${report.testSuites}`);
  console.log(`   - Test files with smells: ${report.smelledTestSuites}`);
  console.log(`   - Total test methods: ${report.testCases}`);
  console.log(`   - Total smells detected: ${report.smells}`);

  if (accumulators.length > 0) {
    console.log("   - Smells by type:");
    accumulators
      .sort((a, b) => b.total - a.total)
      .forEach(acc => {
        console.log(`     • ${acc.name}: ${acc.total}`);
      });
  }
  console.log("");
}
