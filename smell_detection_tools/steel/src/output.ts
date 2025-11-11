import color from "./color";
import { Smell } from "./smell";
import { Report, SmelledFile } from "./types";


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
